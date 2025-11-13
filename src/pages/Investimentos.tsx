import { useState, useMemo } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { BotaoVoltar } from "@/components/BotaoVoltar";
import { Plus, Edit, Trash2, LineChart, Search, Download, TrendingUp } from "lucide-react";
import { InstituicaoFinanceiraAutocomplete } from "@/components/InstituicaoFinanceiraAutocomplete";
import { format, differenceInDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { gerarPDFRelatorio } from "@/lib/pdf-utils";
import { useTheme } from "next-themes";
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface HistoricoRendimento {
  data: string;
  valor: number;
}

interface Investimento {
  id: string;
  tipo: string;
  instituicao: string;
  valor_aplicado: number;
  rentabilidade: number;
  prazo_dias: number | null;
  data_aplicacao: string;
  data_vencimento: string | null;
  status: 'ativo' | 'resgatado' | 'vencido';
  vincular_fluxo_caixa?: boolean | null;
  observacoes: string | null;
  historico_rendimento?: HistoricoRendimento[];
}

export default function Investimentos() {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [openDetalhes, setOpenDetalhes] = useState(false);
  const [investimentoSelecionado, setInvestimentoSelecionado] = useState<Investimento | null>(null);
  const [editingInvestimento, setEditingInvestimento] = useState<Investimento | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  // Cores dos gráficos adaptáveis ao tema
  const chartColors = useMemo(() => {
    const isDark = theme === 'dark';
    return {
      primary: '#10b981',
      secondary: '#3b82f6',
      grid: isDark ? '#374151' : '#e5e7eb',
      axis: isDark ? '#9ca3af' : '#6b7280',
      text: isDark ? '#f3f4f6' : '#111827',
      tooltipBg: isDark ? '#1f2937' : '#ffffff',
      tooltipBorder: isDark ? '#374151' : '#e5e7eb',
    };
  }, [theme]);

  const [formData, setFormData] = useState<{
    tipo: string;
    instituicao: string;
    valor_aplicado: string;
    rentabilidade: string;
    prazo_dias: string;
    data_aplicacao: string;
    data_vencimento: string;
    status: 'ativo' | 'resgatado' | 'vencido';
    vincular_fluxo_caixa: boolean;
    observacoes: string;
  }>({
    tipo: "",
    instituicao: "",
    valor_aplicado: "",
    rentabilidade: "",
    prazo_dias: "",
    data_aplicacao: new Date().toISOString().split('T')[0],
    data_vencimento: "",
    status: "ativo",
    vincular_fluxo_caixa: false,
    observacoes: "",
  });

  const { data: investimentos, isLoading } = useQuery({
    queryKey: ['investimentos'],
    queryFn: async () => {
      const { data, error } = await supabase.from('investimentos').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Investimento[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('investimentos').insert(data);
      if (error) throw error;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['investimentos'] });
      queryClient.invalidateQueries({ queryKey: ['transacoes'] });
      toast.success("Investimento cadastrado com sucesso!");
      setOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase.from('investimentos').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investimentos'] });
      toast.success("Investimento atualizado com sucesso!");
      setOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('investimentos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investimentos'] });
      toast.success("Investimento excluído com sucesso!");
    },
  });

  const resetForm = () => {
    setFormData({
      tipo: "",
      instituicao: "",
      valor_aplicado: "",
      rentabilidade: "",
      prazo_dias: "",
      data_aplicacao: new Date().toISOString().split('T')[0],
      data_vencimento: "",
      status: "ativo",
      vincular_fluxo_caixa: false,
      observacoes: "",
    });
    setEditingInvestimento(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tipo || !formData.instituicao || !formData.valor_aplicado || !formData.rentabilidade || !formData.data_aplicacao) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const data: any = {
      tipo: formData.tipo,
      instituicao: formData.instituicao,
      valor_aplicado: Number(formData.valor_aplicado),
      rentabilidade: Number(formData.rentabilidade),
      prazo_dias: formData.prazo_dias ? Number(formData.prazo_dias) : null,
      data_aplicacao: formData.data_aplicacao,
      data_vencimento: formData.data_vencimento || null,
      status: formData.status,
      vincular_fluxo_caixa: formData.vincular_fluxo_caixa,
      observacoes: formData.observacoes || null,
      historico_rendimento: [],
    };

    if (editingInvestimento) {
      await updateMutation.mutateAsync({ id: editingInvestimento.id, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }

    // Se vincular_fluxo_caixa estiver marcado e houver data de vencimento, criar transação
    if (formData.vincular_fluxo_caixa && formData.data_vencimento) {
      const valorResgate = Number(formData.valor_aplicado) * (1 + Number(formData.rentabilidade) / 100);
      await supabase.from('transacoes').insert({
        tipo: 'entrada',
        descricao: `Resgate de Investimento - ${formData.tipo} - ${formData.instituicao}`,
        categoria: 'Investimentos',
        valor: valorResgate,
        data: formData.data_vencimento,
        area: 'investimentos',
      });
    }
  };

  const handleEdit = (investimento: Investimento) => {
    setEditingInvestimento(investimento);
    setFormData({
      tipo: investimento.tipo,
      instituicao: investimento.instituicao,
      valor_aplicado: String(investimento.valor_aplicado),
      rentabilidade: String(investimento.rentabilidade),
      prazo_dias: investimento.prazo_dias ? String(investimento.prazo_dias) : "",
      data_aplicacao: investimento.data_aplicacao,
      data_vencimento: investimento.data_vencimento || "",
      status: investimento.status,
      vincular_fluxo_caixa: investimento.vincular_fluxo_caixa || false,
      observacoes: investimento.observacoes || "",
    });
    setOpen(true);
  };

  const handleAbrirDetalhes = (investimento: Investimento) => {
    setInvestimentoSelecionado(investimento);
    setOpenDetalhes(true);
  };

  const calcularRentabilidade = (investimento: Investimento): number => {
    if (!investimento.data_vencimento) return 0;
    const dias = differenceInDays(new Date(investimento.data_vencimento), new Date(investimento.data_aplicacao));
    const taxaAnual = investimento.rentabilidade;
    const taxaDia = taxaAnual / 365;
    return investimento.valor_aplicado * (taxaDia * dias / 100);
  };

  const calcularValorResgate = (investimento: Investimento): number => {
    return investimento.valor_aplicado + calcularRentabilidade(investimento);
  };

  const investimentosFiltrados = investimentos?.filter((i) => {
    const matchBusca = 
      i.tipo.toLowerCase().includes(busca.toLowerCase()) ||
      i.instituicao.toLowerCase().includes(busca.toLowerCase()) ||
      i.data_vencimento?.includes(busca);
    const matchTipo = filtroTipo === "todos" || i.tipo === filtroTipo;
    const matchStatus = filtroStatus === "todos" || i.status === filtroStatus;
    return matchBusca && matchTipo && matchStatus;
  });

  const totalInvestido = investimentos?.reduce((acc, i) => acc + Number(i.valor_aplicado), 0) || 0;
  const investimentosVencendo = investimentos?.filter((i) => {
    if (!i.data_vencimento || i.status !== 'ativo') return false;
    const vencimento = new Date(i.data_vencimento);
    const hoje = new Date();
    const diffDays = differenceInDays(vencimento, hoje);
    return diffDays <= 30 && diffDays >= 0;
  }).length || 0;

  const tipos = Array.from(new Set(investimentos?.map(i => i.tipo) || []));

  // Dados para gráfico de evolução de investimentos (últimos 6 meses)
  const dadosEvolucaoInvestimentos = useMemo(() => {
    const meses = Array.from({ length: 6 }, (_, i) => {
      const mes = subMonths(new Date(), 5 - i);
      const inicio = startOfMonth(mes);
      const fim = endOfMonth(mes);
      
      const investimentosMes = investimentos?.filter((i) => {
        const dataAplicacao = new Date(i.data_aplicacao);
        return dataAplicacao >= inicio && dataAplicacao <= fim;
      }) || [];
      
      const totalAplicado = investimentosMes.reduce((acc, i) => acc + Number(i.valor_aplicado), 0);
      const totalRentabilidade = investimentosMes.reduce((acc, i) => acc + calcularRentabilidade(i), 0);
      
      return {
        mes: format(mes, 'MMM', { locale: ptBR }),
        aplicado: totalAplicado,
        rentabilidade: totalRentabilidade,
        total: totalAplicado + totalRentabilidade,
      };
    });
    
    return meses;
  }, [investimentos]);

  // Dados para gráfico de pizza por tipo
  const dadosPorTipo = useMemo(() => {
    const tiposMap = investimentos?.reduce((acc: Record<string, number>, i) => {
      const key = i.tipo || 'Outro';
      acc[key] = (acc[key] || 0) + Number(i.valor_aplicado);
      return acc;
    }, {}) || {};
    
    return Object.entries(tiposMap)
      .map(([name, value]) => ({ name, value: value as number }))
      .sort((a, b) => b.value - a.value);
  }, [investimentos]);

  // Dados para gráfico de pizza por status
  const dadosPorStatus = useMemo(() => {
    const statusMap = investimentos?.reduce((acc: Record<string, number>, i) => {
      const key = i.status || 'ativo';
      acc[key] = (acc[key] || 0) + Number(i.valor_aplicado);
      return acc;
    }, {}) || {};
    
    return Object.entries(statusMap)
      .map(([name, value]) => ({ name, value: value as number }));
  }, [investimentos]);

  // Cores para gráficos de pizza
  const COLORS_TIPO = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];
  const COLORS_STATUS = ['#10b981', '#3b82f6', '#6b7280'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BotaoVoltar />
          <div>
            <h1 className="text-3xl font-bold">Investimentos</h1>
            <p className="text-muted-foreground">Organize suas aplicações e retornos financeiros</p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Investimento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingInvestimento ? 'Editar Investimento' : 'Novo Investimento'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CDB">CDB</SelectItem>
                      <SelectItem value="Tesouro">Tesouro</SelectItem>
                      <SelectItem value="Ações">Ações</SelectItem>
                      <SelectItem value="Fundo">Fundo</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <InstituicaoFinanceiraAutocomplete
                    value={formData.instituicao}
                    onChange={(value) => setFormData({ ...formData, instituicao: value })}
                    label="Banco/Instituição"
                    required={true}
                    placeholder="Digite o nome da instituição..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valor_aplicado">Valor Investido *</Label>
                  <Input id="valor_aplicado" type="number" step="0.01" value={formData.valor_aplicado} onChange={(e) => setFormData({ ...formData, valor_aplicado: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="rentabilidade">Taxa (%) *</Label>
                  <Input id="rentabilidade" type="number" step="0.01" value={formData.rentabilidade} onChange={(e) => setFormData({ ...formData, rentabilidade: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prazo_dias">Prazo (dias)</Label>
                  <Input id="prazo_dias" type="number" value={formData.prazo_dias} onChange={(e) => setFormData({ ...formData, prazo_dias: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="data_aplicacao">Data de Aplicação *</Label>
                  <Input id="data_aplicacao" type="date" value={formData.data_aplicacao} onChange={(e) => setFormData({ ...formData, data_aplicacao: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_vencimento">Data de Vencimento</Label>
                  <Input id="data_vencimento" type="date" value={formData.data_vencimento} onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="resgatado">Resgatado</SelectItem>
                      <SelectItem value="vencido">Vencido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="vincular_fluxo_caixa" checked={formData.vincular_fluxo_caixa} onCheckedChange={(checked) => setFormData({ ...formData, vincular_fluxo_caixa: checked as boolean })} />
                <Label htmlFor="vincular_fluxo_caixa">Vincular ao Fluxo de Caixa (gera previsão de resgate)</Label>
              </div>
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 hover:shadow-primary/20 hover:border-primary/50 group">
          <p className="text-sm text-muted-foreground">Total Investido</p>
          <h3 className="text-2xl font-bold">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalInvestido)}
          </h3>
        </Card>
        <Card className="p-4 hover:shadow-yellow-500/20 hover:border-yellow-500/50 group">
          <p className="text-sm text-muted-foreground">Vencendo em 30 dias</p>
          <h3 className="text-2xl font-bold text-yellow-500">{investimentosVencendo}</h3>
        </Card>
      </div>

      {/* Gráficos de Investimentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico de Evolução */}
        <Card className="p-4 sm:p-6">
          <CardHeader>
            <CardTitle className="text-lg">Evolução de Investimentos - Últimos 6 Meses</CardTitle>
          </CardHeader>
          <CardContent>
            {dadosEvolucaoInvestimentos.length > 0 && dadosEvolucaoInvestimentos.some(d => d.aplicado > 0) ? (
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dadosEvolucaoInvestimentos} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAplicado" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.secondary} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={chartColors.secondary} stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorRentabilidade" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.2} />
                    <XAxis 
                      dataKey="mes" 
                      stroke={chartColors.axis}
                      tick={{ fill: chartColors.axis }}
                      style={{ fontSize: '11px' }}
                    />
                    <YAxis 
                      stroke={chartColors.axis}
                      tick={{ fill: chartColors.axis }}
                      tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                      style={{ fontSize: '11px' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartColors.tooltipBg,
                        border: `1px solid ${chartColors.tooltipBorder}`,
                        borderRadius: '8px',
                        padding: '10px',
                      }}
                      formatter={(value: number) => new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(value)}
                      labelStyle={{ color: chartColors.text, fontWeight: 'bold' }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px', color: chartColors.text }}
                      iconType="circle"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="aplicado" 
                      stroke={chartColors.secondary} 
                      fillOpacity={1} 
                      fill="url(#colorAplicado)" 
                      name="Valor Aplicado"
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="rentabilidade" 
                      stroke={chartColors.primary} 
                      fillOpacity={1} 
                      fill="url(#colorRentabilidade)" 
                      name="Rentabilidade"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum investimento registrado</p>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Distribuição por Tipo */}
        <Card className="p-4 sm:p-6">
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            {dadosPorTipo.length > 0 ? (
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosPorTipo}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      animationDuration={1000}
                    >
                      {dadosPorTipo.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_TIPO[index % COLORS_TIPO.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartColors.tooltipBg,
                        border: `1px solid ${chartColors.tooltipBorder}`,
                        borderRadius: '8px',
                        padding: '10px',
                      }}
                      formatter={(value: number) => new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(value)}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px', color: chartColors.text }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum tipo encontrado</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Status */}
      {dadosPorStatus.length > 0 && (
        <Card className="p-4 sm:p-6">
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosPorStatus} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.2} />
                  <XAxis 
                    dataKey="name" 
                    stroke={chartColors.axis}
                    tick={{ fill: chartColors.axis }}
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis 
                    stroke={chartColors.axis}
                    tick={{ fill: chartColors.axis }}
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    style={{ fontSize: '11px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.tooltipBg,
                      border: `1px solid ${chartColors.tooltipBorder}`,
                      borderRadius: '8px',
                      padding: '10px',
                    }}
                    formatter={(value: number) => new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(value)}
                    labelStyle={{ color: chartColors.text, fontWeight: 'bold' }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill={chartColors.primary}
                    radius={[8, 8, 0, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por tipo, banco ou vencimento..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Tipos</SelectItem>
            {tipos.map((tipo) => (
              <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="resgatado">Resgatado</SelectItem>
            <SelectItem value="vencido">Vencido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Banco</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Taxa</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead>Rentabilidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">Carregando...</TableCell>
              </TableRow>
            ) : investimentosFiltrados && investimentosFiltrados.length > 0 ? (
              investimentosFiltrados.map((investimento) => {
                const rentabilidade = calcularRentabilidade(investimento);
                const valorResgate = calcularValorResgate(investimento);
                return (
                  <TableRow key={investimento.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleAbrirDetalhes(investimento)}>
                    <TableCell className="font-medium">{investimento.tipo}</TableCell>
                    <TableCell>{investimento.instituicao}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(investimento.valor_aplicado))}
                    </TableCell>
                    <TableCell>{investimento.rentabilidade}%</TableCell>
                    <TableCell>{investimento.prazo_dias ? `${investimento.prazo_dias} dias` : "-"}</TableCell>
                    <TableCell className="text-green-500 font-semibold">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rentabilidade)}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        investimento.status === 'ativo' ? 'bg-green-500' :
                        investimento.status === 'resgatado' ? 'bg-blue-500' :
                        'bg-gray-500'
                      }>
                        {investimento.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleAbrirDetalhes(investimento)}>
                          <LineChart className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(investimento)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(investimento.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center">Nenhum investimento encontrado</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={openDetalhes} onOpenChange={setOpenDetalhes}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Investimento - {investimentoSelecionado?.tipo}</DialogTitle>
          </DialogHeader>
          {investimentoSelecionado && (
            <div className="space-y-4">
              <Tabs defaultValue="dados">
                <TabsList>
                  <TabsTrigger value="dados">Dados</TabsTrigger>
                  <TabsTrigger value="grafico">Gráfico de Rentabilidade</TabsTrigger>
                  <TabsTrigger value="historico">Histórico de Rendimento</TabsTrigger>
                </TabsList>

                <TabsContent value="dados" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo</Label>
                      <p className="font-medium">{investimentoSelecionado.tipo}</p>
                    </div>
                    <div>
                      <Label>Banco/Instituição</Label>
                      <p className="font-medium">{investimentoSelecionado.instituicao}</p>
                    </div>
                    <div>
                      <Label>Valor Investido</Label>
                      <p className="font-medium">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(investimentoSelecionado.valor_aplicado))}
                      </p>
                    </div>
                    <div>
                      <Label>Taxa de Rentabilidade</Label>
                      <p className="font-medium">{investimentoSelecionado.rentabilidade}%</p>
                    </div>
                    <div>
                      <Label>Data de Aplicação</Label>
                      <p className="font-medium">{format(new Date(investimentoSelecionado.data_aplicacao), 'dd/MM/yyyy', { locale: ptBR })}</p>
                    </div>
                    <div>
                      <Label>Data de Vencimento</Label>
                      <p className="font-medium">
                        {investimentoSelecionado.data_vencimento ? format(new Date(investimentoSelecionado.data_vencimento), 'dd/MM/yyyy', { locale: ptBR }) : "-"}
                      </p>
                    </div>
                    <div>
                      <Label>Rentabilidade Calculada</Label>
                      <p className="font-medium text-green-500">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calcularRentabilidade(investimentoSelecionado))}
                      </p>
                    </div>
                    <div>
                      <Label>Valor de Resgate Estimado</Label>
                      <p className="font-medium text-green-500">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calcularValorResgate(investimentoSelecionado))}
                      </p>
                    </div>
                  </div>
                  {investimentoSelecionado.observacoes && (
                    <div>
                      <Label>Observações</Label>
                      <p className="text-sm text-muted-foreground">{investimentoSelecionado.observacoes}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="grafico" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Gráfico de Rentabilidade</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsLineChart data={[
                          { periodo: 'Aplicação', valor: investimentoSelecionado.valor_aplicado },
                          { periodo: 'Vencimento', valor: calcularValorResgate(investimentoSelecionado) },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="periodo" />
                          <YAxis />
                          <Tooltip formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} />
                          <Legend />
                          <Line type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={2} />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="historico" className="space-y-4">
                  <Label>Histórico de Rendimento</Label>
                  {investimentoSelecionado.historico_rendimento && investimentoSelecionado.historico_rendimento.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {investimentoSelecionado.historico_rendimento.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{format(new Date(item.data), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground">Nenhum histórico de rendimento registrado.</p>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => handleEdit(investimentoSelecionado)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline" onClick={() => {
                  gerarPDFRelatorio(
                    `Relatório - ${investimentoSelecionado.tipo}`,
                    [{
                      Tipo: investimentoSelecionado.tipo,
                      Banco: investimentoSelecionado.instituicao,
                      'Valor Investido': Number(investimentoSelecionado.valor_aplicado),
                      Taxa: `${investimentoSelecionado.rentabilidade}%`,
                      'Valor Resgate': calcularValorResgate(investimentoSelecionado),
                    }],
                    ['Tipo', 'Banco', 'Valor Investido', 'Taxa', 'Valor Resgate']
                  );
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
