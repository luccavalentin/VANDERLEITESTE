import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CEPInput } from "@/components/CEPInput";
import { CPFCNPJInput } from "@/components/CPFCNPJInput";
import { Plus, Search, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Cliente {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  cpf_cnpj?: string | null;
}

interface ClienteAutocompleteProps {
  value: string | null;
  onChange: (clienteId: string | null) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  showNovoButton?: boolean;
  onNovoCliente?: () => void;
}

export function ClienteAutocomplete({
  value,
  onChange,
  label = "Cliente",
  required = false,
  placeholder = "Digite o nome do cliente...",
  showNovoButton = true,
  onNovoCliente: onNovoCliente,
}: ClienteAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isNovoClienteOpen, setIsNovoClienteOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: clientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome, telefone, email, cpf_cnpj')
        .order('nome');
      if (error) throw error;
      return (data || []) as Cliente[];
    },
    staleTime: 10 * 60 * 1000, // Cache por 10 minutos
  });

  // Buscar o nome do cliente selecionado
  const clienteSelecionado = clientes?.find(c => c.id === value);

  // Filtrar clientes baseado no termo de busca
  const clientesFiltrados = clientes?.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Atualizar o campo de busca quando o cliente selecionado mudar
  useEffect(() => {
    if (clienteSelecionado) {
      setSearchTerm(clienteSelecionado.nome);
    } else if (!value) {
      setSearchTerm("");
    }
  }, [value, clienteSelecionado]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        // Restaurar o nome do cliente selecionado se houver
        if (clienteSelecionado && searchTerm !== clienteSelecionado.nome) {
          setSearchTerm(clienteSelecionado.nome);
        } else if (!value) {
          setSearchTerm("");
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchTerm, clienteSelecionado, value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsOpen(term.length > 0);
    
    // Se o usuário apagar tudo, limpar a seleção
    if (term.length === 0) {
      onChange(null);
    }
  };

  const handleSelectCliente = (cliente: Cliente) => {
    onChange(cliente.id);
    setSearchTerm(cliente.nome);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchTerm("");
    onChange(null);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleNovoCliente = () => {
    setIsNovoClienteOpen(true);
  };

  // Estado do formulário de novo cliente
  const [novoClienteForm, setNovoClienteForm] = useState({
    nome: "",
    tipo: "pf" as "pf" | "pj",
    cpf_cnpj: "",
    telefone: "",
    email: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    cidade: "",
    estado: "",
    status: "ativo" as "ativo" | "inativo",
  });

  // Mutation para criar novo cliente
  const createClienteMutation = useMutation({
    mutationFn: async (data: typeof novoClienteForm) => {
      const { data: novoCliente, error } = await supabase
        .from('clientes')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return novoCliente;
    },
    onSuccess: (novoCliente) => {
      // Invalidar cache para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      
      // Selecionar automaticamente o novo cliente
      onChange(novoCliente.id);
      setSearchTerm(novoCliente.nome);
      
      // Fechar o dialog
      setIsNovoClienteOpen(false);
      
      // Limpar formulário
      setNovoClienteForm({
        nome: "",
        tipo: "pf",
        cpf_cnpj: "",
        telefone: "",
        email: "",
        cep: "",
        endereco: "",
        numero: "",
        complemento: "",
        cidade: "",
        estado: "",
        status: "ativo",
      });
      
      toast.success("Cliente cadastrado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao cadastrar cliente", {
        description: error.message || "Tente novamente",
      });
    },
  });

  const handleEnderecoEncontrado = (endereco: {
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
  }) => {
    setNovoClienteForm({
      ...novoClienteForm,
      endereco: endereco.logradouro || novoClienteForm.endereco,
      complemento: endereco.complemento || novoClienteForm.complemento,
      cidade: endereco.localidade || novoClienteForm.cidade,
      estado: endereco.uf || novoClienteForm.estado,
    });
  };

  const handleSubmitNovoCliente = (e: React.FormEvent) => {
    e.preventDefault();
    createClienteMutation.mutate(novoClienteForm);
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor="cliente-autocomplete">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              id="cliente-autocomplete"
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={() => {
                if (searchTerm.length > 0) {
                  setIsOpen(true);
                }
              }}
              className="pl-10 pr-10"
              required={required}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* Dropdown de sugestões */}
          {isOpen && searchTerm.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto"
            >
              {clientesFiltrados.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  👉 Nenhum cliente encontrado.
                </div>
              ) : (
                <ul className="py-1">
                  {clientesFiltrados.map((cliente) => (
                    <li
                      key={cliente.id}
                      onClick={() => handleSelectCliente(cliente)}
                      className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{cliente.nome}</span>
                        {cliente.cpf_cnpj && (
                          <span className="text-xs text-muted-foreground">{cliente.cpf_cnpj}</span>
                        )}
                      </div>
                      {cliente.telefone && (
                        <span className="text-xs text-muted-foreground ml-2">{cliente.telefone}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {showNovoButton && (
          <Dialog open={isNovoClienteOpen} onOpenChange={setIsNovoClienteOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" className="gap-2 whitespace-nowrap">
                <Plus className="h-4 w-4" />
                Novo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Cliente</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitNovoCliente} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="novo-nome">Nome</Label>
                    <Input
                      id="novo-nome"
                      value={novoClienteForm.nome}
                      onChange={(e) => setNovoClienteForm({ ...novoClienteForm, nome: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="novo-tipo">Tipo</Label>
                    <Select
                      value={novoClienteForm.tipo}
                      onValueChange={(value: "pf" | "pj") => setNovoClienteForm({ ...novoClienteForm, tipo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pf">Pessoa Física</SelectItem>
                        <SelectItem value="pj">Pessoa Jurídica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <CPFCNPJInput
                      value={novoClienteForm.cpf_cnpj}
                      onChange={(valor) => setNovoClienteForm({ ...novoClienteForm, cpf_cnpj: valor })}
                      tipo={novoClienteForm.tipo === "pf" ? "cpf" : "cnpj"}
                      label={novoClienteForm.tipo === "pf" ? "CPF" : "CNPJ"}
                      placeholder={novoClienteForm.tipo === "pf" ? "000.000.000-00" : "00.000.000/0000-00"}
                      disabled={createClienteMutation.isPending}
                    />
                  </div>
                  <div>
                    <Label htmlFor="novo-telefone">Telefone</Label>
                    <Input
                      id="novo-telefone"
                      value={novoClienteForm.telefone}
                      onChange={(e) => setNovoClienteForm({ ...novoClienteForm, telefone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="novo-email">Email</Label>
                    <Input
                      id="novo-email"
                      type="email"
                      value={novoClienteForm.email}
                      onChange={(e) => setNovoClienteForm({ ...novoClienteForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <CEPInput
                      value={novoClienteForm.cep}
                      onChange={(cep) => setNovoClienteForm({ ...novoClienteForm, cep })}
                      onEnderecoEncontrado={handleEnderecoEncontrado}
                      label="CEP"
                      disabled={createClienteMutation.isPending}
                    />
                  </div>
                  <div>
                    <Label htmlFor="novo-status">Status</Label>
                    <Select
                      value={novoClienteForm.status}
                      onValueChange={(value: "ativo" | "inativo") => setNovoClienteForm({ ...novoClienteForm, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="novo-endereco">Endereço</Label>
                    <Input
                      id="novo-endereco"
                      value={novoClienteForm.endereco}
                      onChange={(e) => setNovoClienteForm({ ...novoClienteForm, endereco: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="novo-numero">Número</Label>
                    <Input
                      id="novo-numero"
                      value={novoClienteForm.numero}
                      onChange={(e) => setNovoClienteForm({ ...novoClienteForm, numero: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="novo-complemento">Complemento</Label>
                    <Input
                      id="novo-complemento"
                      value={novoClienteForm.complemento}
                      onChange={(e) => setNovoClienteForm({ ...novoClienteForm, complemento: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="novo-cidade">Cidade</Label>
                    <Input
                      id="novo-cidade"
                      value={novoClienteForm.cidade}
                      onChange={(e) => setNovoClienteForm({ ...novoClienteForm, cidade: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="novo-estado">Estado</Label>
                    <Input
                      id="novo-estado"
                      value={novoClienteForm.estado}
                      onChange={(e) => setNovoClienteForm({ ...novoClienteForm, estado: e.target.value.toUpperCase() })}
                      maxLength={2}
                      placeholder="Ex: SP"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsNovoClienteOpen(false);
                      setNovoClienteForm({
                        nome: "",
                        tipo: "pf",
                        cpf_cnpj: "",
                        telefone: "",
                        email: "",
                        cep: "",
                        endereco: "",
                        numero: "",
                        complemento: "",
                        cidade: "",
                        estado: "",
                        status: "ativo",
                      });
                    }}
                    disabled={createClienteMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createClienteMutation.isPending}>
                    {createClienteMutation.isPending ? "Cadastrando..." : "Cadastrar Cliente"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

