import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BotaoVoltar } from "@/components/BotaoVoltar";
import { BarChart3, Download } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { gerarPDFRelatorio } from "@/lib/pdf-utils";

export default function Relatorios() {
  const { data: transacoes } = useQuery({
    queryKey: ['transacoes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('transacoes').select('*');
      if (error) throw error;
      return data || [];
    },
  });

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

  const { data: tarefas } = useQuery({
    queryKey: ['tarefas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tarefas').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const mesAtual = new Date();
  const mesAnterior = subMonths(mesAtual, 1);

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

  const dadosMesAtual = calcularDadosMes(mesAtual);
  const dadosMesAnterior = calcularDadosMes(mesAnterior);

  const clientesAtivos = clientes?.filter(c => c.status === 'ativo').length || 0;
  const processosEmAndamento = processos?.filter(p => p.status === 'em_andamento').length || 0;
  const tarefasPendentes = tarefas?.filter(t => t.status === 'pendente' || t.status === 'em_andamento').length || 0;

  const exportarRelatorio = () => {
    gerarPDFRelatorio(
      `Relatório Mensal - ${format(mesAtual, 'MMMM yyyy', { locale: ptBR })}`,
      [
        {
          'Período': format(mesAtual, 'MMMM yyyy', { locale: ptBR }),
          'Entradas': dadosMesAtual.entradas,
          'Saídas': dadosMesAtual.saidas,
          'Saldo': dadosMesAtual.saldo,
          'Total Clientes': clientes?.length || 0,
          'Clientes Ativos': clientesAtivos,
          'Total Processos': processos?.length || 0,
          'Processos em Andamento': processosEmAndamento,
          'Total Tarefas': tarefas?.length || 0,
          'Tarefas Pendentes': tarefasPendentes,
        }
      ],
      ['Período', 'Entradas', 'Saídas', 'Saldo', 'Total Clientes', 'Clientes Ativos', 'Total Processos', 'Processos em Andamento', 'Total Tarefas', 'Tarefas Pendentes']
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BotaoVoltar />
          <div>
            <h1 className="text-3xl font-bold">Relatórios</h1>
            <p className="text-muted-foreground">Visualize relatórios e estatísticas do sistema</p>
          </div>
        </div>
        <Button onClick={exportarRelatorio}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      <Card className="p-6 hover:shadow-primary/20 hover:border-primary/50 group">
        <CardHeader>
          <CardTitle>Resumo Financeiro - {format(mesAtual, 'MMMM yyyy', { locale: ptBR })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Entradas</p>
              <h3 className="text-2xl font-bold text-green-500">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosMesAtual.entradas)}
              </h3>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saídas</p>
              <h3 className="text-2xl font-bold text-red-500">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosMesAtual.saidas)}
              </h3>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo</p>
              <h3 className={`text-2xl font-bold ${dadosMesAtual.saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosMesAtual.saldo)}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 hover:shadow-blue-500/20 hover:border-blue-500/50 group">
          <CardHeader>
            <CardTitle>Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-semibold">{clientes?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ativos:</span>
                <span className="font-semibold text-green-500">{clientesAtivos}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6 hover:shadow-purple-500/20 hover:border-purple-500/50 group">
          <CardHeader>
            <CardTitle>Processos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-semibold">{processos?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Em Andamento:</span>
                <span className="font-semibold text-blue-500">{processosEmAndamento}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6 hover:shadow-green-500/20 hover:border-green-500/50 group">
          <CardHeader>
            <CardTitle>Tarefas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-semibold">{tarefas?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pendentes:</span>
                <span className="font-semibold text-orange-500">{tarefasPendentes}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="p-6 hover:shadow-primary/20 hover:border-primary/50 group">
        <CardHeader>
          <CardTitle>Comparativo Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Mês Anterior ({format(mesAnterior, 'MMM yyyy', { locale: ptBR })}):</span>
              <span className={`font-semibold ${dadosMesAnterior.saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosMesAnterior.saldo)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Mês Atual ({format(mesAtual, 'MMM yyyy', { locale: ptBR })}):</span>
              <span className={`font-semibold ${dadosMesAtual.saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosMesAtual.saldo)}
              </span>
            </div>
            <div className="flex justify-between items-center border-t pt-4">
              <span className="font-semibold">Variação:</span>
              <span className={`text-xl font-bold ${
                dadosMesAtual.saldo >= dadosMesAnterior.saldo ? 'text-green-500' : 'text-red-500'
              }`}>
                {dadosMesAnterior.saldo !== 0 ? (
                  <>
                    {dadosMesAtual.saldo >= dadosMesAnterior.saldo ? '+' : ''}
                    {((dadosMesAtual.saldo - dadosMesAnterior.saldo) / Math.abs(dadosMesAnterior.saldo) * 100).toFixed(2)}%
                  </>
                ) : (
                  'N/A'
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
