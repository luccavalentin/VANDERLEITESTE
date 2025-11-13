"use client"

import type React from "react"
import { BarChart3 } from "lucide-react"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Scale, Plus, Search, Edit, Trash2, FileText } from "lucide-react"
import { MapeamentoEstrategico } from "@/components/Processos/MapeamentoEstrategico"
import { formatarStatus } from "@/lib/processos-data"

export default function Processos() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAreaDireito, setSelectedAreaDireito] = useState("")
  const [isConcluido, setIsConcluido] = useState(false)
  const [isParcelado, setIsParcelado] = useState(false)
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null)
  const [filterView, setFilterView] = useState<string | null>(null)
  const [isMapeamentoOpen, setIsMapeamentoOpen] = useState(false)

  const { data: processos = [], isLoading } = useQuery({
    queryKey: ["processos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("processos")
        .select("*, clientes(nome)")
        .order("created_at", { ascending: false })
      if (error) throw error
      return data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (formData: any) => {
      const { error } = await supabase.from("processos").insert([formData])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processos"] })
      toast({
        title: "Processo criado com sucesso!",
        variant: "default",
        className: "bg-success text-success-foreground border-success",
      })
      setIsDialogOpen(false)
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("processos").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processos"] })
      toast({
        title: "Processo excluído com sucesso!",
        variant: "default",
        className: "bg-success text-success-foreground border-success",
      })
    },
    onError: () => {
      toast({
        title: "Erro ao excluir processo",
        variant: "destructive",
      })
    },
  })

  const resetForm = () => {
    setSelectedAreaDireito("")
    setIsConcluido(false)
    setIsParcelado(false)
    setSelectedClienteId(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const data: any = {
      numero_processo: formData.get("numero_processo"),
      cliente_id: selectedClienteId,
      tipo: formData.get("tipo"),
      status: formData.get("status"),
      data_inicial: formData.get("data_inicial"),
      responsavel: formData.get("responsavel") || null,
      valor_causa: formData.get("valor_causa") ? Number.parseFloat(formData.get("valor_causa") as string) : null,
      andamento_atual: formData.get("andamento_atual") || null,
      observacoes: formData.get("observacoes") || null,
    }

    if (isConcluido) {
      data.data_conclusao = formData.get("data_conclusao")
      data.resultado_causa = formData.get("resultado_causa")
    }

    createMutation.mutate(data)

    // Se for parcelado, criar as transações de entrada
    if (isParcelado && formData.get("valor_causa")) {
      const valorCausa = Number.parseFloat(formData.get("valor_causa") as string)
      const numeroParcelas = Number.parseInt(formData.get("numero_parcelas") as string)
      const recorrencia = formData.get("recorrencia")
      const dataVencimento = new Date(formData.get("data_vencimento") as string)
      const valorParcela = valorCausa / numeroParcelas

      // Criar transações para cada parcela
      for (let i = 0; i < numeroParcelas; i++) {
        const dataTransacao = new Date(dataVencimento)

        // Calcular data baseada na recorrência
        const recStr = String(recorrencia)
        if (recStr === "semanal") {
          dataTransacao.setDate(dataTransacao.getDate() + i * 7)
        } else if (recStr === "quinzenal") {
          dataTransacao.setDate(dataTransacao.getDate() + i * 15)
        } else if (recStr === "mensal") {
          dataTransacao.setMonth(dataTransacao.getMonth() + i)
        } else if (recStr === "anual") {
          dataTransacao.setFullYear(dataTransacao.getFullYear() + i)
        }

        await supabase.from("transacoes").insert([
          {
            tipo: "entrada",
            categoria: "Processos Jurídicos",
            descricao: `${formData.get("numero_processo")} - Parcela ${i + 1}/${numeroParcelas}`,
            valor: valorParcela,
            data: dataTransacao.toISOString().split("T")[0],
            area: "processos",
          },
        ])
      }
    } else if (formData.get("valor_causa")) {
      // Se não for parcelado mas tem valor, criar transação única
      await supabase.from("transacoes").insert([
        {
          tipo: "entrada",
          categoria: "Processos Jurídicos",
          descricao: `${formData.get("numero_processo")} - Pagamento à vista`,
          valor: Number.parseFloat(formData.get("valor_causa") as string),
          data: formData.get("data_inicial") as string,
          area: "processos",
        },
      ])
    }
  }

  const filteredProcessos = processos.filter(
    (p: any) =>
      p.numero_processo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientes?.nome.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (filterView === "all") {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Scale className="h-8 w-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold">Todos os Processos</h1>
          </div>
          <Button variant="default" className="gap-2" onClick={() => setIsMapeamentoOpen(true)}>
            <BarChart3 className="h-4 w-4" />
            Mapeamento Estratégico
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" onClick={() => setFilterView("all")}>
            Todos os Processos
          </Button>
          <Button variant="outline" onClick={() => setFilterView("em_andamento")}>
            Em Andamento
          </Button>
          <Button variant="outline" onClick={() => setFilterView("encerrado")}>
            Concluídos
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 whitespace-nowrap">
                <Plus className="h-4 w-4" />
                Novo Processo
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>

        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/10">
              <Scale className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{processos.length}</p>
            </div>
          </div>
        </Card>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar processos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 md:p-4">Nº Processo</th>
                <th className="text-left p-3 md:p-4 hidden md:table-cell">Cliente</th>
                <th className="text-left p-3 md:p-4 hidden sm:table-cell">Tipo</th>
                <th className="text-left p-3 md:p-4">Status</th>
                <th className="text-left p-3 md:p-4 hidden lg:table-cell">Data Inicial</th>
                <th className="text-left p-3 md:p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProcessos.map((processo: any) => (
                <tr key={processo.id} className="border-b hover:bg-muted/50">
                  <td className="p-3 md:p-4 font-medium">{processo.numero_processo}</td>
                  <td className="p-3 md:p-4 hidden md:table-cell">{processo.clientes?.nome || "Sem cliente"}</td>
                  <td className="p-3 md:p-4 hidden sm:table-cell">{processo.tipo}</td>
                  <td className="p-3 md:p-4">{formatarStatus(processo.status)}</td>
                  <td className="p-3 md:p-4 hidden lg:table-cell">
                    {new Date(processo.data_inicial).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="p-3 md:p-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="hidden sm:flex bg-transparent">
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(processo.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (filterView === "em_andamento") {
    const processosEmAndamento = processos.filter((p: any) => p.status === "em_andamento")
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Scale className="h-8 w-8 text-blue-500" />
            <h1 className="text-2xl md:text-3xl font-bold">Processos em Andamento</h1>
          </div>
          <Button variant="default" className="gap-2" onClick={() => setIsMapeamentoOpen(true)}>
            <BarChart3 className="h-4 w-4" />
            Mapeamento Estratégico
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" onClick={() => setFilterView("all")}>
            Todos os Processos
          </Button>
          <Button variant="outline" onClick={() => setFilterView("em_andamento")}>
            Em Andamento
          </Button>
          <Button variant="outline" onClick={() => setFilterView("encerrado")}>
            Concluídos
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 whitespace-nowrap">
                <Plus className="h-4 w-4" />
                Novo Processo
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>

        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Scale className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Em Andamento</p>
              <p className="text-2xl font-bold">{processosEmAndamento.length}</p>
            </div>
          </div>
        </Card>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar processos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 md:p-4">Nº Processo</th>
                <th className="text-left p-3 md:p-4 hidden md:table-cell">Cliente</th>
                <th className="text-left p-3 md:p-4 hidden sm:table-cell">Tipo</th>
                <th className="text-left p-3 md:p-4">Status</th>
                <th className="text-left p-3 md:p-4 hidden lg:table-cell">Data Inicial</th>
                <th className="text-left p-3 md:p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {processosEmAndamento
                .filter(
                  (p: any) =>
                    p.numero_processo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.clientes?.nome.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                .map((processo: any) => (
                  <tr key={processo.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 md:p-4 font-medium">{processo.numero_processo}</td>
                    <td className="p-3 md:p-4 hidden md:table-cell">{processo.clientes?.nome || "Sem cliente"}</td>
                    <td className="p-3 md:p-4 hidden sm:table-cell">{processo.tipo}</td>
                    <td className="p-3 md:p-4">{formatarStatus(processo.status)}</td>
                    <td className="p-3 md:p-4 hidden lg:table-cell">
                      {new Date(processo.data_inicial).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="p-3 md:p-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="hidden sm:flex bg-transparent">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(processo.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (filterView === "encerrado") {
    const processosConcluidos = processos.filter((p: any) => p.status === "encerrado")
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Scale className="h-8 w-8 text-green-500" />
            <h1 className="text-2xl md:text-3xl font-bold">Processos Concluídos</h1>
          </div>
          <Button variant="default" className="gap-2" onClick={() => setIsMapeamentoOpen(true)}>
            <BarChart3 className="h-4 w-4" />
            Mapeamento Estratégico
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" onClick={() => setFilterView("all")}>
            Todos os Processos
          </Button>
          <Button variant="outline" onClick={() => setFilterView("em_andamento")}>
            Em Andamento
          </Button>
          <Button variant="outline" onClick={() => setFilterView("encerrado")}>
            Concluídos
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 whitespace-nowrap">
                <Plus className="h-4 w-4" />
                Novo Processo
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>

        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/10">
              <Scale className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Concluídos</p>
              <p className="text-2xl font-bold">{processosConcluidos.length}</p>
            </div>
          </div>
        </Card>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar processos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 md:p-4">Nº Processo</th>
                <th className="text-left p-3 md:p-4 hidden md:table-cell">Cliente</th>
                <th className="text-left p-3 md:p-4 hidden sm:table-cell">Tipo</th>
                <th className="text-left p-3 md:p-4">Status</th>
                <th className="text-left p-3 md:p-4 hidden lg:table-cell">Data Inicial</th>
                <th className="text-left p-3 md:p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {processosConcluidos
                .filter(
                  (p: any) =>
                    p.numero_processo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.clientes?.nome.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                .map((processo: any) => (
                  <tr key={processo.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 md:p-4 font-medium">{processo.numero_processo}</td>
                    <td className="p-3 md:p-4 hidden md:table-cell">{processo.clientes?.nome || "Sem cliente"}</td>
                    <td className="p-3 md:p-4 hidden sm:table-cell">{processo.tipo}</td>
                    <td className="p-3 md:p-4">{formatarStatus(processo.status)}</td>
                    <td className="p-3 md:p-4 hidden lg:table-cell">
                      {new Date(processo.data_inicial).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="p-3 md:p-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="hidden sm:flex bg-transparent">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(processo.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Scale className="h-8 w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Gestão de Processos</h1>
        </div>
        <Button variant="default" className="gap-2" onClick={() => setIsMapeamentoOpen(true)}>
          <BarChart3 className="h-4 w-4" />
          Mapeamento Estratégico
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="outline" onClick={() => setFilterView("all")}>
          Todos os Processos
        </Button>
        <Button variant="outline" onClick={() => setFilterView("em_andamento")}>
          Em Andamento
        </Button>
        <Button variant="outline" onClick={() => setFilterView("encerrado")}>
          Concluídos
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 whitespace-nowrap">
              <Plus className="h-4 w-4" />
              Novo Processo
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar processos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 md:p-4">Nº Processo</th>
              <th className="text-left p-3 md:p-4 hidden md:table-cell">Cliente</th>
              <th className="text-left p-3 md:p-4 hidden sm:table-cell">Tipo</th>
              <th className="text-left p-3 md:p-4">Status</th>
              <th className="text-left p-3 md:p-4 hidden lg:table-cell">Data Inicial</th>
              <th className="text-left p-3 md:p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredProcessos.map((processo: any) => (
              <tr key={processo.id} className="border-b hover:bg-muted/50">
                <td className="p-3 md:p-4 font-medium">{processo.numero_processo}</td>
                <td className="p-3 md:p-4 hidden md:table-cell">{processo.clientes?.nome || "Sem cliente"}</td>
                <td className="p-3 md:p-4 hidden sm:table-cell">{processo.tipo}</td>
                <td className="p-3 md:p-4">{formatarStatus(processo.status)}</td>
                <td className="p-3 md:p-4 hidden lg:table-cell">
                  {new Date(processo.data_inicial).toLocaleDateString("pt-BR")}
                </td>
                <td className="p-3 md:p-4">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="hidden sm:flex bg-transparent">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(processo.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MapeamentoEstrategico open={isMapeamentoOpen} onOpenChange={setIsMapeamentoOpen} />
    </div>
  )
}
