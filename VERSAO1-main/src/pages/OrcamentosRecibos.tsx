import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, Search, Edit, Trash2, Download } from "lucide-react";
import { ClienteSelector } from "@/components/Processos/ClienteSelector";
import { formatarMoeda } from "@/lib/validations";

export default function OrcamentosRecibos() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState<"orcamento" | "recibo">("orcamento");
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null);
  const [itens, setItens] = useState<Array<{descricao: string; quantidade: number; valorUnitario: number}>>([
    { descricao: "", quantidade: 1, valorUnitario: 0 }
  ]);

  const { data: documentos = [] } = useQuery({
    queryKey: ["orcamentos_recibos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orcamentos_recibos")
        .select("*, clientes(nome)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: any) => {
      const { error } = await supabase.from("orcamentos_recibos").insert([formData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos_recibos"] });
      toast({ 
        title: `${tipoDocumento === "orcamento" ? "Orçamento" : "Recibo"} criado com sucesso!`,
        className: "bg-success text-success-foreground border-success"
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ 
        title: "Erro ao criar documento",
        variant: "destructive"
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("orcamentos_recibos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos_recibos"] });
      toast({ 
        title: "Documento excluído com sucesso!",
        className: "bg-success text-success-foreground border-success"
      });
    },
    onError: () => {
      toast({ 
        title: "Erro ao excluir documento",
        variant: "destructive"
      });
    },
  });

  const resetForm = () => {
    setSelectedClienteId(null);
    setItens([{ descricao: "", quantidade: 1, valorUnitario: 0 }]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const valorTotal = itens.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0);

    const data = {
      numero: formData.get("numero"),
      tipo: tipoDocumento,
      cliente_id: selectedClienteId,
      itens: itens,
      valor_total: valorTotal,
      data_emissao: formData.get("data_emissao"),
      data_vencimento: formData.get("data_vencimento") || null,
      status: formData.get("status"),
      observacoes: formData.get("observacoes") || null,
    };

    createMutation.mutate(data);
  };

  const adicionarItem = () => {
    setItens([...itens, { descricao: "", quantidade: 1, valorUnitario: 0 }]);
  };

  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const atualizarItem = (index: number, campo: string, valor: any) => {
    const novosItens = [...itens];
    novosItens[index] = { ...novosItens[index], [campo]: valor };
    setItens(novosItens);
  };

  const filteredDocumentos = documentos.filter((doc: any) =>
    doc.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.clientes?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const valorTotalItens = itens.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <FileText className="h-8 w-8 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">Orçamentos e Recibos</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 whitespace-nowrap">
              <Plus className="h-4 w-4" />
              Novo Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Documento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select value={tipoDocumento} onValueChange={(v: any) => setTipoDocumento(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="orcamento">Orçamento</SelectItem>
                      <SelectItem value="recibo">Recibo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero">Número *</Label>
                  <Input id="numero" name="numero" required placeholder="Ex: 001/2024" />
                </div>
              </div>

              <ClienteSelector value={selectedClienteId} onChange={setSelectedClienteId} />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Itens *</Label>
                  <Button type="button" variant="outline" size="sm" onClick={adicionarItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Item
                  </Button>
                </div>
                {itens.map((item, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-6">
                        <Label>Descrição</Label>
                        <Input
                          value={item.descricao}
                          onChange={(e) => atualizarItem(index, "descricao", e.target.value)}
                          placeholder="Descrição do item"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Qtd</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantidade}
                          onChange={(e) => atualizarItem(index, "quantidade", parseInt(e.target.value) || 1)}
                          required
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Label>Valor Unit.</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.valorUnitario}
                          onChange={(e) => atualizarItem(index, "valorUnitario", parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                      <div className="md:col-span-1 flex items-end">
                        {itens.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removerItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Subtotal: {formatarMoeda(item.quantidade * item.valorUnitario)}
                    </p>
                  </Card>
                ))}
                <div className="flex justify-end">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-2xl font-bold">{formatarMoeda(valorTotalItens)}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_emissao">Data de Emissão *</Label>
                  <Input
                    id="data_emissao"
                    name="data_emissao"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_vencimento">Data de Vencimento</Label>
                  <Input id="data_vencimento" name="data_vencimento" type="date" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select name="status" required defaultValue="pendente">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" name="observacoes" rows={3} />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Salvar Documento</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 md:p-4">Nº</th>
              <th className="text-left p-3 md:p-4 hidden md:table-cell">Cliente</th>
              <th className="text-left p-3 md:p-4">Tipo</th>
              <th className="text-left p-3 md:p-4 hidden sm:table-cell">Valor</th>
              <th className="text-left p-3 md:p-4 hidden lg:table-cell">Data</th>
              <th className="text-left p-3 md:p-4">Status</th>
              <th className="text-left p-3 md:p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocumentos.map((doc: any) => (
              <tr key={doc.id} className="border-b hover:bg-muted/50">
                <td className="p-3 md:p-4 font-medium">{doc.numero}</td>
                <td className="p-3 md:p-4 hidden md:table-cell">{doc.clientes?.nome || "Sem cliente"}</td>
                <td className="p-3 md:p-4 capitalize">{doc.tipo}</td>
                <td className="p-3 md:p-4 hidden sm:table-cell">{formatarMoeda(doc.valor_total)}</td>
                <td className="p-3 md:p-4 hidden lg:table-cell">
                  {new Date(doc.data_emissao).toLocaleDateString("pt-BR")}
                </td>
                <td className="p-3 md:p-4">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    doc.status === "pago" ? "bg-success/10 text-success" :
                    doc.status === "aprovado" ? "bg-blue-500/10 text-blue-500" :
                    doc.status === "cancelado" ? "bg-destructive/10 text-destructive" :
                    "bg-warning/10 text-warning"
                  }`}>
                    {doc.status}
                  </span>
                </td>
                <td className="p-3 md:p-4">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="hidden sm:flex">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredDocumentos.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum documento encontrado
          </div>
        )}
      </div>
    </div>
  );
}
