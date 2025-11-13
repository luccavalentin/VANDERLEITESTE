import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Scale, TrendingUp, DollarSign, Clock, Award, AlertTriangle, 
  Download, Filter, BarChart3, Users, TrendingDown, FileText 
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, differenceInDays, differenceInMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area
} from "recharts";
import { gerarPDFRelatorio } from "@/lib/pdf-utils";
import { BotaoVoltar } from "@/components/BotaoVoltar";

interface Processo {
  id: string;
  numero_processo: string;
  tipo: string;
  cliente_id: string | null;
  status: 'em_andamento' | 'concluido' | 'arquivado';
  data_inicial: string;
  data_conclusao?: string | null;
  responsavel: string | null;
  valor_causa: number | null;
  resultado_causa?: string | null;
  andamento_atual: string | null;
  observacoes: string | null;
  proximos_passos: string | null;
  historico_andamentos?: any[];
  clientes?: { nome: string };
}

const COLORS = {
  ganha: '#10b981',
  perdida: '#ef4444',
  acordo: '#3b82f6',
  parcial: '#f59e0b',
  indeferida: '#6b7280',
  anulada: '#8b5cf6',
  extinta: '#ec4899',
};

export default function MapeamentoEstrategico() {
  const [filtros, setFiltros] = useState({
    periodo: "todos",
    tipo: "todos",
    advogado: "todos",
    cliente: "todos",
    comarca: "todos",
    resultado: "todos",
    valorFaixa: "todos",
    fase: "todos",
  });

  const { data: processos = [], isLoading } = useQuery({
    queryKey: ["processos-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("processos")
        .select("*, clientes(nome)");
      if (error) throw error;
      return data as Processo[];
    },
    staleTime: 2 * 60 * 1000,
  });

  const processosFiltrados = useMemo(() => {
    let filtrados = [...processos];

    // Filtro por período
    if (filtros.periodo !== "todos") {
      const hoje = new Date();
      let dataLimite = new Date();
      
      if (filtros.periodo === "trimestre") {
        dataLimite = subMonths(hoje, 3);
      } else if (filtros.periodo === "semestre") {
        dataLimite = subMonths(hoje, 6);
      } else if (filtros.periodo === "ano") {
        dataLimite = subMonths(hoje, 12);
      }
      
      filtrados = filtrados.filter(p => new Date(p.data_inicial) >= dataLimite);
    }

    // Filtro por tipo
    if (filtros.tipo !== "todos") {
      filtrados = filtrados.filter(p => p.tipo === filtros.tipo);
    }

    // Filtro por advogado
    if (filtros.advogado !== "todos") {
      filtrados = filtrados.filter(p => p.responsavel === filtros.advogado);
    }

    // Filtro por cliente
    if (filtros.cliente !== "todos") {
      filtrados = filtrados.filter(p => p.cliente_id === filtros.cliente);
    }

    // Filtro por resultado
    if (filtros.resultado !== "todos") {
      filtrados = filtrados.filter(p => p.resultado_causa === filtros.resultado);
    }

    // Filtro por valor
    if (filtros.valorFaixa !== "todos") {
      const [min, max] = filtros.valorFaixa.split('-').map(Number);
      filtrados = filtrados.filter(p => {
        const valor = p.valor_causa || 0;
        return valor >= min && (max ? valor <= max : true);
      });
    }

    return filtrados;
  }, [processos, filtros]);

  // Cálculos de métricas
  const totalProcessos = processosFiltrados.length;
  const processosEncerrados = processosFiltrados.filter(p => p.status === "concluido").length;
  const processosEmAndamento = processosFiltrados.filter(p => p.status === "em_andamento").length;
  const processosGanhos = processosFiltrados.filter(p => p.resultado_causa === "ganha").length;
  const taxaSucesso = processosEncerrados > 0 
    ? ((processosGanhos / processosEncerrados) * 100).toFixed(1)
    : "0.0";

  const valorTotalCausas = processosFiltrados.reduce((acc, p) => acc + (p.valor_causa || 0), 0);

  const tempoMedioTramitacao = useMemo(() => {
    const encerrados = processosFiltrados.filter(p => p.status === "concluido" && p.data_conclusao);
    if (encerrados.length === 0) return 0;
    
    const totalDias = encerrados.reduce((acc, p) => {
      const inicio = new Date(p.data_inicial);
      const fim = new Date(p.data_conclusao!);
      return acc + differenceInDays(fim, inicio);
    }, 0);
    
    return Math.round(totalDias / encerrados.length);
  }, [processosFiltrados]);

  const acordosHomologados = processosFiltrados.filter(p => p.resultado_causa === "acordo").length;

  // Distribuição de resultados
  const distribuicaoResultados = useMemo(() => {
    const resultados = ['ganha', 'perdida', 'acordo', 'parcial', 'indeferida', 'anulada', 'extinta'];
    return resultados.map(resultado => ({
      name: resultado.charAt(0).toUpperCase() + resultado.slice(1),
      value: processosFiltrados.filter(p => p.resultado_causa === resultado).length,
      color: COLORS[resultado as keyof typeof COLORS] || '#6b7280',
    })).filter(item => item.value > 0);
  }, [processosFiltrados]);

  // Evolução mensal da taxa de sucesso
  const evolucaoMensal = useMemo(() => {
    const meses: Record<string, { ganhas: number; total: number }> = {};
    
    processosFiltrados.forEach(p => {
      if (p.status === "concluido" && p.data_conclusao) {
        const mes = format(new Date(p.data_conclusao), 'MMM yyyy', { locale: ptBR });
        if (!meses[mes]) {
          meses[mes] = { ganhas: 0, total: 0 };
        }
        meses[mes].total++;
        if (p.resultado_causa === "ganha") {
          meses[mes].ganhas++;
        }
      }
    });

    return Object.entries(meses)
      .map(([mes, dados]) => ({
        mes,
        taxa: dados.total > 0 ? ((dados.ganhas / dados.total) * 100).toFixed(1) : "0",
        ganhas: dados.ganhas,
        total: dados.total,
      }))
      .sort((a, b) => new Date(a.mes).getTime() - new Date(b.mes).getTime());
  }, [processosFiltrados]);

  // Tempo médio por tipo de ação
  const tempoPorTipo = useMemo(() => {
    const tipos: Record<string, number[]> = {};
    
    processosFiltrados.forEach(p => {
      if (p.status === "concluido" && p.data_conclusao) {
        const dias = differenceInDays(new Date(p.data_conclusao), new Date(p.data_inicial));
        if (!tipos[p.tipo]) {
          tipos[p.tipo] = [];
        }
        tipos[p.tipo].push(dias);
      }
    });

    return Object.entries(tipos).map(([tipo, dias]) => ({
      tipo,
      tempoMedio: Math.round(dias.reduce((a, b) => a + b, 0) / dias.length),
    })).sort((a, b) => b.tempoMedio - a.tempoMedio);
  }, [processosFiltrados]);

  // Tipos de ação mais frequentes
  const tiposFrequentes = useMemo(() => {
    const tipos: Record<string, number> = {};
    processosFiltrados.forEach(p => {
      tipos[p.tipo] = (tipos[p.tipo] || 0) + 1;
    });
    
    return Object.entries(tipos)
      .map(([tipo, count]) => ({ tipo, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [processosFiltrados]);

  // Taxa de ganho por tipo
  const taxaGanhoPorTipo = useMemo(() => {
    const tipos: Record<string, { total: number; ganhas: number }> = {};
    
    processosFiltrados.forEach(p => {
      if (p.status === "concluido") {
        if (!tipos[p.tipo]) {
          tipos[p.tipo] = { total: 0, ganhas: 0 };
        }
        tipos[p.tipo].total++;
        if (p.resultado_causa === "ganha") {
          tipos[p.tipo].ganhas++;
        }
      }
    });

    return Object.entries(tipos).map(([tipo, dados]) => ({
      tipo,
      taxa: dados.total > 0 ? ((dados.ganhas / dados.total) * 100).toFixed(1) : "0",
      total: dados.total,
      ganhas: dados.ganhas,
    })).sort((a, b) => Number(b.taxa) - Number(a.taxa));
  }, [processosFiltrados]);

  // Causas com maior risco
  const causasAltoRisco = useMemo(() => {
    return processosFiltrados
      .filter(p => {
        if (p.status !== "em_andamento") return false;
        const diasSemMovimento = differenceInDays(new Date(), new Date(p.data_inicial));
        return diasSemMovimento > 30 || (p.valor_causa && p.valor_causa > 100000);
      })
      .slice(0, 10);
  }, [processosFiltrados]);

  // Desempenho por advogado
  const desempenhoAdvogados = useMemo(() => {
    const advogados: Record<string, { total: number; ganhas: number; emAndamento: number }> = {};
    
    processosFiltrados.forEach(p => {
      const adv = p.responsavel || "Não atribuído";
      if (!advogados[adv]) {
        advogados[adv] = { total: 0, ganhas: 0, emAndamento: 0 };
      }
      advogados[adv].total++;
      if (p.status === "em_andamento") {
        advogados[adv].emAndamento++;
      }
      if (p.resultado_causa === "ganha") {
        advogados[adv].ganhas++;
      }
    });

    return Object.entries(advogados).map(([advogado, dados]) => ({
      advogado,
      total: dados.total,
      ganhas: dados.ganhas,
      emAndamento: dados.emAndamento,
      taxaSucesso: dados.total > 0 ? ((dados.ganhas / dados.total) * 100).toFixed(1) : "0",
    })).sort((a, b) => b.total - a.total);
  }, [processosFiltrados]);

  // Clientes mais rentáveis
  const clientesRentaveis = useMemo(() => {
    const clientes: Record<string, { nome: string; total: number; valor: number }> = {};
    
    processosFiltrados.forEach(p => {
      if (p.cliente_id && p.clientes?.nome) {
        if (!clientes[p.cliente_id]) {
          clientes[p.cliente_id] = { nome: p.clientes.nome, total: 0, valor: 0 };
        }
        clientes[p.cliente_id].total++;
        clientes[p.cliente_id].valor += p.valor_causa || 0;
      }
    });

    return Object.entries(clientes)
      .map(([id, dados]) => ({ id, ...dados }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);
  }, [processosFiltrados]);

  const tiposUnicos = Array.from(new Set(processos.map(p => p.tipo)));
  const advogadosUnicos = Array.from(new Set(processos.map(p => p.responsavel).filter(Boolean)));

  const handleExportarRelatorio = () => {
    gerarPDFRelatorio(
      'Mapeamento Estratégico - Relatório Completo',
      [
        {
          'Total de Processos': totalProcessos,
          'Processos Encerrados': processosEncerrados,
          'Taxa de Sucesso': `${taxaSucesso}%`,
          'Tempo Médio': `${tempoMedioTramitacao} dias`,
          'Valor Total': valorTotalCausas,
          'Acordos Homologados': acordosHomologados,
        }
      ],
      ['Total de Processos', 'Processos Encerrados', 'Taxa de Sucesso', 'Tempo Médio', 'Valor Total', 'Acordos Homologados']
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">Carregando dados...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Scale className="h-6 w-6 text-primary" />
          </div>
          <div className="flex items-center gap-4">
            <BotaoVoltar />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Mapeamento Estratégico</h1>
              <p className="text-muted-foreground">Painel de Inteligência Jurídica</p>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleExportarRelatorio}>
          <Download className="h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* Filtros Avançados */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Filtros Avançados</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Período</Label>
            <Select value={filtros.periodo} onValueChange={(v) => setFiltros({...filtros, periodo: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="trimestre">Último Trimestre</SelectItem>
                <SelectItem value="semestre">Último Semestre</SelectItem>
                <SelectItem value="ano">Último Ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tipo de Ação</Label>
            <Select value={filtros.tipo} onValueChange={(v) => setFiltros({...filtros, tipo: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {tiposUnicos.map(tipo => (
                  <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Advogado Responsável</Label>
            <Select value={filtros.advogado} onValueChange={(v) => setFiltros({...filtros, advogado: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {advogadosUnicos.map(adv => (
                  <SelectItem key={adv} value={adv || ''}>{adv}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Resultado</Label>
            <Select value={filtros.resultado} onValueChange={(v) => setFiltros({...filtros, resultado: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ganha">Ganhas</SelectItem>
                <SelectItem value="perdida">Perdidas</SelectItem>
                <SelectItem value="acordo">Acordos</SelectItem>
                <SelectItem value="parcial">Parciais</SelectItem>
                <SelectItem value="indeferida">Indeferidas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Valor da Causa</Label>
            <Select value={filtros.valorFaixa} onValueChange={(v) => setFiltros({...filtros, valorFaixa: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="0-10000">Até R$ 10.000</SelectItem>
                <SelectItem value="10000-50000">R$ 10.000 - R$ 50.000</SelectItem>
                <SelectItem value="50000-100000">R$ 50.000 - R$ 100.000</SelectItem>
                <SelectItem value="100000-">Acima de R$ 100.000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Visão Geral - Cards Numéricos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4 hover:shadow-purple-500/20 hover:border-purple-500/50 group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/10 transition-transform duration-200 group-hover:scale-110">
              <Scale className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Processos Ativos</p>
              <p className="text-2xl font-bold">{processosEmAndamento}</p>
              <p className="text-xs text-muted-foreground mt-1">{totalProcessos} total</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-green-500/20 hover:border-green-500/50 group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/10 transition-transform duration-200 group-hover:scale-110">
              <Award className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Causas Encerradas</p>
              <p className="text-2xl font-bold">{processosEncerrados}</p>
              <p className="text-xs text-muted-foreground mt-1">Taxa de sucesso: {taxaSucesso}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-blue-500/20 hover:border-blue-500/50 group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10 transition-transform duration-200 group-hover:scale-110">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tempo Médio de Tramitação</p>
              <p className="text-2xl font-bold">{tempoMedioTramitacao}</p>
              <p className="text-xs text-muted-foreground mt-1">dias</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-emerald-500/20 hover:border-emerald-500/50 group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-500/10 transition-transform duration-200 group-hover:scale-110">
              <DollarSign className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Total Envolvido</p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotalCausas)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">em causas ativas</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-amber-500/20 hover:border-amber-500/50 group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-500/10 transition-transform duration-200 group-hover:scale-110">
              <TrendingUp className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
              <p className="text-2xl font-bold">{taxaSucesso}%</p>
              <p className="text-xs text-muted-foreground mt-1">causas ganhas</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-cyan-500/20 hover:border-cyan-500/50 group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-cyan-500/10 transition-transform duration-200 group-hover:scale-110">
              <FileText className="h-6 w-6 text-cyan-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Acordos Homologados</p>
              <p className="text-2xl font-bold">{acordosHomologados}</p>
              <p className="text-xs text-muted-foreground mt-1">resoluções consensuais</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Análise de Resultados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <CardHeader>
            <CardTitle>🟢 Distribuição de Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            {distribuicaoResultados.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distribuicaoResultados}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distribuicaoResultados.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">Sem dados para exibir</p>
            )}
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader>
            <CardTitle>🔵 Evolução Mensal da Taxa de Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            {evolucaoMensal.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={evolucaoMensal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="taxa" stroke="#3b82f6" strokeWidth={2} name="Taxa de Sucesso (%)" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">Sem dados para exibir</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tempo médio por tipo */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle>🟠 Tempo Médio por Tipo de Ação</CardTitle>
        </CardHeader>
        <CardContent>
          {tempoPorTipo.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tempoPorTipo} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="tipo" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="tempoMedio" fill="#f59e0b" name="Dias" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">Sem dados para exibir</p>
          )}
        </CardContent>
      </Card>

      {/* Causas com maior risco */}
      {causasAltoRisco.length > 0 && (
        <Card className="p-6 border-warning">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <CardTitle>🔴 Causas com Maior Risco de Perda</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {causasAltoRisco.map(processo => (
                <div key={processo.id} className="flex items-center justify-between p-3 bg-warning/5 rounded-lg border border-warning/20">
                  <div>
                    <p className="font-medium">{processo.numero_processo}</p>
                    <p className="text-sm text-muted-foreground">{processo.tipo} - {processo.clientes?.nome || "Sem cliente"}</p>
                  </div>
                  <Badge variant="destructive">Alto Risco</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Análise por Tipo de Ação */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle>⚖️ Análise por Tipo de Ação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-4">Tipos Mais Frequentes</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={tiposFrequentes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tipo" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" name="Quantidade" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Taxa de Ganho por Tipo</h4>
              <div className="space-y-2">
                {taxaGanhoPorTipo.slice(0, 5).map(item => (
                  <div key={item.tipo} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <span className="text-sm">{item.tipo}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500" 
                          style={{ width: `${item.taxa}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-16 text-right">{item.taxa}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desempenho por Advogado */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle>👨‍⚖️ Desempenho por Advogado</CardTitle>
        </CardHeader>
        <CardContent>
          {desempenhoAdvogados.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={desempenhoAdvogados}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="advogado" angle={-45} textAnchor="end" height={100} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="total" fill="#3b82f6" name="Total" />
                <Bar yAxisId="left" dataKey="ganhas" fill="#10b981" name="Ganhas" />
                <Line yAxisId="right" type="monotone" dataKey="taxaSucesso" stroke="#f59e0b" strokeWidth={2} name="Taxa Sucesso (%)" />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">Sem dados para exibir</p>
          )}
        </CardContent>
      </Card>

      {/* Clientes Mais Rentáveis */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle>💰 Clientes Mais Rentáveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {clientesRentaveis.map(cliente => (
              <div key={cliente.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">{cliente.nome}</p>
                  <p className="text-sm text-muted-foreground">{cliente.total} processos</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-500">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cliente.valor)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

