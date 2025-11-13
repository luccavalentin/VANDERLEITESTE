import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { BotaoVoltar } from "@/components/BotaoVoltar";
import { Plus, Edit, Trash2, CreditCard, Search, Calculator, BarChart3, Download, FileUp, GitCompare, FileSpreadsheet } from "lucide-react";
import { InstituicaoFinanceiraAutocomplete } from "@/components/InstituicaoFinanceiraAutocomplete";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { gerarPDFTabelaAmortizacao } from "@/lib/pdf-utils";
import { gerarExcelTabelaAmortizacao } from "@/lib/excel-utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

interface Parcela {
  numero: number;
  saldoInicial: number;
  juros: number;
  amortizacao: number;
  saldoFinal: number;
}

interface Financiamento {
  id: string;
  banco: string;
  valor_total: number;
  taxa_juros: number;
  tipo: 'financiamento' | 'emprestimo';
  sistema_amortizacao?: 'SAC' | 'PRICE' | null;
  numero_parcelas: number;
  valor_parcela: number;
  iof: number | null;
  seguro: number | null;
  cet?: number | null;
  data_inicio: string;
  data_termino: string | null;
  status?: 'ativo' | 'quitado' | 'cancelado' | null;
  documento_url?: string | null;
}

export default function Financiamentos() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [openDetalhes, setOpenDetalhes] = useState(false);
  const [openComparador, setOpenComparador] = useState(false);
  const [openSimulador, setOpenSimulador] = useState(false);
  const [financiamentoSelecionado, setFinanciamentoSelecionado] = useState<Financiamento | null>(null);
  const [editingFinanciamento, setEditingFinanciamento] = useState<Financiamento | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [contratosComparacao, setContratosComparacao] = useState<string[]>([]);

  const [formData, setFormData] = useState<{
    banco: string;
    valor_total: string;
    taxa_juros: string;
    tipo: 'financiamento' | 'emprestimo';
    sistema_amortizacao: 'SAC' | 'PRICE';
    numero_parcelas: string;
    valor_parcela: string;
    iof: string;
    seguro: string;
    cet: string;
    data_inicio: string;
    data_termino: string;
    status: 'ativo' | 'quitado' | 'cancelado';
  }>({
    banco: "",
    valor_total: "",
    taxa_juros: "",
    tipo: "financiamento",
    sistema_amortizacao: "PRICE",
    numero_parcelas: "",
    valor_parcela: "",
    iof: "",
    seguro: "",
    cet: "",
    data_inicio: new Date().toISOString().split('T')[0],
    data_termino: "",
    status: "ativo",
  });

  const { data: financiamentos, isLoading } = useQuery({
    queryKey: ['financiamentos'],
    queryFn: async () => {
      const { data, error } = await supabase.from('financiamentos').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Financiamento[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('financiamentos').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financiamentos'] });
      toast.success("Contrato cadastrado com sucesso!");
      setOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase.from('financiamentos').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financiamentos'] });
      toast.success("Contrato atualizado com sucesso!");
      setOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('financiamentos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financiamentos'] });
      toast.success("Contrato excluído com sucesso!");
    },
  });

  const resetForm = () => {
    setFormData({
      banco: "",
      valor_total: "",
      taxa_juros: "",
      tipo: "financiamento",
      sistema_amortizacao: "PRICE",
      numero_parcelas: "",
      valor_parcela: "",
      iof: "",
      seguro: "",
      cet: "",
      data_inicio: new Date().toISOString().split('T')[0],
      data_termino: "",
      status: "ativo",
    });
    setEditingFinanciamento(null);
  };

  const calcularCET = (financiamento: Financiamento): number => {
    // Cálculo simplificado do CET (Custo Efetivo Total)
    const taxaMensal = financiamento.taxa_juros / 12 / 100;
    const valorTotalPago = financiamento.valor_parcela * financiamento.numero_parcelas;
    const custoTotal = valorTotalPago - financiamento.valor_total + (financiamento.iof || 0) + (financiamento.seguro || 0);
    const cetAproximado = (custoTotal / financiamento.valor_total) * 100;
    return cetAproximado;
  };

  const calcularTabelaAmortizacao = (financiamento: Financiamento): Parcela[] => {
    const parcelas: Parcela[] = [];
    const taxaMensal = financiamento.taxa_juros / 12 / 100;
    let saldo = financiamento.valor_total;

    if (financiamento.sistema_amortizacao === 'SAC') {
      // Sistema de Amortização Constante (SAC)
      const amortizacao = financiamento.valor_total / financiamento.numero_parcelas;
      for (let i = 1; i <= financiamento.numero_parcelas; i++) {
        const juros = saldo * taxaMensal;
        const parcela = amortizacao + juros;
        saldo -= amortizacao;
        parcelas.push({
          numero: i,
          saldoInicial: saldo + amortizacao,
          juros,
          amortizacao,
          saldoFinal: saldo,
        });
      }
    } else {
      // Sistema Price (Tabela Price)
      const valorParcela = financiamento.valor_parcela;
      for (let i = 1; i <= financiamento.numero_parcelas; i++) {
        const juros = saldo * taxaMensal;
        const amortizacao = valorParcela - juros;
        saldo -= amortizacao;
        parcelas.push({
          numero: i,
          saldoInicial: saldo + amortizacao,
          juros,
          amortizacao,
          saldoFinal: saldo,
        });
      }
    }

    return parcelas;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.banco || !formData.valor_total || !formData.taxa_juros || !formData.numero_parcelas || !formData.valor_parcela || !formData.data_inicio) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const cet = calcularCET({
      id: editingFinanciamento?.id || '',
      banco: formData.banco,
      valor_total: Number(formData.valor_total),
      taxa_juros: Number(formData.taxa_juros),
      tipo: formData.tipo,
      sistema_amortizacao: formData.sistema_amortizacao,
      numero_parcelas: Number(formData.numero_parcelas),
      valor_parcela: Number(formData.valor_parcela),
      iof: formData.iof ? Number(formData.iof) : 0,
      seguro: formData.seguro ? Number(formData.seguro) : 0,
      data_inicio: formData.data_inicio,
      data_termino: formData.data_termino || null,
    });

    const data: any = {
      banco: formData.banco,
      valor_total: Number(formData.valor_total),
      taxa_juros: Number(formData.taxa_juros),
      tipo: formData.tipo,
      sistema_amortizacao: formData.sistema_amortizacao,
      numero_parcelas: Number(formData.numero_parcelas),
      valor_parcela: Number(formData.valor_parcela),
      iof: formData.iof ? Number(formData.iof) : 0,
      seguro: formData.seguro ? Number(formData.seguro) : 0,
      cet: cet,
      data_inicio: formData.data_inicio,
      data_termino: formData.data_termino || null,
      status: formData.status,
    };

    if (editingFinanciamento) {
      updateMutation.mutate({ id: editingFinanciamento.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (financiamento: Financiamento) => {
    setEditingFinanciamento(financiamento);
    setFormData({
      banco: financiamento.banco,
      valor_total: String(financiamento.valor_total),
      taxa_juros: String(financiamento.taxa_juros),
      tipo: financiamento.tipo,
      sistema_amortizacao: financiamento.sistema_amortizacao || 'PRICE',
      numero_parcelas: String(financiamento.numero_parcelas),
      valor_parcela: String(financiamento.valor_parcela),
      iof: financiamento.iof ? String(financiamento.iof) : "",
      seguro: financiamento.seguro ? String(financiamento.seguro) : "",
      cet: financiamento.cet ? String(financiamento.cet) : "",
      data_inicio: financiamento.data_inicio,
      data_termino: financiamento.data_termino || "",
      status: financiamento.status || 'ativo',
    });
    setOpen(true);
  };

  const handleAbrirDetalhes = (financiamento: Financiamento) => {
    setFinanciamentoSelecionado(financiamento);
    setOpenDetalhes(true);
  };

  const handleGerarTabelaAmortizacao = (financiamento: Financiamento) => {
    const parcelas = calcularTabelaAmortizacao(financiamento);
    gerarPDFTabelaAmortizacao({
      banco: financiamento.banco,
      valorTotal: financiamento.valor_total,
      taxaJuros: financiamento.taxa_juros,
      numeroParcelas: financiamento.numero_parcelas,
      valorParcela: financiamento.valor_parcela,
      dataInicio: financiamento.data_inicio,
      parcelas,
    });
  };

  const handleGerarTabelaAmortizacaoExcel = (financiamento: Financiamento) => {
    const parcelas = calcularTabelaAmortizacao(financiamento);
    gerarExcelTabelaAmortizacao({
      banco: financiamento.banco,
      valorTotal: financiamento.valor_total,
      taxaJuros: financiamento.taxa_juros,
      numeroParcelas: financiamento.numero_parcelas,
      valorParcela: financiamento.valor_parcela,
      dataInicio: financiamento.data_inicio,
      parcelas,
    });
  };

  const handleSimular = () => {
    if (!formData.valor_total || !formData.taxa_juros || !formData.numero_parcelas) {
      toast.error("Preencha os campos necessários para simulação");
      return;
    }
    setOpenSimulador(true);
  };

  const financiamentosFiltrados = financiamentos?.filter((f) => {
    const matchBusca = 
      f.banco.toLowerCase().includes(busca.toLowerCase()) ||
      f.tipo.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "todos" || f.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const totalFinanciamentos = financiamentos?.reduce((acc, f) => acc + Number(f.valor_total), 0) || 0;
  const totalParcelas = financiamentos?.reduce((acc, f) => acc + Number(f.valor_parcela), 0) || 0;
  const totalJuros = financiamentos?.reduce((acc, f) => {
    const totalPago = f.valor_parcela * f.numero_parcelas;
    return acc + (totalPago - f.valor_total);
  }, 0) || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BotaoVoltar />
          <div>
            <h1 className="text-3xl font-bold">Contratos de Crédito</h1>
            <p className="text-muted-foreground">Centralize e compare contratos de crédito</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSimular}>
            <Calculator className="h-4 w-4 mr-2" />
            Simular Novo
          </Button>
          <Button variant="outline" onClick={() => setOpenComparador(true)}>
            <GitCompare className="h-4 w-4 mr-2" />
            Comparar Contratos
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Contrato
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingFinanciamento ? 'Editar Contrato' : 'Novo Contrato'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <InstituicaoFinanceiraAutocomplete
                      value={formData.banco}
                      onChange={(value) => setFormData({ ...formData, banco: value })}
                      label="Banco"
                      required={true}
                      placeholder="Digite o nome da instituição..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select value={formData.tipo} onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="financiamento">Financiamento</SelectItem>
                        <SelectItem value="emprestimo">Empréstimo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="valor_total">Valor Total *</Label>
                    <Input id="valor_total" type="number" step="0.01" value={formData.valor_total} onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="taxa_juros">Taxa de Juros (%) *</Label>
                    <Input id="taxa_juros" type="number" step="0.01" value={formData.taxa_juros} onChange={(e) => setFormData({ ...formData, taxa_juros: e.target.value })} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sistema_amortizacao">Sistema de Amortização</Label>
                    <Select value={formData.sistema_amortizacao} onValueChange={(value: any) => setFormData({ ...formData, sistema_amortizacao: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SAC">SAC</SelectItem>
                        <SelectItem value="PRICE">PRICE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="numero_parcelas">Número de Parcelas *</Label>
                    <Input id="numero_parcelas" type="number" value={formData.numero_parcelas} onChange={(e) => setFormData({ ...formData, numero_parcelas: e.target.value })} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="valor_parcela">Valor da Parcela *</Label>
                    <Input id="valor_parcela" type="number" step="0.01" value={formData.valor_parcela} onChange={(e) => setFormData({ ...formData, valor_parcela: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="iof">IOF</Label>
                    <Input id="iof" type="number" step="0.01" value={formData.iof} onChange={(e) => setFormData({ ...formData, iof: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="seguro">Seguro</Label>
                    <Input id="seguro" type="number" step="0.01" value={formData.seguro} onChange={(e) => setFormData({ ...formData, seguro: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="data_inicio">Data de Início *</Label>
                    <Input id="data_inicio" type="date" value={formData.data_inicio} onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="data_termino">Data de Término</Label>
                  <Input id="data_termino" type="date" value={formData.data_termino} onChange={(e) => setFormData({ ...formData, data_termino: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="quitado">Quitado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit">{editingFinanciamento ? 'Atualizar' : 'Criar'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 hover:shadow-primary/20 hover:border-primary/50 group">
          <p className="text-sm text-muted-foreground">Total Financiado</p>
          <h3 className="text-2xl font-bold">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalFinanciamentos)}
          </h3>
        </Card>
        <Card className="p-4 hover:shadow-blue-500/20 hover:border-blue-500/50 group">
          <p className="text-sm text-muted-foreground">Total de Parcelas Mensais</p>
          <h3 className="text-2xl font-bold">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalParcelas)}
          </h3>
        </Card>
        <Card className="p-4 hover:shadow-red-500/20 hover:border-red-500/50 group">
          <p className="text-sm text-muted-foreground">Total de Juros</p>
          <h3 className="text-2xl font-bold text-red-500">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalJuros)}
          </h3>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por banco, contrato ou status..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="quitado">Quitado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Banco</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Taxa</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead>Parcela</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data Início/Fim</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center">Carregando...</TableCell>
              </TableRow>
            ) : financiamentosFiltrados && financiamentosFiltrados.length > 0 ? (
              financiamentosFiltrados.map((financiamento) => (
                <TableRow key={financiamento.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleAbrirDetalhes(financiamento)}>
                  <TableCell className="font-medium">{financiamento.banco}</TableCell>
                  <TableCell>
                    <Badge>{financiamento.tipo}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(financiamento.valor_total))}
                  </TableCell>
                  <TableCell>{financiamento.taxa_juros}%</TableCell>
                  <TableCell>{financiamento.numero_parcelas}x</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(financiamento.valor_parcela))}
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      financiamento.status === 'ativo' ? 'bg-green-500' :
                      financiamento.status === 'quitado' ? 'bg-blue-500' :
                      'bg-red-500'
                    }>
                      {financiamento.status || 'ativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(financiamento.data_inicio), 'dd/MM/yyyy', { locale: ptBR })}
                    {financiamento.data_termino && ` / ${format(new Date(financiamento.data_termino), 'dd/MM/yyyy', { locale: ptBR })}`}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleAbrirDetalhes(financiamento)}>
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(financiamento)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(financiamento.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center">Nenhum financiamento encontrado</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={openDetalhes} onOpenChange={setOpenDetalhes}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Contrato - {financiamentoSelecionado?.banco}</DialogTitle>
          </DialogHeader>
          {financiamentoSelecionado && (
            <div className="space-y-4">
              <Tabs defaultValue="dados">
                <TabsList>
                  <TabsTrigger value="dados">Dados</TabsTrigger>
                  <TabsTrigger value="amortizacao">Tabela de Amortização</TabsTrigger>
                  <TabsTrigger value="grafico">Gráficos</TabsTrigger>
                </TabsList>

                <TabsContent value="dados" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Banco</Label>
                      <p className="font-medium">{financiamentoSelecionado.banco}</p>
                    </div>
                    <div>
                      <Label>Tipo</Label>
                      <p className="font-medium">{financiamentoSelecionado.tipo}</p>
                    </div>
                    <div>
                      <Label>Sistema de Amortização</Label>
                      <p className="font-medium">{financiamentoSelecionado.sistema_amortizacao || 'PRICE'}</p>
                    </div>
                    <div>
                      <Label>Valor Total</Label>
                      <p className="font-medium">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(financiamentoSelecionado.valor_total))}
                      </p>
                    </div>
                    <div>
                      <Label>Taxa de Juros</Label>
                      <p className="font-medium">{financiamentoSelecionado.taxa_juros}%</p>
                    </div>
                    <div>
                      <Label>IOF</Label>
                      <p className="font-medium">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(financiamentoSelecionado.iof) || 0)}
                      </p>
                    </div>
                    <div>
                      <Label>Seguro</Label>
                      <p className="font-medium">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(financiamentoSelecionado.seguro) || 0)}
                      </p>
                    </div>
                    <div>
                      <Label>Parcelas</Label>
                      <p className="font-medium">{financiamentoSelecionado.numero_parcelas}x</p>
                    </div>
                    <div>
                      <Label>Valor da Parcela</Label>
                      <p className="font-medium">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(financiamentoSelecionado.valor_parcela))}
                      </p>
                    </div>
                    <div>
                      <Label>CET (Custo Efetivo Total)</Label>
                      <p className="font-medium text-red-500">
                        {financiamentoSelecionado.cet ? `${financiamentoSelecionado.cet.toFixed(2)}%` : `${calcularCET(financiamentoSelecionado).toFixed(2)}%`}
                      </p>
                    </div>
                    <div>
                      <Label>Data de Início</Label>
                      <p className="font-medium">{format(new Date(financiamentoSelecionado.data_inicio), 'dd/MM/yyyy', { locale: ptBR })}</p>
                    </div>
                    <div>
                      <Label>Data de Término</Label>
                      <p className="font-medium">
                        {financiamentoSelecionado.data_termino ? format(new Date(financiamentoSelecionado.data_termino), 'dd/MM/yyyy', { locale: ptBR }) : "-"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label>Upload de Documento</Label>
                    <Input type="file" accept=".pdf,.jpg,.png" className="mt-2" />
                  </div>
                </TabsContent>

                <TabsContent value="amortizacao" className="space-y-4">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => handleGerarTabelaAmortizacao(financiamentoSelecionado)}>
                      <Download className="h-4 w-4 mr-2" />
                      Gerar PDF
                    </Button>
                    <Button variant="outline" onClick={() => handleGerarTabelaAmortizacaoExcel(financiamentoSelecionado)}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Baixar Excel
                    </Button>
                  </div>
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Parcela</TableHead>
                          <TableHead>Saldo Inicial</TableHead>
                          <TableHead>Juros</TableHead>
                          <TableHead>Amortização</TableHead>
                          <TableHead>Saldo Final</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {calcularTabelaAmortizacao(financiamentoSelecionado).map((parcela) => (
                          <TableRow key={parcela.numero}>
                            <TableCell>{parcela.numero}</TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parcela.saldoInicial)}
                            </TableCell>
                            <TableCell className="text-red-500">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parcela.juros)}
                            </TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parcela.amortizacao)}
                            </TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parcela.saldoFinal)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                </TabsContent>

                <TabsContent value="grafico" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Gráfico de Juros Pagos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={calcularTabelaAmortizacao(financiamentoSelecionado).slice(0, 12).map(p => ({
                          parcela: `P${p.numero}`,
                          juros: p.juros,
                          amortizacao: p.amortizacao,
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="parcela" />
                          <YAxis />
                          <Tooltip formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} />
                          <Legend />
                          <Bar dataKey="juros" fill="#ef4444" />
                          <Bar dataKey="amortizacao" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Custo Efetivo Total (CET)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <p className="text-4xl font-bold text-red-500">
                          {financiamentoSelecionado.cet ? `${financiamentoSelecionado.cet.toFixed(2)}%` : `${calcularCET(financiamentoSelecionado).toFixed(2)}%`}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Custo total do empréstimo incluindo juros, IOF e seguro
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => handleEdit(financiamentoSelecionado)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline" onClick={() => handleGerarTabelaAmortizacao(financiamentoSelecionado)}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Gerar Gráfico
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Comparador */}
      <Dialog open={openComparador} onOpenChange={setOpenComparador}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comparador de Contratos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Selecione os contratos para comparar (máximo 3)</Label>
              <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                {financiamentos?.map((f) => (
                  <div key={f.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={contratosComparacao.includes(f.id)}
                      onChange={(e) => {
                        if (e.target.checked && contratosComparacao.length < 3) {
                          setContratosComparacao([...contratosComparacao, f.id]);
                        } else if (!e.target.checked) {
                          setContratosComparacao(contratosComparacao.filter(id => id !== f.id));
                        }
                      }}
                    />
                    <Label>{f.banco} - {f.tipo} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(f.valor_total))}</Label>
                  </div>
                ))}
              </div>
            </div>
            {contratosComparacao.length > 0 && (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Banco</TableHead>
                      <TableHead>Taxa</TableHead>
                      <TableHead>Custo Final</TableHead>
                      <TableHead>Valor Total Pago</TableHead>
                      <TableHead>CET</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contratosComparacao.map((id) => {
                      const contrato = financiamentos?.find(f => f.id === id);
                      if (!contrato) return null;
                      const totalPago = contrato.valor_parcela * contrato.numero_parcelas;
                      const custoFinal = totalPago - contrato.valor_total;
                      return (
                        <TableRow key={id}>
                          <TableCell className="font-medium">{contrato.banco}</TableCell>
                          <TableCell>{contrato.taxa_juros}%</TableCell>
                          <TableCell className="text-red-500">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(custoFinal)}
                          </TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPago)}
                          </TableCell>
                          <TableCell className="text-red-500">
                            {contrato.cet ? `${contrato.cet.toFixed(2)}%` : `${calcularCET(contrato).toFixed(2)}%`}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Simulador */}
      <Dialog open={openSimulador} onOpenChange={setOpenSimulador}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Simulador de Contrato</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor Total</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valor_total}
                  onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
                />
              </div>
              <div>
                <Label>Taxa de Juros (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.taxa_juros}
                  onChange={(e) => setFormData({ ...formData, taxa_juros: e.target.value })}
                />
              </div>
              <div>
                <Label>Número de Parcelas</Label>
                <Input
                  type="number"
                  value={formData.numero_parcelas}
                  onChange={(e) => setFormData({ ...formData, numero_parcelas: e.target.value })}
                />
              </div>
              <div>
                <Label>Sistema</Label>
                <Select value={formData.sistema_amortizacao} onValueChange={(value: any) => setFormData({ ...formData, sistema_amortizacao: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAC">SAC</SelectItem>
                    <SelectItem value="PRICE">PRICE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formData.valor_total && formData.taxa_juros && formData.numero_parcelas && (
              <Card className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor da Parcela (estimado):</span>
                    <span className="font-bold">
                      {(() => {
                        const taxaMensal = Number(formData.taxa_juros) / 12 / 100;
                        const valor = Number(formData.valor_total);
                        const parcelas = Number(formData.numero_parcelas);
                        if (formData.sistema_amortizacao === 'SAC') {
                          const amortizacao = valor / parcelas;
                          const primeiraParcela = amortizacao + (valor * taxaMensal);
                          return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(primeiraParcela);
                        } else {
                          const parcela = valor * (taxaMensal * Math.pow(1 + taxaMensal, parcelas)) / (Math.pow(1 + taxaMensal, parcelas) - 1);
                          return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parcela);
                        }
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total a Pagar:</span>
                    <span className="font-bold">
                      {(() => {
                        const taxaMensal = Number(formData.taxa_juros) / 12 / 100;
                        const valor = Number(formData.valor_total);
                        const parcelas = Number(formData.numero_parcelas);
                        let total = 0;
                        if (formData.sistema_amortizacao === 'SAC') {
                          const amortizacao = valor / parcelas;
                          let saldo = valor;
                          for (let i = 0; i < parcelas; i++) {
                            total += amortizacao + (saldo * taxaMensal);
                            saldo -= amortizacao;
                          }
                        } else {
                          const parcela = valor * (taxaMensal * Math.pow(1 + taxaMensal, parcelas)) / (Math.pow(1 + taxaMensal, parcelas) - 1);
                          total = parcela * parcelas;
                        }
                        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total);
                      })()}
                    </span>
                  </div>
                </div>
              </Card>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenSimulador(false)}>Fechar</Button>
              <Button onClick={() => { setOpenSimulador(false); setOpen(true); }}>Criar Contrato</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
