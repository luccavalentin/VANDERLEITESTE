"use client"

import type React from "react"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { BotaoVoltar } from "@/components/BotaoVoltar"
import { Plus, Edit, Trash2, Users, UserCheck, UserX, Download, FileSpreadsheet } from "lucide-react"
import { gerarPDFRelatorio } from "@/lib/pdf-utils"
import { gerarExcelRelatorio } from "@/lib/excel-utils"
import { CEPInput } from "@/components/CEPInput"
import { CPFCNPJInput } from "@/components/CPFCNPJInput"

interface Cliente {
  id: string
  nome: string
  tipo: "pf" | "pj"
  cpf_cnpj: string | null
  telefone: string
  email: string | null
  cep: string
  endereco: string
  numero: string | null
  complemento: string | null
  cidade: string
  estado: string
  status: "ativo" | "inativo"
}

export default function Clientes() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [busca, setBusca] = useState("")

  const [formData, setFormData] = useState<{
    nome: string
    tipo: "pf" | "pj"
    cpf_cnpj: string
    telefone: string
    email: string
    cep: string
    endereco: string
    numero: string
    complemento: string
    cidade: string
    estado: string
    status: "ativo" | "inativo"
  }>({
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
  })

  const { data: clientes, isLoading, error: queryError } = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clientes").select("*").order("nome", { ascending: true })
      if (error) {
        console.error("Erro ao buscar clientes:", error)
        throw error
      }
      console.log("Clientes carregados:", data?.length || 0)
      return data as Cliente[]
    },
    retry: 1,
  })

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Cliente, "id">) => {
      const { error } = await supabase.from("clientes").insert(data)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] })
      toast.success("Cliente criado com sucesso!")
      setOpen(false)
      resetForm()
    },
    onError: () => {
      toast.error("Erro ao criar cliente")
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Cliente) => {
      const { error } = await supabase.from("clientes").update(data).eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] })
      toast.success("Cliente atualizado com sucesso!")
      setOpen(false)
      resetForm()
    },
    onError: () => {
      toast.error("Erro ao atualizar cliente")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clientes").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] })
      toast.success("Cliente excluído com sucesso!")
    },
    onError: () => {
      toast.error("Erro ao excluir cliente")
    },
  })

  const resetForm = () => {
    setFormData({
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
    })
    setEditingCliente(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Nenhum campo é obrigatório - pode salvar com dados parciais
    if (editingCliente) {
      updateMutation.mutate({ ...formData, id: editingCliente.id } as Cliente)
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEnderecoEncontrado = (endereco: {
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
  }) => {
    setFormData({
      ...formData,
      endereco: endereco.logradouro || formData.endereco,
      complemento: endereco.complemento || formData.complemento,
      cidade: endereco.localidade || formData.cidade,
      estado: endereco.uf || formData.estado,
    });
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setFormData({
      nome: cliente.nome,
      tipo: cliente.tipo,
      cpf_cnpj: cliente.cpf_cnpj || "",
      telefone: cliente.telefone,
      email: cliente.email || "",
      cep: cliente.cep,
      endereco: cliente.endereco,
      numero: cliente.numero || "",
      complemento: cliente.complemento || "",
      cidade: cliente.cidade,
      estado: cliente.estado,
      status: cliente.status,
    })
    setOpen(true)
  }

  const clientesFiltrados = clientes?.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.cpf_cnpj?.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.telefone.toLowerCase().includes(busca.toLowerCase()),
  )

  const clientesAtivos = clientes?.filter((c) => c.status === "ativo").length || 0
  const clientesInativos = clientes?.filter((c) => c.status === "inativo").length || 0

  const handleExportarPDF = () => {
    const dadosFormatados = (clientesFiltrados || []).map(cliente => ({
      'Nome': cliente.nome,
      'Tipo': cliente.tipo === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica',
      'CPF/CNPJ': cliente.cpf_cnpj || '-',
      'Telefone': cliente.telefone,
      'Email': cliente.email || '-',
      'Cidade': cliente.cidade,
      'Estado': cliente.estado,
      'Status': cliente.status === 'ativo' ? 'Ativo' : 'Inativo',
    }));

    gerarPDFRelatorio({
      titulo: 'Relatório de Clientes',
      dados: dadosFormatados,
      colunas: ['Nome', 'Tipo', 'CPF/CNPJ', 'Telefone', 'Email', 'Cidade', 'Estado', 'Status'],
    });
  };

  const handleExportarExcel = () => {
    const dadosFormatados = (clientesFiltrados || []).map(cliente => ({
      nome: cliente.nome,
      tipo: cliente.tipo === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica',
      cpf_cnpj: cliente.cpf_cnpj || '-',
      telefone: cliente.telefone,
      email: cliente.email || '-',
      cidade: cliente.cidade,
      estado: cliente.estado,
      status: cliente.status === 'ativo' ? 'Ativo' : 'Inativo',
    }));

    gerarExcelRelatorio({
      titulo: 'Relatório de Clientes',
      dados: dadosFormatados,
      colunas: ['Nome', 'Tipo', 'CPF/CNPJ', 'Telefone', 'Email', 'Cidade', 'Estado', 'Status'],
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BotaoVoltar />
          <div>
            <h1 className="text-3xl font-bold">Gestão de Clientes</h1>
            <p className="text-muted-foreground">Gerencie sua base de clientes</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportarPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={handleExportarExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Baixar Excel
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCliente ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
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
                    value={formData.cpf_cnpj}
                    onChange={(valor) => setFormData({ ...formData, cpf_cnpj: valor })}
                    tipo={formData.tipo === "pf" ? "cpf" : formData.tipo === "pj" ? "cnpj" : "auto"}
                    label={formData.tipo === "pf" ? "CPF" : formData.tipo === "pj" ? "CNPJ" : "CPF/CNPJ"}
                    placeholder={formData.tipo === "pf" ? "000.000.000-00" : formData.tipo === "pj" ? "00.000.000/0000-00" : "000.000.000-00 ou 00.000.000/0000-00"}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <CEPInput
                    value={formData.cep}
                    onChange={(cep) => setFormData({ ...formData, cep })}
                    onEnderecoEncontrado={handleEnderecoEncontrado}
                    label="CEP"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
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
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    value={formData.complemento}
                    onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                    maxLength={2}
                    placeholder="Ex: SP"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">{editingCliente ? "Atualizar" : "Criar"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 hover:shadow-blue-500/20 hover:border-blue-500/50 group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg transition-transform duration-200 group-hover:scale-110">
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Clientes</p>
              <h3 className="text-2xl font-bold">{clientes?.length || 0}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-6 hover:shadow-green-500/20 hover:border-green-500/50 group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg transition-transform duration-200 group-hover:scale-110">
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clientes Ativos</p>
              <h3 className="text-2xl font-bold">{clientesAtivos}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-6 hover:shadow-red-500/20 hover:border-red-500/50 group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg transition-transform duration-200 group-hover:scale-110">
              <UserX className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clientes Inativos</p>
              <h3 className="text-2xl font-bold">{clientesInativos}</h3>
            </div>
          </div>
        </Card>
      </div>

      <Input
        placeholder="Buscar clientes..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="max-w-sm"
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>CPF/CNPJ</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : queryError ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-red-500">
                  <div className="space-y-2">
                    <p>Erro ao carregar clientes</p>
                    <p className="text-sm text-muted-foreground">
                      {queryError instanceof Error ? queryError.message : "Erro desconhecido"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Verifique o console do navegador (F12) para mais detalhes.
                      <br />
                      Possível causa: Políticas RLS não configuradas. Execute o script VERIFICAR_RLS_POLICIES.sql no Supabase.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : clientesFiltrados && clientesFiltrados.length > 0 ? (
              clientesFiltrados.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">{cliente.nome}</TableCell>
                  <TableCell>{cliente.tipo === "pf" ? "PF" : "PJ"}</TableCell>
                  <TableCell>{cliente.cpf_cnpj || "-"}</TableCell>
                  <TableCell>{cliente.telefone}</TableCell>
                  <TableCell>
                    {cliente.cidade}/{cliente.estado}
                  </TableCell>
                  <TableCell>
                    <Badge className={cliente.status === "ativo" ? "bg-green-500" : "bg-red-500"}>
                      {cliente.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(cliente)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(cliente.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Nenhum cliente encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
