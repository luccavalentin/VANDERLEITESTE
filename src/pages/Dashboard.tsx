import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "next-themes";
import { 
  Users, 
  Scale, 
  DollarSign, 
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
  PieChart as PieChartIcon,
  RefreshCw,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { gerarPDFRelatorio } from "@/lib/pdf-utils";
import { gerarExcelRelatorio } from "@/lib/excel-utils";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Area, AreaChart
} from "recharts";

export default function Dashboard() {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const isDark = theme === 'dark';
  const [dialogAberto, setDialogAberto] = useState<string | null>(null);
  const [detalhesDados, setDetalhesDados] = useState<any>(null);
  const [mesSelecionado, setMesSelecionado] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [openComparativo, setOpenComparativo] = useState(false);
  const [mesComparativo1, setMesComparativo1] = useState<string>(format(subMonths(new Date(), 1), 'yyyy-MM'));
  const [mesComparativo2, setMesComparativo2] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [atualizando, setAtualizando] = useState(false);
  
  // Cores dos gráficos baseadas no tema
  const chartColors = useMemo(() => {
    if (isDark) {
      // Tema escuro - gráficos claros
      return {
        grid: '#374151',
        text: '#F3F4F6',
        tooltipBg: '#1F2937',
        tooltipBorder: '#374151',
        entradas: '#10B981',
        saidas: '#EF4444',
        saldo: '#3B82F6',
        axis: '#9CA3AF',
      };
    } else {
      // Tema claro - gráficos escuros
      return {
        grid: '#E5E7EB',
        text: '#111827',
        tooltipBg: '#FFFFFF',
        tooltipBorder: '#E5E7EB',
        entradas: '#059669',
        saidas: '#DC2626',
        saldo: '#2563EB',
        axis: '#6B7280',
      };
    }
  }, [isDark]);

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

  // Recalcular dados do mês atual quando transações ou mês mudarem
  const dadosMesAtual = useMemo(() => {
    if (!transacoes) return { entradas: 0, saidas: 0, saldo: 0 };
    return calcularDadosMes(mesAtual);
  }, [mesAtual, transacoes]);

  const dadosMesAnterior = useMemo(() => {
    if (!transacoes) return { entradas: 0, saidas: 0, saldo: 0 };
    return calcularDadosMes(mesAnterior);
  }, [mesAnterior, transacoes]);

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

  // Refs para os gráficos
  const graficoEvolucaoRef = useRef<HTMLDivElement>(null);
  const graficoBarrasRef = useRef<HTMLDivElement>(null);
  const graficoPizzaEntradasRef = useRef<HTMLDivElement>(null);
  const graficoPizzaSaidasRef = useRef<HTMLDivElement>(null);
  const graficoStatusProcessosRef = useRef<HTMLDivElement>(null);
  const graficoTendenciaSaldoRef = useRef<HTMLDivElement>(null);

  const [gerandoPDF, setGerandoPDF] = useState(false);

  const handleExportarPDF = async () => {
    try {
      setGerandoPDF(true);
      const graficos: Array<{ elemento: HTMLElement; titulo?: string }> = [];
      
      // Aguardar um pouco para garantir que os gráficos estejam renderizados
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Adicionar gráficos disponíveis (apenas se existirem e tiverem dados)
      if (graficoEvolucaoRef.current && dadosEvolucaoMensal.length > 0) {
        graficos.push({
          elemento: graficoEvolucaoRef.current,
          titulo: 'Evolução Financeira - Últimos 6 Meses'
        });
      }
      
      if (graficoBarrasRef.current && dadosEvolucaoMensal.length > 0) {
        graficos.push({
          elemento: graficoBarrasRef.current,
          titulo: 'Entradas vs Saídas do Mês'
        });
      }
      
      if (graficoPizzaEntradasRef.current && dadosPizzaEntradas.length > 0) {
        graficos.push({
          elemento: graficoPizzaEntradasRef.current,
          titulo: 'Categorias de Entradas'
        });
      }
      
      if (graficoPizzaSaidasRef.current && dadosPizzaSaidas.length > 0) {
        graficos.push({
          elemento: graficoPizzaSaidasRef.current,
          titulo: 'Categorias de Saídas'
        });
      }
      
      if (graficoStatusProcessosRef.current && dadosStatusProcessos.length > 0) {
        graficos.push({
          elemento: graficoStatusProcessosRef.current,
          titulo: 'Status dos Processos'
        });
      }
      
      if (graficoTendenciaSaldoRef.current && dadosEvolucaoMensal.length > 0) {
        graficos.push({
          elemento: graficoTendenciaSaldoRef.current,
          titulo: 'Tendência do Saldo - Últimos 6 Meses'
        });
      }
      
      await gerarPDFRelatorio({
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
        graficos: graficos,
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
    } finally {
      setGerandoPDF(false);
    }
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

  const handleAtualizarDados = async () => {
    setAtualizando(true);
    try {
      // Invalidar todas as queries para forçar refetch
      await queryClient.invalidateQueries();
      // Forçar refetch de todas as queries ativas
      await queryClient.refetchQueries();
      // Toast de sucesso será mostrado automaticamente quando os dados carregarem
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
    } finally {
      setAtualizando(false);
    }
  };

  const aplicarComparativo = () => {
    setMesSelecionado(mesComparativo2);
    setOpenComparativo(false);
  };

  // Recalcular dados quando os meses ou transações mudarem
  const dadosComparativo1 = useMemo(() => {
    if (!mesComparativo1 || !transacoes) return { entradas: 0, saidas: 0, saldo: 0 };
    try {
      const mes1Date = parse(mesComparativo1 + '-01', 'yyyy-MM-dd', new Date());
      return calcularDadosMes(mes1Date);
    } catch {
      return { entradas: 0, saidas: 0, saldo: 0 };
    }
  }, [mesComparativo1, transacoes]);

  const dadosComparativo2 = useMemo(() => {
    if (!mesComparativo2 || !transacoes) return { entradas: 0, saidas: 0, saldo: 0 };
    try {
      const mes2Date = parse(mesComparativo2 + '-01', 'yyyy-MM-dd', new Date());
      return calcularDadosMes(mes2Date);
    } catch {
      return { entradas: 0, saidas: 0, saldo: 0 };
    }
  }, [mesComparativo2, transacoes]);

  // Dados para gráficos - atualizado quando dados mudarem
  const dadosGraficoComparativo = useMemo(() => [
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
  ], [mesComparativo1, mesComparativo2, dadosComparativo1, dadosComparativo2]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dadosGraficoPizza = [
    { name: 'Entradas Mês 1', value: dadosComparativo1.entradas },
    { name: 'Saídas Mês 1', value: dadosComparativo1.saidas },
    { name: 'Entradas Mês 2', value: dadosComparativo2.entradas },
    { name: 'Saídas Mês 2', value: dadosComparativo2.saidas },
  ];

  const COLORS = ['#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];

  // Dados para gráficos interativos - últimos 6 meses
  const dadosEvolucaoMensal = Array.from({ length: 6 }, (_, i) => {
    const mes = subMonths(mesAtual, 5 - i);
    const dados = calcularDadosMes(mes);
    return {
      mes: format(mes, 'MMM/yy', { locale: ptBR }),
      entradas: dados.entradas,
      saidas: dados.saidas,
      saldo: dados.saldo,
    };
  });

  // Dados para gráfico de categorias do mês atual
  const categoriasEntrada = transacoes?.filter(t => {
    if (t.tipo !== 'entrada') return false;
    const dataTransacao = new Date(t.data);
    return dataTransacao >= startOfMonth(mesAtual) && dataTransacao <= endOfMonth(mesAtual);
  }).reduce((acc: Record<string, number>, t) => {
    const key = t.categoria || 'Sem categoria';
    acc[key] = (acc[key] || 0) + Number(t.valor);
    return acc;
  }, {}) || {};

  const categoriasSaida = transacoes?.filter(t => {
    if (t.tipo !== 'saida') return false;
    const dataTransacao = new Date(t.data);
    return dataTransacao >= startOfMonth(mesAtual) && dataTransacao <= endOfMonth(mesAtual);
  }).reduce((acc: Record<string, number>, t) => {
    const key = t.categoria || 'Sem categoria';
    acc[key] = (acc[key] || 0) + Number(t.valor);
    return acc;
  }, {}) || {};

  const dadosPizzaEntradas = Object.entries(categoriasEntrada)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const dadosPizzaSaidas = Object.entries(categoriasSaida)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Dados para gráfico de status de processos
  const statusProcessos = processos?.reduce((acc: Record<string, number>, p) => {
    const status = p.status || 'sem_status';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {}) || {};

  const dadosStatusProcessos = Object.entries(statusProcessos).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Dados para gráfico de status de tarefas
  const statusTarefas = tarefasMes?.reduce((acc: Record<string, number>, t) => {
    const status = t.status || 'sem_status';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {}) || {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dadosStatusTarefas = Object.entries(statusTarefas).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
    value,
  }));

  // Calcular variações - atualizado quando dados mudarem
  const variacaoEntradas = useMemo(() => {
    if (dadosComparativo1.entradas === 0) return 0;
    return ((dadosComparativo2.entradas - dadosComparativo1.entradas) / dadosComparativo1.entradas) * 100;
  }, [dadosComparativo1.entradas, dadosComparativo2.entradas]);

  const variacaoSaidas = useMemo(() => {
    if (dadosComparativo1.saidas === 0) return 0;
    return ((dadosComparativo2.saidas - dadosComparativo1.saidas) / dadosComparativo1.saidas) * 100;
  }, [dadosComparativo1.saidas, dadosComparativo2.saidas]);

  const variacaoSaldoComp = useMemo(() => {
    if (dadosComparativo1.saldo === 0) return 0;
    return ((dadosComparativo2.saldo - dadosComparativo1.saldo) / Math.abs(dadosComparativo1.saldo)) * 100;
  }, [dadosComparativo1.saldo, dadosComparativo2.saldo]);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in p-2 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Dashboard</h1>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={handleAtualizarDados} 
            disabled={atualizando}
            className="flex-1 sm:flex-initial"
            title="Atualizar todos os dados do sistema"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${atualizando ? 'animate-spin' : ''}`} />
            {atualizando ? 'Atualizando...' : 'Atualizar Dados'}
          </Button>
          <Button variant="outline" onClick={handleComparativo} className="flex-1 sm:flex-initial">
            <GitCompare className="h-4 w-4 mr-2" />
            Comparativo
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportarPDF} 
            disabled={gerandoPDF}
            className="flex-1 sm:flex-initial"
          >
            {gerandoPDF ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Gerando PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </>
            )}
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

      {/* Gráficos Interativos - Linha de Evolução Financeira */}
      <Card className="p-4 sm:p-6" ref={graficoEvolucaoRef}>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Evolução Financeira - Últimos 6 Meses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[300px] sm:h-[350px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dadosEvolucaoMensal} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.entradas} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={chartColors.entradas} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.saidas} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={chartColors.saidas} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.saldo} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={chartColors.saldo} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.3} />
                <XAxis 
                  dataKey="mes" 
                  stroke={chartColors.axis} 
                  style={{ fontSize: '12px' }}
                  tick={{ fill: chartColors.axis }}
                />
                <YAxis 
                  stroke={chartColors.axis} 
                  tick={{ fill: chartColors.axis }}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartColors.tooltipBg,
                    border: `1px solid ${chartColors.tooltipBorder}`,
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                  formatter={(value: number) => new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(value)}
                  labelStyle={{ color: chartColors.text, marginBottom: '8px' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px', color: chartColors.text }}
                  iconType="circle"
                />
                <Area 
                  type="monotone" 
                  dataKey="entradas" 
                  stroke={chartColors.entradas} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorEntradas)" 
                  name="Entradas"
                  dot={{ r: 5, fill: chartColors.entradas }}
                  activeDot={{ r: 8 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="saidas" 
                  stroke={chartColors.saidas} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSaidas)" 
                  name="Saídas"
                  dot={{ r: 5, fill: chartColors.saidas }}
                  activeDot={{ r: 8 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="saldo" 
                  stroke={chartColors.saldo} 
                  strokeWidth={3}
                  name="Saldo"
                  dot={{ r: 6, fill: chartColors.saldo }}
                  activeDot={{ r: 10 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos de Barras - Comparativo Entradas vs Saídas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6" ref={graficoBarrasRef}>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base md:text-lg flex items-center gap-2">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              Entradas vs Saídas do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosEvolucaoMensal.slice(-3)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.2} />
                  <XAxis 
                    dataKey="mes" 
                    stroke={chartColors.axis} 
                    style={{ fontSize: '11px' }}
                    tick={{ fill: chartColors.axis }}
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
                    labelStyle={{ color: chartColors.text }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '10px', color: chartColors.text }}
                    iconType="circle"
                  />
                  <Bar 
                    dataKey="entradas" 
                    fill={chartColors.entradas} 
                    name="Entradas"
                    radius={[8, 8, 0, 0]}
                    animationDuration={1000}
                  />
                  <Bar 
                    dataKey="saidas" 
                    fill={chartColors.saidas} 
                    name="Saídas"
                    radius={[8, 8, 0, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Categorias de Entradas */}
        <Card className="p-4 sm:p-6" ref={graficoPizzaEntradasRef}>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base md:text-lg flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              Categorias de Entradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dadosPizzaEntradas.length > 0 ? (
              <div className="w-full h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosPizzaEntradas}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      animationDuration={800}
                    >
                      {dadosPizzaEntradas.map((_entry, index) => (
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
                      labelStyle={{ color: chartColors.text }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] sm:h-[300px] flex items-center justify-center text-muted-foreground">
                <p className="text-sm">Nenhuma entrada neste mês</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Pizza - Categorias de Saídas e Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6" ref={graficoPizzaSaidasRef}>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base md:text-lg flex items-center gap-2">
              <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
              Categorias de Saídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dadosPizzaSaidas.length > 0 ? (
              <div className="w-full h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosPizzaSaidas}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      animationDuration={800}
                    >
                      {dadosPizzaSaidas.map((_entry, index) => (
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
                      labelStyle={{ color: chartColors.text }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] sm:h-[300px] flex items-center justify-center text-muted-foreground">
                <p className="text-sm">Nenhuma saída neste mês</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Status de Processos */}
        <Card className="p-4 sm:p-6" ref={graficoStatusProcessosRef}>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base md:text-lg flex items-center gap-2">
              <Scale className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
              Status dos Processos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dadosStatusProcessos.length > 0 ? (
              <div className="w-full h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosStatusProcessos}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      animationDuration={800}
                    >
                      {dadosStatusProcessos.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        padding: '10px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] sm:h-[300px] flex items-center justify-center text-muted-foreground">
                <p className="text-sm">Nenhum processo cadastrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Linha - Evolução do Saldo */}
      <Card className="p-4 sm:p-6" ref={graficoTendenciaSaldoRef}>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Tendência do Saldo - Últimos 6 Meses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[300px] sm:h-[350px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dadosEvolucaoMensal} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.2} />
                <XAxis 
                  dataKey="mes" 
                  stroke={chartColors.axis} 
                  style={{ fontSize: '12px' }}
                  tick={{ fill: chartColors.axis }}
                />
                <YAxis 
                  stroke={chartColors.axis} 
                  tick={{ fill: chartColors.axis }}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartColors.tooltipBg,
                    border: `1px solid ${chartColors.tooltipBorder}`,
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                  formatter={(value: number) => new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(value)}
                  labelStyle={{ color: chartColors.text, marginBottom: '8px' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px', color: chartColors.text }}
                  iconType="line"
                />
                <Line 
                  type="monotone" 
                  dataKey="saldo" 
                  stroke={chartColors.saldo} 
                  strokeWidth={4}
                  name="Saldo Mensal"
                  dot={{ r: 6, fill: chartColors.saldo, strokeWidth: 2, stroke: isDark ? '#1F2937' : '#FFFFFF' }}
                  activeDot={{ r: 10, fill: chartColors.saldo }}
                  animationDuration={1000}
                />
                <Area
                  type="monotone"
                  dataKey="saldo"
                  stroke="none"
                  fill={chartColors.saldo}
                  fillOpacity={0.1}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

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
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-7xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
              <GitCompare className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Comparativo Financeiro
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Compare os dados financeiros entre dois períodos diferentes
            </p>
          </DialogHeader>
          <div className="space-y-6 mt-6">
            {/* Seletores de Período - Layout Melhorado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 border-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <Label htmlFor="mes1" className="text-sm font-semibold">Período 1 (Mês de Referência):</Label>
                  </div>
                  <Input
                    id="mes1"
                    type="month"
                    value={mesComparativo1}
                    onChange={(e) => setMesComparativo1(e.target.value)}
                    className="w-full text-base"
                  />
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {format(parse(mesComparativo1 + '-01', 'yyyy-MM-dd', new Date()), "MMMM 'de' yyyy", { locale: ptBR })}
                  </div>
                </div>
              </Card>
              <Card className="p-4 border-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <Label htmlFor="mes2" className="text-sm font-semibold">Período 2 (Mês a Comparar):</Label>
                  </div>
                  <Input
                    id="mes2"
                    type="month"
                    value={mesComparativo2}
                    onChange={(e) => setMesComparativo2(e.target.value)}
                    className="w-full text-base"
                  />
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {format(parse(mesComparativo2 + '-01', 'yyyy-MM-dd', new Date()), "MMMM 'de' yyyy", { locale: ptBR })}
                  </div>
                </div>
              </Card>
            </div>

            {/* Cards de Resumo - Layout Profissional */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Card Entradas */}
              <Card className="p-5 border-2 border-green-500/20 bg-green-500/5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                      <span className="text-sm font-semibold text-muted-foreground">Entradas</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {format(parse(mesComparativo1 + '-01', 'yyyy-MM-dd', new Date()), 'MMM/yyyy', { locale: ptBR })}
                      </p>
                      <p className="text-2xl font-bold text-green-500">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosComparativo1.entradas)}
                      </p>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-1">
                        {format(parse(mesComparativo2 + '-01', 'yyyy-MM-dd', new Date()), 'MMM/yyyy', { locale: ptBR })}
                      </p>
                      <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosComparativo2.entradas)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Badge className={variacaoEntradas >= 0 ? 'bg-green-500' : 'bg-red-500'}>
                        {variacaoEntradas >= 0 ? '+' : ''}{variacaoEntradas.toFixed(2)}%
                      </Badge>
                      <span className="text-xs text-muted-foreground">variação</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Card Saídas */}
              <Card className="p-5 border-2 border-red-500/20 bg-red-500/5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-red-500/20 rounded-lg">
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      </div>
                      <span className="text-sm font-semibold text-muted-foreground">Saídas</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {format(parse(mesComparativo1 + '-01', 'yyyy-MM-dd', new Date()), 'MMM/yyyy', { locale: ptBR })}
                      </p>
                      <p className="text-2xl font-bold text-red-500">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosComparativo1.saidas)}
                      </p>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-1">
                        {format(parse(mesComparativo2 + '-01', 'yyyy-MM-dd', new Date()), 'MMM/yyyy', { locale: ptBR })}
                      </p>
                      <p className="text-xl font-semibold text-red-600 dark:text-red-400">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosComparativo2.saidas)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Badge className={variacaoSaidas <= 0 ? 'bg-green-500' : 'bg-red-500'}>
                        {variacaoSaidas >= 0 ? '+' : ''}{variacaoSaidas.toFixed(2)}%
                      </Badge>
                      <span className="text-xs text-muted-foreground">variação</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Card Saldo */}
              <Card className={`p-5 border-2 ${dadosComparativo1.saldo >= 0 ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${dadosComparativo1.saldo >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        {dadosComparativo1.saldo >= 0 ? (
                          <TrendingUp className={`h-5 w-5 ${dadosComparativo1.saldo >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <span className="text-sm font-semibold text-muted-foreground">Saldo</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {format(parse(mesComparativo1 + '-01', 'yyyy-MM-dd', new Date()), 'MMM/yyyy', { locale: ptBR })}
                      </p>
                      <p className={`text-2xl font-bold ${dadosComparativo1.saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosComparativo1.saldo)}
                      </p>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-1">
                        {format(parse(mesComparativo2 + '-01', 'yyyy-MM-dd', new Date()), 'MMM/yyyy', { locale: ptBR })}
                      </p>
                      <p className={`text-xl font-semibold ${dadosComparativo2.saldo >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosComparativo2.saldo)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Badge className={variacaoSaldoComp >= 0 ? 'bg-green-500' : 'bg-red-500'}>
                        {variacaoSaldoComp >= 0 ? '+' : ''}{variacaoSaldoComp.toFixed(2)}%
                      </Badge>
                      <span className="text-xs text-muted-foreground">variação</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Gráfico de Barras Comparativo - Principal */}
            <Card className="p-4 sm:p-6 border-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Comparativo de Entradas e Saídas
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Visualização comparativa entre os dois períodos selecionados
                </p>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[350px] sm:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dadosGraficoComparativo} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.3} />
                      <XAxis 
                        dataKey="nome" 
                        stroke={chartColors.axis}
                        style={{ fontSize: '12px' }}
                        tick={{ fill: chartColors.axis }}
                      />
                      <YAxis 
                        stroke={chartColors.axis}
                        style={{ fontSize: '12px' }}
                        tick={{ fill: chartColors.axis }}
                        tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                        contentStyle={{
                          backgroundColor: chartColors.tooltipBg,
                          border: `1px solid ${chartColors.tooltipBorder}`,
                          borderRadius: '8px',
                          padding: '12px',
                        }}
                        labelStyle={{ color: chartColors.text, marginBottom: '8px' }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px', color: chartColors.text }}
                        iconType="circle"
                      />
                      <Bar 
                        dataKey="entradas" 
                        fill={chartColors.entradas} 
                        name="Entradas" 
                        radius={[8, 8, 0, 0]}
                        animationDuration={1000}
                      />
                      <Bar 
                        dataKey="saidas" 
                        fill={chartColors.saidas} 
                        name="Saídas" 
                        radius={[8, 8, 0, 0]}
                        animationDuration={1000}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="saldo" 
                        stroke={chartColors.saldo} 
                        strokeWidth={3} 
                        name="Saldo" 
                        dot={{ r: 6, fill: chartColors.saldo, strokeWidth: 2, stroke: isDark ? '#1F2937' : '#FFFFFF' }}
                        activeDot={{ r: 10, fill: chartColors.saldo }}
                        animationDuration={1000}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Gráficos de Pizza - Comparativo Lado a Lado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 sm:p-6 border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    {format(parse(mesComparativo1 + '-01', 'yyyy-MM-dd', new Date()), 'MMMM yyyy', { locale: ptBR })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[280px] sm:h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Entradas', value: dadosComparativo1.entradas || 0 },
                            { name: 'Saídas', value: dadosComparativo1.saidas || 0 },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => percent > 0 ? `${name}: ${(percent * 100).toFixed(1)}%` : ''}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          animationDuration={800}
                        >
                          <Cell fill={chartColors.entradas} />
                          <Cell fill={chartColors.saidas} />
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                          contentStyle={{
                            backgroundColor: chartColors.tooltipBg,
                            border: `1px solid ${chartColors.tooltipBorder}`,
                            borderRadius: '8px',
                            padding: '10px',
                          }}
                          labelStyle={{ color: chartColors.text }}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '10px', color: chartColors.text }}
                          iconType="circle"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-4 sm:p-6 border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    {format(parse(mesComparativo2 + '-01', 'yyyy-MM-dd', new Date()), 'MMMM yyyy', { locale: ptBR })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[280px] sm:h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Entradas', value: dadosComparativo2.entradas || 0 },
                            { name: 'Saídas', value: dadosComparativo2.saidas || 0 },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => percent > 0 ? `${name}: ${(percent * 100).toFixed(1)}%` : ''}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          animationDuration={800}
                        >
                          <Cell fill={chartColors.entradas} />
                          <Cell fill={chartColors.saidas} />
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                          contentStyle={{
                            backgroundColor: chartColors.tooltipBg,
                            border: `1px solid ${chartColors.tooltipBorder}`,
                            borderRadius: '8px',
                            padding: '10px',
                          }}
                          labelStyle={{ color: chartColors.text }}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '10px', color: chartColors.text }}
                          iconType="circle"
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

