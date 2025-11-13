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
import { toast } from "sonner";
import { BotaoVoltar } from "@/components/BotaoVoltar";
import { PlanilhaFinanceira } from "@/components/PlanilhaFinanceira";
import { Plus, Edit, Trash2, DollarSign, Download, FileSpreadsheet } from "lucide-react";
import { gerarPDFRelatorio } from "@/lib/pdf-utils";
import { gerarExcelRelatorio } from "@/lib/excel-utils";
import { format, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTheme } from "next-themes";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Transacao {
  id: string;
  tipo: 'entrada' | 'saida';
  descricao: string;
  categoria: string;
  valor: number;
  data: string;
  area: string | null;
  observacoes: string | null;
}

export default function EntradaCaixa() {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [openPlanilha, setOpenPlanilha] = useState(false);
  const [editingTransacao, setEditingTransacao] = useState<Transacao | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos");

  // Cores dos gráficos adaptáveis ao tema
  const chartColors = useMemo(() => {
    const isDark = theme === 'dark';
    return {
      primary: '#22c55e',
      grid: isDark ? '#374151' : '#e5e7eb',
      axis: isDark ? '#9ca3af' : '#6b7280',
      text: isDark ? '#f3f4f6' : '#111827',
      tooltipBg: isDark ? '#1f2937' : '#ffffff',
      tooltipBorder: isDark ? '#374151' : '#e5e7eb',
    };
  }, [theme]);

  const [formData, setFormData] = useState<{
    descricao: string;
    categoria: string;
    valor: string;
    data: string;
    area: string;
    observacoes: string;
  }>({
    descricao: "",
    categoria: "",
    valor: "",
    data: new Date().toISOString().split('T')[0],
    area: "",
    observacoes: "",
  });

  const { data: transacoes, isLoading } = useQuery({
    queryKey: ['transacoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transacoes')
        .select('*')
        .eq('tipo', 'entrada')
        .order('data', { ascending: false });
      if (error) throw error;
      return data as Transacao[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Transacao, 'id'>) => {
      const { error } = await supabase.from('transacoes').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transacoes'] });
      toast.success("Entrada registrada com sucesso!");
      setOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Erro ao registrar entrada");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Transacao) => {
      const { error } = await supabase.from('transacoes').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transacoes'] });
      toast.success("Entrada atualizada com sucesso!");
      setOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Erro ao atualizar entrada");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('transacoes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transacoes'] });
      toast.success("Entrada excluída com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir entrada");
    },
  });

  const resetForm = () => {
    setFormData({
      descricao: "",
      categoria: "",
      valor: "",
      data: new Date().toISOString().split('T')[0],
      area: "",
      observacoes: "",
    });
    setEditingTransacao(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descricao || !formData.categoria || !formData.valor || !formData.data) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const data = {
      tipo: 'entrada' as const,
      descricao: formData.descricao,
      categoria: formData.categoria,
      valor: Number(formData.valor),
      data: formData.data,
      area: formData.area || null,
      observacoes: formData.observacoes || null,
    };

    if (editingTransacao) {
      updateMutation.mutate({ ...data, id: editingTransacao.id } as Transacao);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (transacao: Transacao) => {
    setEditingTransacao(transacao);
    setFormData({
      descricao: transacao.descricao,
      categoria: transacao.categoria,
      valor: String(transacao.valor),
      data: transacao.data,
      area: transacao.area || "",
      observacoes: transacao.observacoes || "",
    });
    setOpen(true);
  };

  const transacoesFiltradas = transacoes?.filter((t) => {
    const matchBusca = t.descricao.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = filtroCategoria === "todos" || t.categoria === filtroCategoria;
    return matchBusca && matchCategoria;
  });

  const totalEntradas = transacoesFiltradas?.reduce((acc, t) => acc + Number(t.valor), 0) || 0;
  const categorias = Array.from(new Set(transacoes?.map(t => t.categoria) || []));

  // Dados para gráfico de evolução mensal (últimos 6 meses)
  const dadosEvolucaoMensal = useMemo(() => {
    const meses = Array.from({ length: 6 }, (_, i) => {
      const mes = subMonths(new Date(), 5 - i);
      const inicio = startOfMonth(mes);
      const fim = endOfMonth(mes);
      
      const entradasMes = transacoes?.filter((t) => {
        if (t.tipo !== 'entrada') return false;
        const dataTransacao = new Date(t.data);
        return dataTransacao >= inicio && dataTransacao <= fim;
      }) || [];
      
      const total = entradasMes.reduce((acc, t) => acc + Number(t.valor), 0);
      
      return {
        mes: format(mes, 'MMM', { locale: ptBR }),
        valor: total,
      };
    });
    
    return meses;
  }, [transacoes]);

  // Dados para gráfico de categorias (pizza)
  const dadosCategorias = useMemo(() => {
    const categoriasMap = transacoes?.reduce((acc: Record<string, number>, t) => {
      if (t.tipo !== 'entrada') return acc;
      const key = t.categoria || 'Sem categoria';
      acc[key] = (acc[key] || 0) + Number(t.valor);
      return acc;
    }, {}) || {};
    
    return Object.entries(categoriasMap)
      .map(([name, value]) => ({ name, value: value as number }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [transacoes]);

  // Dados para gráfico semanal (últimas 4 semanas)
  const dadosSemanais = useMemo(() => {
    const hoje = new Date();
    const semanas = Array.from({ length: 4 }, (_, i) => {
      const semanaInicio = startOfWeek(subMonths(hoje, i === 0 ? 0 : Math.floor(i / 4)), { weekStartsOn: 1 });
      const semanaFim = endOfWeek(semanaInicio, { weekStartsOn: 1 });
      
      const entradasSemana = transacoes?.filter((t) => {
        if (t.tipo !== 'entrada') return false;
        const dataTransacao = new Date(t.data);
        return dataTransacao >= semanaInicio && dataTransacao <= semanaFim;
      }) || [];
      
      const total = entradasSemana.reduce((acc, t) => acc + Number(t.valor), 0);
      
      return {
        semana: `Sem ${format(semanaInicio, 'dd/MM', { locale: ptBR })}`,
        valor: total,
      };
    }).reverse();
    
    return semanas;
  }, [transacoes]);

  // Cores para gráfico de pizza
  const COLORS = ['#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7'];

  const handleExportarPDF = () => {
    const dadosFormatados = (transacoesFiltradas || []).map(transacao => ({
      data: format(new Date(transacao.data), 'dd/MM/yyyy', { locale: ptBR }),
      descricao: transacao.descricao,
      categoria: transacao.categoria,
      valor: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transacao.valor),
      observacoes: transacao.observacoes || '-',
    }));

    gerarPDFRelatorio({
      titulo: 'Relatório de Entradas de Caixa',
      dados: dadosFormatados,
      colunas: ['Data', 'Descrição', 'Categoria', 'Valor', 'Observações'],
    });
  };

  const handleExportarExcel = () => {
    const dadosFormatados = (transacoesFiltradas || []).map(transacao => ({
      data: format(new Date(transacao.data), 'dd/MM/yyyy', { locale: ptBR }),
      descricao: transacao.descricao,
      categoria: transacao.categoria,
      valor: transacao.valor,
      observacoes: transacao.observacoes || '-',
    }));

    gerarExcelRelatorio({
      titulo: 'Relatório de Entradas de Caixa',
      dados: dadosFormatados,
      colunas: ['Data', 'Descrição', 'Categoria', 'Valor', 'Observações'],
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in p-2 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <BotaoVoltar />
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Entrada de Caixa</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Registre as entradas financeiras</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setOpenPlanilha(true)}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Visualizar Modelo Planilha
          </Button>
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
              Nova Entrada
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTransacao ? 'Editar Entrada' : 'Nova Entrada'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="descricao">Descrição *</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Input
                    id="categoria"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    placeholder="Ex: Vendas, Serviços, etc."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="valor">Valor *</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data">Data *</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="area">Área</Label>
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="Ex: Jurídico, Imóveis, etc."
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingTransacao ? 'Atualizar' : 'Registrar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card className="p-4 sm:p-6 hover:shadow-green-500/20 hover:border-green-500/50 group">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 bg-green-500/10 rounded-lg transition-transform duration-200 group-hover:scale-110">
            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Total de Entradas</p>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-green-500">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalEntradas)}
            </h3>
          </div>
        </div>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico de Evolução Mensal */}
        <Card className="p-4 sm:p-6">
          <CardHeader>
            <CardTitle className="text-lg">Evolução Mensal - Últimos 6 Meses</CardTitle>
          </CardHeader>
          <CardContent>
            {dadosEvolucaoMensal.length > 0 && dadosEvolucaoMensal.some(d => d.valor > 0) ? (
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dadosEvolucaoMensal} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
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
                    <Area 
                      type="monotone" 
                      dataKey="valor" 
                      stroke={chartColors.primary} 
                      fillOpacity={1} 
                      fill="url(#colorEntradas)" 
                      name="Entradas"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhuma entrada registrada</p>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Categorias */}
        <Card className="p-4 sm:p-6">
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {dadosCategorias.length > 0 ? (
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosCategorias}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      animationDuration={1000}
                    >
                      {dadosCategorias.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
              <p className="text-center text-muted-foreground py-8">Nenhuma categoria encontrada</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Semanal */}
      {dadosSemanais.length > 0 && dadosSemanais.some(d => d.valor > 0) && (
        <Card className="p-4 sm:p-6">
          <CardHeader>
            <CardTitle className="text-lg">Evolução Semanal - Últimas 4 Semanas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosSemanais} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.2} />
                  <XAxis 
                    dataKey="semana" 
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
                    dataKey="valor" 
                    fill={chartColors.primary} 
                    name="Entradas"
                    radius={[8, 8, 0, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <Input
          placeholder="Buscar entradas..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full sm:max-w-sm"
        />
        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as Categorias</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm">Data</TableHead>
                <TableHead className="text-xs sm:text-sm">Descrição</TableHead>
                <TableHead className="hidden sm:table-cell text-xs sm:text-sm">Categoria</TableHead>
                <TableHead className="hidden md:table-cell text-xs sm:text-sm">Área</TableHead>
                <TableHead className="text-right text-xs sm:text-sm">Valor</TableHead>
                <TableHead className="text-right text-xs sm:text-sm">Ações</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Carregando...</TableCell>
              </TableRow>
            ) : transacoesFiltradas && transacoesFiltradas.length > 0 ? (
              transacoesFiltradas.map((transacao) => (
                <TableRow key={transacao.id}>
                  <TableCell className="text-xs sm:text-sm">{format(new Date(transacao.data), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                  <TableCell className="font-medium text-xs sm:text-sm">{transacao.descricao}</TableCell>
                  <TableCell className="hidden sm:table-cell text-xs sm:text-sm">{transacao.categoria}</TableCell>
                  <TableCell className="hidden md:table-cell text-xs sm:text-sm">{transacao.area || "-"}</TableCell>
                  <TableCell className="text-right text-green-500 font-semibold text-xs sm:text-sm">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(transacao.valor))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(transacao)} className="h-8 w-8">
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(transacao.id)} className="h-8 w-8">
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Nenhuma entrada encontrada</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </Card>

      <PlanilhaFinanceira
        open={openPlanilha}
        onOpenChange={setOpenPlanilha}
        transacoes={transacoes || []}
        tipo="entrada"
      />
    </div>
  );
}
