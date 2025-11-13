import { Card } from "@/components/ui/card";
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
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { format, isToday, isTomorrow, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FinancialSummaryCard } from "@/components/Dashboard/FinancialSummaryCard";
import { FluxoChart } from "@/components/Dashboard/FluxoChart";
import { RankingCard } from "@/components/Dashboard/RankingCard";
import { ComparativoTable } from "@/components/Dashboard/ComparativoTable";

export default function Dashboard() {
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

  const mesAtual = new Date();
  const mesAnterior = subMonths(mesAtual, 1);

  const dadosMesAtual = calcularDadosMes(mesAtual);
  const dadosMesAnterior = calcularDadosMes(mesAnterior);

  const variacaoSaldo = dadosMesAnterior.saldo !== 0
    ? ((dadosMesAtual.saldo - dadosMesAnterior.saldo) / Math.abs(dadosMesAnterior.saldo)) * 100
    : 0;

  // Tarefas do mês
  const tarefasMes = tarefas?.filter((tarefa) => {
    const dataVencimento = new Date(tarefa.data_vencimento);
    return (
      dataVencimento >= startOfMonth(mesAtual) &&
      dataVencimento <= endOfMonth(mesAtual)
    );
  }) || [];

  const tarefasUrgentes = tarefas?.filter((tarefa) => {
    const dataVencimento = new Date(tarefa.data_vencimento);
    return (
      tarefa.status !== 'concluida' &&
      tarefa.status !== 'cancelada' &&
      (isToday(dataVencimento) || isTomorrow(dataVencimento))
    );
  }) || [];

  // Calcular saldo total de caixa
  const saldoCaixaTotal = transacoes?.reduce((acc, t) => {
    return t.tipo === 'entrada' ? acc + Number(t.valor) : acc - Number(t.valor);
  }, 0) || 0;

  // Dados para o gráfico (últimos 6 meses)
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const mes = subMonths(mesAtual, 5 - i);
    const dados = calcularDadosMes(mes);
    return {
      mes: format(mes, 'MMM', { locale: ptBR }),
      entradas: dados.entradas,
      saidas: dados.saidas,
      saldo: dados.saldo,
    };
  });

  // Ranking de entradas (Top 5 clientes/categorias)
  const rankingEntradas = transacoes
    ?.filter((t) => t.tipo === 'entrada')
    .reduce((acc: Record<string, number>, t) => {
      const key = t.categoria || 'Sem categoria';
      acc[key] = (acc[key] || 0) + Number(t.valor);
      return acc;
    }, {});

  const topEntradas = Object.entries(rankingEntradas || {})
    .map(([nome, valor]) => ({
      nome,
      valor: valor as number,
      percentual: (valor as number / dadosMesAtual.entradas) * 100 || 0,
    }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);

  // Ranking de saídas
  const rankingSaidas = transacoes
    ?.filter((t) => t.tipo === 'saida')
    .reduce((acc: Record<string, number>, t) => {
      const key = t.categoria || 'Sem categoria';
      acc[key] = (acc[key] || 0) + Number(t.valor);
      return acc;
    }, {});

  const topSaidas = Object.entries(rankingSaidas || {})
    .map(([nome, valor]) => ({
      nome,
      valor: valor as number,
      percentual: (valor as number / dadosMesAtual.saidas) * 100 || 0,
    }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);

  // Dados comparativo periódico
  const comparativoData = Array.from({ length: 6 }, (_, i) => {
    const mes = subMonths(mesAtual, 5 - i);
    const mesAnteriorComp = subMonths(mes, 1);
    const dados = calcularDadosMes(mes);
    const dadosAnteriorComp = calcularDadosMes(mesAnteriorComp);
    
    const variacao = dadosAnteriorComp.saldo !== 0
      ? ((dados.saldo - dadosAnteriorComp.saldo) / Math.abs(dadosAnteriorComp.saldo)) * 100
      : 0;

    return {
      mes: format(mes, 'MMM/yy', { locale: ptBR }),
      entradas: dados.entradas,
      saidas: dados.saidas,
      saldo: dados.saldo,
      variacao,
    };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao Gerenciador Empresarial
        </p>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <FinancialSummaryCard
          title="💰 Saldo de Caixa Atual"
          value={new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(saldoCaixaTotal)}
          icon={DollarSign}
          iconColor="text-blue-500"
        />
        
        <FinancialSummaryCard
          title="📈 Entradas do Mês"
          value={new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(dadosMesAtual.entradas)}
          icon={ArrowUpRight}
          iconColor="text-green-500"
        />

        <FinancialSummaryCard
          title="📉 Saídas do Mês"
          value={new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(dadosMesAtual.saidas)}
          icon={ArrowDownRight}
          iconColor="text-red-500"
        />

        <FinancialSummaryCard
          title="🔄 Fluxo Líquido"
          value={new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(dadosMesAtual.saldo)}
          icon={dadosMesAtual.saldo >= 0 ? TrendingUp : TrendingDown}
          iconColor={dadosMesAtual.saldo >= 0 ? "text-green-500" : "text-red-500"}
        />

        <FinancialSummaryCard
          title="🕐 Comparativo Mensal"
          value={`${variacaoSaldo >= 0 ? '+' : ''}${variacaoSaldo.toFixed(1)}%`}
          icon={variacaoSaldo >= 0 ? TrendingUp : TrendingDown}
          iconColor={variacaoSaldo >= 0 ? "text-green-500" : "text-red-500"}
          trend={{
            value: `${Math.abs(variacaoSaldo).toFixed(1)}%`,
            isPositive: variacaoSaldo >= 0,
          }}
        />
      </div>

      {/* Cards de estatísticas gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 transition-all duration-200 hover:shadow-lg">
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

        <Card className="p-6 transition-all duration-200 hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Scale className="h-8 w-8 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Processos</p>
              <h3 className="text-2xl font-bold">{processos?.length || 0}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 transition-all duration-200 hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <CheckSquare className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tarefas do Mês</p>
              <h3 className="text-2xl font-bold">{tarefasMes.length}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Alerta de tarefas urgentes */}
      {tarefasUrgentes.length > 0 && (
        <Card className="p-6 border-2 border-orange-500/50 bg-orange-500/5 animate-pulse-slow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-orange-500">
                Você tem {tarefasUrgentes.length} tarefa{tarefasUrgentes.length > 1 ? 's' : ''} para realizar!
              </h3>
              <p className="text-sm text-muted-foreground">
                Cuidado com os prazos
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Gráfico de Fluxo */}
      <FluxoChart data={chartData} />

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RankingCard
          title="🟩 Top Entradas"
          items={topEntradas}
          isEntrada={true}
        />
        <RankingCard
          title="🟥 Top Saídas"
          items={topSaidas}
          isEntrada={false}
        />
      </div>

      {/* Comparativo Periódico */}
      <ComparativoTable data={comparativoData} />
    </div>
  );
}
