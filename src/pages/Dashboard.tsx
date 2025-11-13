import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Scale, 
  DollarSign, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  CheckSquare,
  ArrowRight,
  Eye,
  Calendar,
  Download,
  GitCompare,
  BarChart3,
  FileSpreadsheet,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { gerarPDFRelatorio } from "@/lib/pdf-utils";
import { gerarExcelRelatorio } from "@/lib/excel-utils";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Area
} from "recharts";

export default function Dashboard() {
  const [dialogAberto, setDialogAberto] = useState<string | null>(null);
  const [detalhesDados, setDetalhesDados] = useState<any>(null);
  const [mesSelecionado, setMesSelecionado] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [openComparativo, setOpenComparativo] = useState(false);
  const [mesComparativo1, setMesComparativo1] = useState<string>(format(subMonths(new Date(), 1), 'yyyy-MM'));
  const [mesComparativo2, setMesComparativo2] = useState<string>(format(new Date(), 'yyyy-MM'));

  const { data: clientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('clientes').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: processos } = useQuery({
    queryKey: ['processos'],
    queryFn: async () => {
      const { data, error } = await supabase.from('processos').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: transacoes } = useQuery({
    queryKey: ['transacoes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('transacoes').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: tarefas } = useQuery({
    queryKey: ['tarefas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tarefas').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const calcularDadosMes = (mes: Date) => {
    const inicio = startOfMonth(mes);
    const fim = endOfMonth(mes);

    const transacoesMes = transacoes?.filter((t) => {
      const dataTransacao = new Date(t.data);
      return dataTransacao >= inicio && dataTransacao <= fim;
    }) || [];

    const entradas = transacoesMes
      .filter((t) => t.tipo === 'entrada')
      .reduce((acc, t) => acc + Number(t.valor), 0);

    const saidas = transacoesMes
      .filter((t) => t.tipo === 'saida')
      .reduce((acc, t) => acc + Number(t.valor), 0);

    return { entradas, saidas, saldo: entradas - saidas };
  };

  const mesAtual = mesSelecionado ? parse(mesSelecionado + '-01', 'yyyy-MM-dd', new Date()) : new Date();
  const mesAnterior = subMonths(mesAtual, 1);

  const dadosMesAtual = calcularDadosMes(mesAtual);
  const dadosMesAnterior = calcularDadosMes(mesAnterior);

  const variacaoSaldo = dadosMesAnterior.saldo !== 0
    ? ((dadosMesAtual.saldo - dadosMesAnterior.saldo) / Math.abs(dadosMesAnterior.saldo)) * 100
    : 0;

  const tarefasMes = tarefas?.filter((tarefa) => {
    const dataVencimento = new Date(tarefa.data_vencimento);
    return (
      dataVencimento >= startOfMonth(mesAtual) &&
      dataVencimento <= endOfMonth(mesAtual)
    );
  }) || [];

  const saldoCaixaTotal = transacoes?.reduce((acc, t) => {
    return t.tipo === 'entrada' ? acc + Number(t.valor) : acc - Number(t.valor);
  }, 0) || 0;

  const handleCardClick = (tipo: string) => {
    setDialogAberto(tipo);
    switch (tipo) {
      case 'clientes':
        setDetalhesDados({
          titulo: 'Detalhes dos Clientes',
          dados: clientes || [],
          colunas: ['nome', 'tipo', 'telefone', 'email', 'status'],
        });
        break;
      case 'processos':
        setDetalhesDados({
          titulo: 'Detalhes dos Processos',
          dados: processos || [],
          colunas: ['numero_processo', 'tipo', 'status', 'data_inicial', 'valor_causa'],
        });
        break;
      case 'tarefas':
        setDetalhesDados({
          titulo: 'Tarefas do Mês',
          dados: tarefasMes || [],
          colunas: ['titulo', 'status', 'prioridade', 'data_vencimento', 'responsavel'],
        });
        break;
      case 'saldo':
        setDetalhesDados({
          titulo: 'Detalhes do Saldo de Caixa',
          dados: transacoes || [],
          colunas: ['descricao', 'tipo', 'categoria', 'valor', 'data'],
        });
        break;
      case 'entradas':
        setDetalhesDados({
          titulo: 'Entradas do Mês',
          dados: transacoes?.filter(t => {
            if (t.tipo !== 'entrada') return false;
            const dataTransacao = new Date(t.data);
            return dataTransacao >= startOfMonth(mesAtual) && dataTransacao <= endOfMonth(mesAtual);
          }) || [],
          colunas: ['descricao', 'categoria', 'valor', 'data'],
        });
        break;
      case 'saidas':
        setDetalhesDados({
          titulo: 'Saídas do Mês',
          dados: transacoes?.filter(t => {
            if (t.tipo !== 'saida') return false;
            const dataTransacao = new Date(t.data);
            return dataTransacao >= startOfMonth(mesAtual) && dataTransacao <= endOfMonth(mesAtual);
          }) || [],
          colunas: ['descricao', 'categoria', 'valor', 'data'],
        });
        break;
    }
  };

  const formatarValor = (valor: any) => {
    if (typeof valor === 'number') {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    }
    return valor || '-';
  };

  const formatarData = (data: string) => {
    if (!data) return '-';
    return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR });
  };

  const handleExportarPDF = () => {
    gerarPDFRelatorio({
      titulo: `Dashboard - ${format(mesAtual, 'MMMM yyyy', { locale: ptBR })}`,
      dados: [
        { label: 'Total de Clientes', valor: clientes?.length || 0 },
        { label: 'Total de Processos', valor: processos?.length || 0 },
        { label: 'Tarefas do Mês', valor: tarefasMes.length },
        { label: 'Saldo Total de Caixa', valor: saldoCaixaTotal },
        { label: 'Entradas do Mês', valor: dadosMesAtual.entradas },
        { label: 'Saídas do Mês', valor: dadosMesAtual.saidas },
        { label: 'Saldo do Mês', valor: dadosMesAtual.saldo },
      ],
      colunas: ['Indicador', 'Valor'],
    });
  };

  const handleExportarExcel = () => {
    gerarExcelRelatorio({
      titulo: `Dashboard - ${format(mesAtual, 'MMMM yyyy', { locale: ptBR })}`,
      dados: [
        { label: 'Total de Clientes', valor: clientes?.length || 0 },
        { label: 'Total de Processos', valor: processos?.length || 0 },
        { label: 'Tarefas do Mês', valor: tarefasMes.length },
        { label: 'Saldo Total de Caixa', valor: saldoCaixaTotal },
        { label: 'Entradas do Mês', valor: dadosMesAtual.entradas },
        { label: 'Saídas do Mês', valor: dadosMesAtual.saidas },
        { label: 'Saldo do Mês', valor: dadosMesAtual.saldo },
      ],
      colunas: ['Indicador', 'Valor'],
    });
  };

  const handleComparativo = () => {
    setOpenComparativo(true);
  };

  const aplicarComparativo = () => {
    setMesSelecionado(mesComparativo2);
    setOpenComparativo(false);
  };

  const dadosComparativo1 = mesComparativo1 ? calcularDadosMes(parse(mesComparativo1 + '-01', 'yyyy-MM-dd', new Date())) : { entradas: 0, saidas: 0, saldo: 0 };
  const dadosComparativo2 = mesComparativo2 ? calcularDadosMes(parse(mesComparativo2 + '-01', 'yyyy-MM-dd', new Date())) : { entradas: 0, saidas: 0, saldo: 0 };

  // Dados para gráficos
  const dadosGraficoComparativo = [
    {
      nome: format(parse(mesComparativo1 + '-01', 'yyyy-MM-dd', new Date()), 'MMM/yyyy', { locale: ptBR }),
      entradas: dadosComparativo1.entradas,
      saidas: dadosComparativo1.saidas,
      saldo: dadosComparativo1.saldo,
    },
    {
      nome: format(parse(mesComparativo2 + '-01', 'yyyy-MM-dd', new Date()), 'MMM/yyyy', { locale: ptBR }),
      entradas: dadosComparativo2.entradas,
      saidas: dadosComparativo2.saidas,
      saldo: dadosComparativo2.saldo,
    },
  ];

  const dadosGraficoPizza = [
    { name: 'Entradas Mês 1', value: dadosComparativo1.entradas },
    { name: 'Saídas Mês 1', value: dadosComparativo1.saidas },
    { name: 'Entradas Mês 2', value: dadosComparativo2.entradas },
    { name: 'Saídas Mês 2', value: dadosComparativo2.saidas },
  ];

  const COLORS = ['#10B981', '#EF4444', '#3B82F6', '#F59E0B'];

  const variacaoEntradas = dadosComparativo1.entradas !== 0
    ? ((dadosComparativo2.entradas - dadosComparativo1.entradas) / dadosComparativo1.entradas) * 100
    : 0;
  const variacaoSaidas = dadosComparativo1.saidas !== 0
    ? ((dadosComparativo2.saidas - dadosComparativo1.saidas) / dadosComparativo1.saidas) * 100
    : 0;
  const variacaoSaldoComp = dadosComparativo1.saldo !== 0
    ? ((dadosComparativo2.saldo - dadosComparativo1.saldo) / Math.abs(dadosComparativo1.saldo)) * 100
    : 0;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in p-2 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Dashboard</h1>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleComparativo} className="flex-1 sm:flex-initial">
            <GitCompare className="h-4 w-4 mr-2" />
            Comparativo
          </Button>
          <Button variant="outline" onClick={handleExportarPDF} className="flex-1 sm:flex-initial">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={handleExportarExcel} className="flex-1 sm:flex-initial">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Baixar Excel
          </Button>
        </div>
      </div>

      {/* Seletor de Mês/Ano */}
      <Card className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <Label htmlFor="mes-ano" className="text-xs sm:text-sm">Selecione o Mês/Ano:</Label>
            <Input
              id="mes-ano"
              type="month"
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(e.target.value)}
              className="w-full sm:w-48"
            />
          </div>
        </div>
      </Card>

      {/* Cards de estatísticas gerais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <Card 
          className="p-4 sm:p-6 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105 active:scale-95 cursor-pointer border-2 hover:border-blue-500/50 group"
          onClick={() => handleCardClick('clientes')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-blue-500/10 rounded-lg transition-transform duration-200 group-hover:scale-110">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total de Clientes</p>
                <h3 className="text-xl sm:text-2xl font-bold">{clientes?.length || 0}</h3>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
        </Card>

        <Card 
          className="p-4 sm:p-6 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105 active:scale-95 cursor-pointer border-2 hover:border-purple-500/50 group"
          onClick={() => handleCardClick('processos')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-purple-500/10 rounded-lg transition-transform duration-200 group-hover:scale-110">
                <Scale className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total de Processos</p>
                <h3 className="text-xl sm:text-2xl font-bold">{processos?.length || 0}</h3>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
        </Card>

        <Card 
          className="p-4 sm:p-6 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20 hover:scale-105 active:scale-95 cursor-pointer border-2 hover:border-green-500/50 group"
          onClick={() => handleCardClick('tarefas')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-green-500/10 rounded-lg transition-transform duration-200 group-hover:scale-110">
                <CheckSquare className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Tarefas do Mês</p>
                <h3 className="text-xl sm:text-2xl font-bold">{tarefasMes.length}</h3>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
        </Card>
      </div>

      {/* Cards financeiros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <Card 
          className="p-4 sm:p-6 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20 hover:scale-105 active:scale-95 cursor-pointer border-2 hover:border-green-500/50 group"
          onClick={() => handleCardClick('saldo')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center justify-between">
              Saldo Total de Caixa
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0" />
              <span className="text-xl sm:text-2xl md:text-3xl font-bold break-all">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoCaixaTotal)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="p-4 sm:p-6 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20 hover:scale-105 active:scale-95 cursor-pointer border-2 hover:border-green-500/50 group"
          onClick={() => handleCardClick('entradas')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center justify-between">
              Entradas do Mês
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0" />
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-green-500 break-all">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosMesAtual.entradas)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="p-4 sm:p-6 transition-all duration-200 hover:shadow-lg hover:shadow-red-500/20 hover:scale-105 active:scale-95 cursor-pointer border-2 hover:border-red-500/50 group"
          onClick={() => handleCardClick('saidas')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center justify-between">
              Saídas do Mês
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 shrink-0" />
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-red-500 break-all">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosMesAtual.saidas)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo do mês */}
      <Card className="p-4 sm:p-6">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg md:text-xl">Resumo Financeiro - {format(mesAtual, 'MMMM yyyy', { locale: ptBR })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground">Saldo do Mês:</span>
              <span className={`text-lg sm:text-xl md:text-2xl font-bold break-all ${dadosMesAtual.saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosMesAtual.saldo)}
              </span>
            </div>
            {variacaoSaldo !== 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {variacaoSaldo > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span>
                  {variacaoSaldo > 0 ? '+' : ''}{variacaoSaldo.toFixed(2)}% em relação ao mês anterior
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Comparativo */}
      <Dialog open={openComparativo} onOpenChange={setOpenComparativo}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-6xl max-h-[90vh] overflow-y-auto p-2 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl md:text-2xl">Comparativo Financeiro Interativo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 sm:space-y-6">
            {/* Seletores de Período */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Card className="p-4">
                <Label htmlFor="mes1" className="text-sm font-semibold mb-2 block">Selecione Mês e Ano 1:</Label>
                <Input
                  id="mes1"
                  type="month"
                  value={mesComparativo1}
                  onChange={(e) => setMesComparativo1(e.target.value)}
                  className="w-full"
                />
                <div className="mt-2 text-xs text-muted-foreground">
                  {format(parse(mesComparativo1 + '-01', 'yyyy-MM-dd', new Date()), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </div>
              </Card>
              <Card className="p-4">
                <Label htmlFor="mes2" className="text-sm font-semibold mb-2 block">Selecione Mês e Ano 2:</Label>
                <Input
                  id="mes2"
                  type="month"
                  value={mesComparativo2}
                  onChange={(e) => setMesComparativo2(e.target.value)}
                  className="w-full"
                />
                <div className="mt-2 text-xs text-muted-foreground">
                  {format(parse(mesComparativo2 + '-01', 'yyyy-MM-dd', new Date()), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </div>
              </Card>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <Card className="p-3 sm:p-4 border-l-4 border-l-green-500">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground">Entradas</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-500 break-all">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosComparativo1.entradas)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      vs {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosComparativo2.entradas)}
                    </p>
                  </div>
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 shrink-0 ml-2" />
                </div>
                <div className="mt-2">
                  <Badge className={variacaoEntradas >= 0 ? 'bg-green-500' : 'bg-red-500'}>
                    {variacaoEntradas >= 0 ? '+' : ''}{variacaoEntradas.toFixed(2)}%
                  </Badge>
                </div>
              </Card>

              <Card className="p-3 sm:p-4 border-l-4 border-l-red-500">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground">Saídas</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-500 break-all">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosComparativo1.saidas)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      vs {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosComparativo2.saidas)}
                    </p>
                  </div>
                  <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 shrink-0 ml-2" />
                </div>
                <div className="mt-2">
                  <Badge className={variacaoSaidas <= 0 ? 'bg-green-500' : 'bg-red-500'}>
                    {variacaoSaidas >= 0 ? '+' : ''}{variacaoSaidas.toFixed(2)}%
                  </Badge>
                </div>
              </Card>

              <Card className={`p-3 sm:p-4 border-l-4 ${dadosComparativo1.saldo >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground">Saldo</p>
                    <p className={`text-lg sm:text-xl md:text-2xl font-bold break-all ${dadosComparativo1.saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosComparativo1.saldo)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      vs {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosComparativo2.saldo)}
                    </p>
                  </div>
                  {dadosComparativo1.saldo >= 0 ? (
                    <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 shrink-0 ml-2" />
                  ) : (
                    <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 shrink-0 ml-2" />
                  )}
                </div>
                <div className="mt-2">
                  <Badge className={variacaoSaldoComp >= 0 ? 'bg-green-500' : 'bg-red-500'}>
                    {variacaoSaldoComp >= 0 ? '+' : ''}{variacaoSaldoComp.toFixed(2)}%
                  </Badge>
                </div>
              </Card>
            </div>

            {/* Gráfico de Barras Comparativo */}
            <Card className="p-3 sm:p-4 md:p-6">
              <CardHeader>
                <CardTitle className="text-sm sm:text-base md:text-lg flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                  Comparativo de Entradas e Saídas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[250px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dadosGraficoComparativo}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="nome" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Bar dataKey="entradas" fill="#10B981" name="Entradas" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="saidas" fill="#EF4444" name="Saídas" radius={[8, 8, 0, 0]} />
                    <Line type="monotone" dataKey="saldo" stroke="#3B82F6" strokeWidth={3} name="Saldo" dot={{ r: 6 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de Linha - Evolução */}
            <Card className="p-3 sm:p-4 md:p-6">
              <CardHeader>
                <CardTitle className="text-sm sm:text-base md:text-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                  Evolução do Saldo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[250px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dadosGraficoComparativo}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="nome" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="saldo" stroke="#3B82F6" strokeWidth={3} name="Saldo" dot={{ r: 6 }} activeDot={{ r: 8 }} />
                    <Area type="monotone" dataKey="saldo" fill="#3B82F6" fillOpacity={0.2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de Pizza - Distribuição */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Card className="p-3 sm:p-4 md:p-6">
                <CardHeader>
                  <CardTitle className="text-xs sm:text-sm">
                    {format(parse(mesComparativo1 + '-01', 'yyyy-MM-dd', new Date()), 'MMM/yyyy', { locale: ptBR })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[200px] sm:h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                      <Pie
                        data={[
                          { name: 'Entradas', value: dadosComparativo1.entradas },
                          { name: 'Saídas', value: dadosComparativo1.saidas },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#10B981" />
                        <Cell fill="#EF4444" />
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-3 sm:p-4 md:p-6">
                <CardHeader>
                  <CardTitle className="text-xs sm:text-sm">
                    {format(parse(mesComparativo2 + '-01', 'yyyy-MM-dd', new Date()), 'MMM/yyyy', { locale: ptBR })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[200px] sm:h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                      <Pie
                        data={[
                          { name: 'Entradas', value: dadosComparativo2.entradas },
                          { name: 'Saídas', value: dadosComparativo2.saidas },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#10B981" />
                        <Cell fill="#EF4444" />
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabela Comparativa Detalhada */}
            <Card className="p-3 sm:p-4 md:p-6">
              <CardHeader>
                <CardTitle className="text-sm sm:text-base md:text-lg">Análise Detalhada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Indicador</TableHead>
                      <TableHead className="text-right">
                        {format(parse(mesComparativo1 + '-01', 'yyyy-MM-dd', new Date()), 'MMM/yyyy', { locale: ptBR })}
                      </TableHead>
                      <TableHead className="text-right">
                        {format(parse(mesComparativo2 + '-01', 'yyyy-MM-dd', new Date()), 'MMM/yyyy', { locale: ptBR })}
                      </TableHead>
                      <TableHead className="text-right">Variação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Entradas</TableCell>
                      <TableCell className="text-right text-green-500">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosComparativo1.entradas)}
                      </TableCell>
                      <TableCell className="text-right text-green-500">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosComparativo2.entradas)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className={variacaoEntradas >= 0 ? 'bg-green-500' : 'bg-red-500'}>
                          {variacaoEntradas >= 0 ? '+' : ''}{variacaoEntradas.toFixed(2)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Saídas</TableCell>
                      <TableCell className="text-right text-red-500">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosComparativo1.saidas)}
                      </TableCell>
                      <TableCell className="text-right text-red-500">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosComparativo2.saidas)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className={variacaoSaidas <= 0 ? 'bg-green-500' : 'bg-red-500'}>
                          {variacaoSaidas >= 0 ? '+' : ''}{variacaoSaidas.toFixed(2)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Saldo</TableCell>
                      <TableCell className={`text-right ${dadosComparativo1.saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosComparativo1.saldo)}
                      </TableCell>
                      <TableCell className={`text-right ${dadosComparativo2.saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosComparativo2.saldo)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className={variacaoSaldoComp >= 0 ? 'bg-green-500' : 'bg-red-500'}>
                          {variacaoSaldoComp >= 0 ? '+' : ''}{variacaoSaldoComp.toFixed(2)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenComparativo(false)}>Fechar</Button>
            <Button onClick={aplicarComparativo}>Aplicar ao Dashboard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Detalhes */}
      <Dialog open={dialogAberto !== null} onOpenChange={(open) => !open && setDialogAberto(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-4xl max-h-[90vh] overflow-y-auto p-2 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg md:text-xl">{detalhesDados?.titulo || 'Detalhes'}</DialogTitle>
          </DialogHeader>
          {detalhesDados && detalhesDados.dados.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {detalhesDados.colunas.map((col: string) => (
                      <TableHead key={col} className="capitalize">
                        {col.replace(/_/g, ' ')}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detalhesDados.dados.map((item: any, index: number) => (
                    <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                      {detalhesDados.colunas.map((col: string) => (
                        <TableCell key={col}>
                          {col === 'valor' || col === 'valor_causa' ? (
                            formatarValor(item[col])
                          ) : col === 'data' || col === 'data_inicial' || col === 'data_vencimento' ? (
                            formatarData(item[col])
                          ) : col === 'status' ? (
                            <Badge className={
                              item[col] === 'ativo' || item[col] === 'em_andamento' || item[col] === 'pendente' ? 'bg-blue-500' :
                              item[col] === 'concluido' || item[col] === 'concluida' ? 'bg-green-500' :
                              item[col] === 'arquivado' || item[col] === 'inativo' ? 'bg-gray-500' :
                              'bg-yellow-500'
                            }>
                              {item[col]}
                            </Badge>
                          ) : col === 'tipo' && item[col] === 'entrada' ? (
                            <Badge className="bg-green-500">Entrada</Badge>
                          ) : col === 'tipo' && item[col] === 'saida' ? (
                            <Badge className="bg-red-500">Saída</Badge>
                          ) : col === 'prioridade' ? (
                            <Badge className={
                              item[col] === 'alta' ? 'bg-red-500' :
                              item[col] === 'media' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }>
                              {item[col]}
                            </Badge>
                          ) : (
                            item[col] || '-'
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="mt-4 text-center text-muted-foreground py-8">
              Nenhum dado disponível
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

