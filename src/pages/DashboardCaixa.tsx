import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BotaoVoltar } from "@/components/BotaoVoltar";
import { PieChart, TrendingUp, TrendingDown, DollarSign, Download, FileSpreadsheet } from "lucide-react";
import { gerarPDFRelatorio } from "@/lib/pdf-utils";
import { gerarExcelRelatorio } from "@/lib/excel-utils";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DashboardCaixa() {
  const { data: transacoes } = useQuery({
    queryKey: ['transacoes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('transacoes').select('*');
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

  const saldoTotal = transacoes?.reduce((acc, t) => {
    return t.tipo === 'entrada' ? acc + Number(t.valor) : acc - Number(t.valor);
  }, 0) || 0;

  // Gráfico de dados (últimos 6 meses)
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

  // Top categorias de entrada
  const categoriasEntrada = transacoes
    ?.filter((t) => t.tipo === 'entrada')
    .reduce((acc: Record<string, number>, t) => {
      const key = t.categoria || 'Sem categoria';
      acc[key] = (acc[key] || 0) + Number(t.valor);
      return acc;
    }, {});

  const topCategoriasEntrada = Object.entries(categoriasEntrada || {})
    .map(([nome, valor]) => ({
      nome,
      valor: valor as number,
    }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);

  // Top categorias de saída
  const categoriasSaida = transacoes
    ?.filter((t) => t.tipo === 'saida')
    .reduce((acc: Record<string, number>, t) => {
      const key = t.categoria || 'Sem categoria';
      acc[key] = (acc[key] || 0) + Number(t.valor);
      return acc;
    }, {});

  const topCategoriasSaida = Object.entries(categoriasSaida || {})
    .map(([nome, valor]) => ({
      nome,
      valor: valor as number,
    }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);

  const handleExportarPDF = () => {
    gerarPDFRelatorio({
      titulo: `Dashboard de Caixa - ${format(mesAtual, 'MMMM yyyy', { locale: ptBR })}`,
      dados: [
        { label: 'Saldo Total', valor: saldoTotal },
        { label: 'Entradas do Mês', valor: dadosMesAtual.entradas },
        { label: 'Saídas do Mês', valor: dadosMesAtual.saidas },
        { label: 'Saldo do Mês', valor: dadosMesAtual.saldo },
      ],
      colunas: ['Indicador', 'Valor'],
    });
  };

  const handleExportarExcel = () => {
    gerarExcelRelatorio({
      titulo: `Dashboard de Caixa - ${format(mesAtual, 'MMMM yyyy', { locale: ptBR })}`,
      dados: [
        { label: 'Saldo Total', valor: saldoTotal },
        { label: 'Entradas do Mês', valor: dadosMesAtual.entradas },
        { label: 'Saídas do Mês', valor: dadosMesAtual.saidas },
        { label: 'Saldo do Mês', valor: dadosMesAtual.saldo },
      ],
      colunas: ['Indicador', 'Valor'],
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BotaoVoltar />
          <PieChart className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Dashboard de Caixa</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportarPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={handleExportarExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Baixar Excel
          </Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 hover:shadow-primary/20 hover:border-primary/50 group">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              <span className={`text-3xl font-bold ${saldoTotal >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoTotal)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6 hover:shadow-green-500/20 hover:border-green-500/50 group">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Entradas do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-3xl font-bold text-green-500">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosMesAtual.entradas)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6 hover:shadow-red-500/20 hover:border-red-500/50 group">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saídas do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <span className="text-3xl font-bold text-red-500">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosMesAtual.saidas)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6 hover:shadow-primary/20 hover:border-primary/50 group">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              <span className={`text-3xl font-bold ${dadosMesAtual.saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosMesAtual.saldo)}
              </span>
            </div>
            {variacaoSaldo !== 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {variacaoSaldo > 0 ? '+' : ''}{variacaoSaldo.toFixed(2)}% vs mês anterior
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumo do mês */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Resumo Financeiro - {format(mesAtual, 'MMMM yyyy', { locale: ptBR })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Entradas:</span>
              <span className="text-xl font-bold text-green-500">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosMesAtual.entradas)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Saídas:</span>
              <span className="text-xl font-bold text-red-500">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosMesAtual.saidas)}
              </span>
            </div>
            <div className="flex justify-between items-center border-t pt-4">
              <span className="text-muted-foreground font-semibold">Saldo Final:</span>
              <span className={`text-2xl font-bold ${dadosMesAtual.saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosMesAtual.saldo)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Top 5 Categorias - Entradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCategoriasEntrada.map((cat, index) => (
                <div key={cat.nome} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                    <span>{cat.nome}</span>
                  </div>
                  <span className="font-semibold text-green-500">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cat.valor)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader>
            <CardTitle>Top 5 Categorias - Saídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCategoriasSaida.map((cat, index) => (
                <div key={cat.nome} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                    <span>{cat.nome}</span>
                  </div>
                  <span className="font-semibold text-red-500">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cat.valor)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
