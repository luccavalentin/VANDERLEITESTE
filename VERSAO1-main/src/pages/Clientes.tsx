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
import { Plus, Edit, Trash2, Users, UserCheck, UserX } from "lucide-react"
import { MaskedInput } from "@/components/ui/masked-input"
import { validarCPF, validarCNPJ, validarEmail, buscarCEP } from "@/lib/validations"

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

  const { data: clientes, isLoading } = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clientes").select("*").order("nome", { ascending: true })
      if (error) throw error
      return data as Cliente[]
    },
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

  const handleCEPBlur = async () => {
    const cepLimpo = formData.cep.replace(/[^\d]/g, "")
    if (cepLimpo.length === 8) {
      const resultado = await buscarCEP(formData.cep)
      if (resultado) {
        setFormData({
          ...formData,
          endereco: resultado.logradouro,
          cidade: resultado.localidade,
          estado: resultado.uf,
        })
        toast.success("Endereço encontrado!")
      } else {
        toast.error("CEP não encontrado")
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome || !formData.telefone || !formData.cep || !formData.endereco) {
      toast.error("Preencha os campos obrigatórios")
      return
    }

    const cpfCnpjLimpo = formData.cpf_cnpj.replace(/[^\d]/g, "")

    if (formData.tipo === "pf" && !validarCPF(cpfCnpjLimpo)) {
      toast.error("CPF inválido")
      return
    }

    if (formData.tipo === "pj" && !validarCNPJ(cpfCnpjLimpo)) {
      toast.error("CNPJ inválido")
      return
    }

    if (formData.email && !validarEmail(formData.email)) {
      toast.error("Email inválido")
      return
    }

    if (editingCliente) {
      updateMutation.mutate({ ...formData, id: editingCliente.id } as Cliente)
    } else {
      createMutation.mutate(formData)
    }
  }

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Clientes</h1>
          <p className="text-muted-foreground">Gerencie sua base de clientes</p>
        </div>
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
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo *</Label>
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
                  <Label htmlFor="cpf_cnpj">{formData.tipo === "pf" ? "CPF" : "CNPJ"} *</Label>
                  <MaskedInput
                    id="cpf_cnpj"
                    mask={formData.tipo === "pf" ? "cpf" : "cnpj"}
                    value={formData.cpf_cnpj}
                    onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                    placeholder={formData.tipo === "pf" ? "000.000.000-00" : "00.000.000/0000-00"}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone *</Label>
                  <MaskedInput
                    id="telefone"
                    mask="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="exemplo@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="cep">CEP *</Label>
                  <MaskedInput
                    id="cep"
                    mask="cep"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                    onBlur={handleCEPBlur}
                    placeholder="00000-000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status *</Label>
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
                  <Label htmlFor="endereco">Endereço *</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    required
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
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="estado">Estado *</Label>
                  <Input
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    maxLength={2}
                    required
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Clientes</p>
              <h3 className="text-2xl font-bold">{clientes?.length || 0}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clientes Ativos</p>
              <h3 className="text-2xl font-bold">{clientesAtivos}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
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
            ) : clientesFiltrados && clientesFiltrados.length > 0 ? (
              clientesFiltrados.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">{cliente.nome}</TableCell>
                  <TableCell>{cliente.tipo === "pf" ? "PF" : "PJ"}</TableCell>
                  <TableCell>{cliente.cpf_cnpj}</TableCell>
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
