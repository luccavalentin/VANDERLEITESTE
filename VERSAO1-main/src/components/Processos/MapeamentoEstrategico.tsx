import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Scale,
  TrendingUp,
  DollarSign,
  Clock,
  Award,
  AlertTriangle,
  X,
  Download,
  Filter,
} from "lucide-react";
import { formatarMoeda } from "@/lib/validations";

interface MapeamentoEstrategicoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MapeamentoEstrategico({ open, onOpenChange }: MapeamentoEstrategicoProps) {
  const [filtros, setFiltros] = useState({
    periodo: "todos",
    tipo: "todos",
    advogado: "todos",
    status: "todos",
  });

  const { data: processos = [] } = useQuery({
    queryKey: ["processos-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("processos")
        .select("*, clientes(nome)");
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  // Cálculos de métricas
  const totalProcessos = processos.length;
  const processosEncerrados = processos.filter((p: any) => p.status === "encerrado").length;
  const processosEmAndamento = processos.filter((p: any) => p.status === "em_andamento").length;
  
  const taxaSucesso = processosEncerrados > 0 
    ? ((processos.filter((p: any) => p.status === "encerrado" && p.resultado_causa === "ganha").length / processosEncerrados) * 100).toFixed(1)
    : "0.0";

  const valorTotalCausas = processos.reduce((acc: number, p: any) => acc + (p.valor_causa || 0), 0);

  const tempoMedioTramitacao = processos.length > 0
    ? processos.reduce((acc: number, p: any) => {
        if (p.status === "encerrado" && p.data_conclusao) {
          const inicio = new Date(p.data_inicial);
          const fim = new Date(p.data_conclusao);
          const dias = Math.floor((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
          return acc + dias;
        }
        return acc;
      }, 0) / processosEncerrados || 0
    : 0;

  // Alertas estratégicos
  const processosSemMovimento = processos.filter((p: any) => {
    if (!p.updated_at || p.status === "encerrado") return false;
    const diasSemAtualizacao = Math.floor((Date.now() - new Date(p.updated_at).getTime()) / (1000 * 60 * 60 * 24));
    return diasSemAtualizacao > 30;
  }).length;

  const processosAltoValor = processos.filter((p: any) => 
    p.valor_causa > 100000 && p.status !== "encerrado"
  ).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-dialog z-10 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Scale className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="text-2xl">Mapeamento Estratégico</DialogTitle>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Filtros */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Filtros</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    <SelectItem value="trabalhista">Trabalhista</SelectItem>
                    <SelectItem value="civil">Cível</SelectItem>
                    <SelectItem value="tributario">Tributário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Advogado</Label>
                <Select value={filtros.advogado} onValueChange={(v) => setFiltros({...filtros, advogado: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filtros.status} onValueChange={(v) => setFiltros({...filtros, status: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="encerrado">Encerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Alertas Estratégicos */}
          {(processosSemMovimento > 0 || processosAltoValor > 0) && (
            <Card className="p-4 border-warning bg-warning/5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <h3 className="font-semibold text-warning-foreground">Alertas Estratégicos</h3>
              </div>
              <div className="space-y-2 text-sm">
                {processosSemMovimento > 0 && (
                  <p className="text-muted-foreground">
                    ⚠️ <strong>{processosSemMovimento}</strong> processos sem movimentação há mais de 30 dias
                  </p>
                )}
                {processosAltoValor > 0 && (
                  <p className="text-muted-foreground">
                    ⚠️ <strong>{processosAltoValor}</strong> processos de alto valor ainda em andamento
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Visão Geral - Cards Numéricos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <Scale className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Processos</p>
                  <p className="text-2xl font-bold">{totalProcessos}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {processosEmAndamento} em andamento
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Award className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Causas Encerradas</p>
                  <p className="text-2xl font-bold">{processosEncerrados}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Taxa de sucesso: {taxaSucesso}%
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tempo Médio</p>
                  <p className="text-2xl font-bold">{Math.round(tempoMedioTramitacao)}</p>
                  <p className="text-xs text-muted-foreground mt-1">dias de tramitação</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-emerald-500/10">
                  <DollarSign className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total Envolvido</p>
                  <p className="text-2xl font-bold">{formatarMoeda(valorTotalCausas)}</p>
                  <p className="text-xs text-muted-foreground mt-1">em causas ativas</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-500/10">
                  <TrendingUp className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold">{taxaSucesso}%</p>
                  <p className="text-xs text-muted-foreground mt-1">causas ganhas</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-cyan-500/10">
                  <Award className="h-6 w-6 text-cyan-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Acordos Homologados</p>
                  <p className="text-2xl font-bold">
                    {processos.filter((p: any) => p.resultado_causa === "acordo").length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">resoluções consensuais</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Análise de Resultados */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">📈 Análise de Resultados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Distribuição de Resultados</h4>
                <div className="space-y-2">
                  {["ganha", "perdida", "acordo", "parcial", "indeferida"].map((resultado) => {
                    const count = processos.filter((p: any) => p.resultado_causa === resultado).length;
                    const percentage = processosEncerrados > 0 ? ((count / processosEncerrados) * 100).toFixed(1) : "0.0";
                    return (
                      <div key={resultado} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{resultado}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                resultado === "ganha" ? "bg-green-500" :
                                resultado === "perdida" ? "bg-red-500" :
                                resultado === "acordo" ? "bg-blue-500" :
                                resultado === "parcial" ? "bg-yellow-500" :
                                "bg-gray-500"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Tipos de Ação Mais Frequentes</h4>
                <div className="space-y-2">
                  {Array.from(new Set(processos.map((p: any) => p.tipo))).slice(0, 5).map((tipo: any) => {
                    const count = processos.filter((p: any) => p.tipo === tipo).length;
                    const percentage = totalProcessos > 0 ? ((count / totalProcessos) * 100).toFixed(1) : "0.0";
                    return (
                      <div key={tipo} className="flex items-center justify-between">
                        <span className="text-sm">{tipo || "Não especificado"}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          {/* Análise Financeira */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">💰 Análise Financeira e Rentabilidade</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Valor Médio por Causa</p>
                <p className="text-xl font-bold mt-1">
                  {formatarMoeda(valorTotalCausas / (totalProcessos || 1))}
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Maior Valor em Andamento</p>
                <p className="text-xl font-bold mt-1">
                  {formatarMoeda(Math.max(...processos.map((p: any) => p.valor_causa || 0)))}
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Processos Acima de R$ 100k</p>
                <p className="text-xl font-bold mt-1">
                  {processos.filter((p: any) => p.valor_causa > 100000).length}
                </p>
              </div>
            </div>
          </Card>

          {/* Tempo e Eficiência */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">🕐 Tempo e Eficiência Processual</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <span className="text-sm">Tempo médio até encerramento</span>
                <span className="text-lg font-bold">{Math.round(tempoMedioTramitacao)} dias</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <span className="text-sm">Processos com mais de 1 ano</span>
                <span className="text-lg font-bold">
                  {processos.filter((p: any) => {
                    const diasDecorridos = Math.floor((Date.now() - new Date(p.data_inicial).getTime()) / (1000 * 60 * 60 * 24));
                    return diasDecorridos > 365 && p.status !== "encerrado";
                  }).length}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
