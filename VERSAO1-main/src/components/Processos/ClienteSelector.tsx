"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { MaskedInput } from "@/components/ui/masked-input"
import { validarCPF, validarCNPJ, validarEmail, buscarCEP } from "@/lib/validations"

interface ClienteSelectorProps {
  value: string | null
  onChange: (value: string) => void
}

export function ClienteSelector({ value, onChange }: ClienteSelectorProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isNewClientOpen, setIsNewClientOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [novoClienteTipo, setNovoClienteTipo] = useState<"pf" | "pj">("pf")
  const [novoClienteCEP, setNovoClienteCEP] = useState("")
  const [novoClienteEndereco, setNovoClienteEndereco] = useState("")
  const [novoClienteCidade, setNovoClienteCidade] = useState("")
  const [novoClienteEstado, setNovoClienteEstado] = useState("")

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clientes").select("*").order("nome")
      if (error) throw error
      return data
    },
  })

  const filteredClientes = useMemo(() => {
    if (!searchTerm) return clientes
    const term = searchTerm.toLowerCase()
    return clientes.filter(
      (cliente: any) => cliente.nome.toLowerCase().includes(term) || cliente.cpf_cnpj?.toLowerCase().includes(term),
    )
  }, [clientes, searchTerm])

  const createClienteMutation = useMutation({
    mutationFn: async (formData: any) => {
      const { data, error } = await supabase.from("clientes").insert([formData]).select().single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] })
      onChange(data.id)
      setIsNewClientOpen(false)
      toast({
        title: "Cliente criado com sucesso!",
        className: "bg-success text-success-foreground border-success",
      })
    },
  })

  const handleCEPBlur = async () => {
    const cepLimpo = novoClienteCEP.replace(/[^\d]/g, "")
    if (cepLimpo.length === 8) {
      const resultado = await buscarCEP(novoClienteCEP)
      if (resultado) {
        setNovoClienteEndereco(resultado.logradouro)
        setNovoClienteCidade(resultado.localidade)
        setNovoClienteEstado(resultado.uf)
        toast({
          title: "Endereço encontrado!",
          className: "bg-success text-success-foreground border-success",
        })
      } else {
        toast({
          title: "CEP não encontrado",
          variant: "destructive",
        })
      }
    }
  }

  const handleNewClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const cpfCnpj = formData.get("cpf_cnpj") as string
    const cpfCnpjLimpo = cpfCnpj?.replace(/[^\d]/g, "") || ""

    if (novoClienteTipo === "pf" && cpfCnpj && !validarCPF(cpfCnpjLimpo)) {
      toast({
        title: "CPF inválido",
        variant: "destructive",
      })
      return
    }

    if (novoClienteTipo === "pj" && cpfCnpj && !validarCNPJ(cpfCnpjLimpo)) {
      toast({
        title: "CNPJ inválido",
        variant: "destructive",
      })
      return
    }

    const email = formData.get("email") as string
    if (email && !validarEmail(email)) {
      toast({
        title: "Email inválido",
        variant: "destructive",
      })
      return
    }

    const data = {
      nome: formData.get("nome"),
      tipo: novoClienteTipo,
      cpf_cnpj: cpfCnpj || null,
      email: email || null,
      telefone: formData.get("telefone"),
      endereco: novoClienteEndereco || formData.get("endereco"),
      numero: formData.get("numero") || null,
      complemento: formData.get("complemento") || null,
      cidade: novoClienteCidade || formData.get("cidade"),
      estado: novoClienteEstado || formData.get("estado"),
      cep: novoClienteCEP || formData.get("cep"),
      status: "ativo",
    }

    createClienteMutation.mutate(data)
  }

  const handleDialogChange = (open: boolean) => {
    setIsNewClientOpen(open)
    if (!open) {
      setNovoClienteTipo("pf")
      setNovoClienteCEP("")
      setNovoClienteEndereco("")
      setNovoClienteCidade("")
      setNovoClienteEstado("")
    }
  }

  return (
    <div className="space-y-2 col-span-2">
      <Label>Cliente *</Label>
      <div className="flex gap-2">
        <div className="flex-1 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Digite o nome do cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={value || ""} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {filteredClientes.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Nenhum cliente encontrado.</div>
              ) : (
                filteredClientes.map((cliente: any) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nome} - {cliente.cpf_cnpj || "Sem CPF/CNPJ"}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isNewClientOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" className="gap-2 whitespace-nowrap bg-transparent">
              <Plus className="h-4 w-4" />
              Novo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Cliente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleNewClient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input id="nome" name="nome" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select value={novoClienteTipo} onValueChange={(v: "pf" | "pj") => setNovoClienteTipo(v)} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pf">Pessoa Física</SelectItem>
                      <SelectItem value="pj">Pessoa Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf_cnpj">{novoClienteTipo === "pf" ? "CPF" : "CNPJ"}</Label>
                  <MaskedInput
                    id="cpf_cnpj"
                    name="cpf_cnpj"
                    mask={novoClienteTipo === "pf" ? "cpf" : "cnpj"}
                    placeholder={novoClienteTipo === "pf" ? "000.000.000-00" : "00.000.000/0000-00"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <MaskedInput id="telefone" name="telefone" mask="telefone" placeholder="(00) 00000-0000" required />
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" name="email" type="email" placeholder="exemplo@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP *</Label>
                  <MaskedInput
                    id="cep"
                    name="cep"
                    mask="cep"
                    value={novoClienteCEP}
                    onValueChange={setNovoClienteCEP}
                    onBlur={handleCEPBlur}
                    placeholder="00000-000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado *</Label>
                  <Input
                    id="estado"
                    name="estado"
                    value={novoClienteEstado}
                    onChange={(e) => setNovoClienteEstado(e.target.value)}
                    maxLength={2}
                    placeholder="SP"
                    required
                  />
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <Label htmlFor="endereco">Endereço *</Label>
                  <Input
                    id="endereco"
                    name="endereco"
                    value={novoClienteEndereco}
                    onChange={(e) => setNovoClienteEndereco(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input id="numero" name="numero" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input id="complemento" name="complemento" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input
                    id="cidade"
                    name="cidade"
                    value={novoClienteCidade}
                    onChange={(e) => setNovoClienteCidade(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => handleDialogChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Cliente</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
