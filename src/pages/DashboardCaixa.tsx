import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BotaoVoltar } from "@/components/BotaoVoltar";
import { PieChart as PieChartIcon, TrendingUp, TrendingDown, DollarSign, Download, FileSpreadsheet } from "lucide-react";
import { gerarPDFRelatorio } from "@/lib/pdf-utils";
import { gerarExcelRelatorio } from "@/lib/excel-utils";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTheme } from "next-themes";
import { useMemo } from "react";
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

export default function DashboardCaixa() {
  const { theme } = useTheme();
  
  // Cores dos gráficos adaptáveis ao tema
  const chartColors = useMemo(() => {
    const isDark = theme === 'dark';
    return {
      entradas: '#22c55e',
      saidas: '#ef4444',
      saldo: '#3b82f6',
      grid: isDark ? '#374151' : '#e5e7eb',
      axis: isDark ? '#9ca3af' : '#6b7280',
      text: isDark ? '#f3f4f6' : '#111827',
      tooltipBg: isDark ? '#1f2937' : '#ffffff',
      tooltipBorder: isDark ? '#374151' : '#e5e7eb',
      background: isDark ? '#111827' : '#ffffff',
    };
  }, [theme]);

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

  // Dados para gráfico de pizza de categorias de entrada
  const dadosPizzaEntradas = topCategoriasEntrada.map((cat) => ({
    name: cat.nome,
    value: cat.valor,
  }));

  // Dados para gráfico de pizza de categorias de saída
  const dadosPizzaSaidas = topCategoriasSaida.map((cat) => ({
    name: cat.nome,
    value: cat.valor,
  }));

  // Cores para gráficos de pizza
  const COLORS_ENTRADAS = ['#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7'];
  const COLORS_SAIDAS = ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2'];

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
          <PieChartIcon className="h-8 w-8 text-primary" />
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

      {/* Gráfico de Evolução Financeira */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Evolução Financeira - Últimos 6 Meses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.entradas} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={chartColors.entradas} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.saidas} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={chartColors.saidas} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.saldo} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={chartColors.saldo} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.2} />
                <XAxis 
                  dataKey="mes" 
                  stroke={chartColors.axis}
                  tick={{ fill: chartColors.axis }}
                  style={{ fontSize: '12px' }}
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
                  labelStyle={{ color: chartColors.text, fontWeight: 'bold' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px', color: chartColors.text }}
                  iconType="circle"
                />
                <Area 
                  type="monotone" 
                  dataKey="entradas" 
                  stroke={chartColors.entradas} 
                  fillOpacity={1} 
                  fill="url(#colorEntradas)" 
                  name="Entradas"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="saidas" 
                  stroke={chartColors.saidas} 
                  fillOpacity={1} 
                  fill="url(#colorSaidas)" 
                  name="Saídas"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="saldo" 
                  stroke={chartColors.saldo} 
                  fillOpacity={1} 
                  fill="url(#colorSaldo)" 
                  name="Saldo"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Barras - Entradas vs Saídas */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Entradas vs Saídas - Últimos 6 Meses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.2} />
                <XAxis 
                  dataKey="mes" 
                  stroke={chartColors.axis}
                  tick={{ fill: chartColors.axis }}
                  style={{ fontSize: '12px' }}
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
                  labelStyle={{ color: chartColors.text, fontWeight: 'bold' }}
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

      {/* Gráficos de Pizza - Categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Distribuição de Entradas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {dadosPizzaEntradas.length > 0 ? (
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosPizzaEntradas}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      animationDuration={1000}
                    >
                      {dadosPizzaEntradas.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_ENTRADAS[index % COLORS_ENTRADAS.length]} />
                      ))}
                    </Pie>
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
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px', color: chartColors.text }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhuma entrada registrada</p>
            )}
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader>
            <CardTitle>Distribuição de Saídas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {dadosPizzaSaidas.length > 0 ? (
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosPizzaSaidas}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      animationDuration={1000}
                    >
                      {dadosPizzaSaidas.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_SAIDAS[index % COLORS_SAIDAS.length]} />
                      ))}
                    </Pie>
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
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px', color: chartColors.text }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhuma saída registrada</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Top 5 Categorias - Entradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCategoriasEntrada.length > 0 ? (
                topCategoriasEntrada.map((cat, index) => (
                  <div key={cat.nome} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                      <span>{cat.nome}</span>
                    </div>
                    <span className="font-semibold text-green-500">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cat.valor)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">Nenhuma categoria encontrada</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader>
            <CardTitle>Top 5 Categorias - Saídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCategoriasSaida.length > 0 ? (
                topCategoriasSaida.map((cat, index) => (
                  <div key={cat.nome} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                      <span>{cat.nome}</span>
                    </div>
                    <span className="font-semibold text-red-500">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cat.valor)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">Nenhuma categoria encontrada</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
