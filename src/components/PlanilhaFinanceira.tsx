import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Transacao {
  id: string;
  tipo: 'entrada' | 'saida';
  descricao: string;
  categoria: string;
  valor: number;
  data: string;
}

interface PlanilhaFinanceiraProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transacoes: Transacao[];
  tipo: 'entrada' | 'saida';
}

export function PlanilhaFinanceira({ open, onOpenChange, transacoes, tipo }: PlanilhaFinanceiraProps) {
  // Gera os meses (12 meses a partir do mês atual)
  const meses = useMemo(() => {
    const hoje = new Date();
    const inicio = startOfMonth(subMonths(hoje, 1));
    const fim = endOfMonth(addMonths(hoje, 10));
    return eachMonthOfInterval({ start: inicio, end: fim });
  }, []);

  // Agrupa transações por categoria e mês
  const dadosAgrupados = useMemo(() => {
    const agrupado: Record<string, Record<string, number>> = {};

    transacoes.forEach((transacao) => {
      const dataTransacao = new Date(transacao.data);
      const mesAno = format(dataTransacao, 'MMM/yyyy', { locale: ptBR }).toUpperCase();
      
      // Usa categoria se existir, senão usa descrição
      const chave = transacao.categoria || transacao.descricao || 'Outros';

      if (!agrupado[chave]) {
        agrupado[chave] = {};
      }

      if (!agrupado[chave][mesAno]) {
        agrupado[chave][mesAno] = 0;
      }

      agrupado[chave][mesAno] += transacao.valor;
    });

    return agrupado;
  }, [transacoes]);

  // Calcula totais por mês
  const totaisPorMes = useMemo(() => {
    const totais: Record<string, number> = {};

    meses.forEach((mes) => {
      const mesAno = format(mes, 'MMM/yyyy', { locale: ptBR }).toUpperCase();
      totais[mesAno] = 0;

      Object.values(dadosAgrupados).forEach((valoresPorMes) => {
        totais[mesAno] += valoresPorMes[mesAno] || 0;
      });
    });

    return totais;
  }, [dadosAgrupados, meses]);

  const categorias = Object.keys(dadosAgrupados).sort();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold">
            {tipo === 'entrada' ? 'RECEBIMENTOS' : 'SAÍDA'}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-100px)]">
          <div className="p-2 sm:p-4 md:p-6">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full border-collapse text-xs sm:text-sm min-w-[600px]">
                  <thead>
                    <tr className="bg-muted border-b-2 border-border">
                      <th className="text-left p-2 sm:p-3 font-bold border-r border-border min-w-[150px] sm:min-w-[200px] sticky left-0 bg-muted z-10">
                        {tipo === 'entrada' ? 'ENTRADA' : 'SAÍDA'}
                      </th>
                      {meses.map((mes) => (
                        <th
                          key={mes.toISOString()}
                          className="text-center p-2 sm:p-3 font-bold border-r border-border min-w-[100px] sm:min-w-[120px]"
                        >
                          <span className="hidden sm:inline">{format(mes, 'MMM/yyyy', { locale: ptBR }).toUpperCase()}</span>
                          <span className="sm:hidden">{format(mes, 'MMM/yy', { locale: ptBR }).toUpperCase()}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {categorias.length === 0 ? (
                      <tr>
                        <td colSpan={meses.length + 1} className="text-center p-8 text-muted-foreground">
                          Nenhuma transação encontrada
                        </td>
                      </tr>
                    ) : (
                      <>
                        {categorias.map((categoria) => (
                          <tr key={categoria} className="border-b border-border hover:bg-muted/50">
                            <td className="p-2 sm:p-3 font-medium border-r border-border sticky left-0 bg-background z-10 text-xs sm:text-sm">
                              <span className="truncate block max-w-[120px] sm:max-w-none">{categoria}</span>
                            </td>
                            {meses.map((mes) => {
                              const mesAno = format(mes, 'MMM/yyyy', { locale: ptBR }).toUpperCase();
                              const valor = dadosAgrupados[categoria][mesAno] || 0;
                              return (
                                <td
                                  key={mes.toISOString()}
                                  className="text-right p-2 sm:p-3 border-r border-border"
                                >
                                  {valor > 0 ? (
                                    <span className="font-medium text-xs sm:text-sm">
                                      {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL',
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0,
                                      }).format(valor)}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                        <tr className="border-t-2 border-border bg-muted font-bold">
                          <td className="p-2 sm:p-3 border-r border-border sticky left-0 bg-muted z-10 text-xs sm:text-sm">
                            TOTAL......................:
                          </td>
                          {meses.map((mes) => {
                            const mesAno = format(mes, 'MMM/yyyy', { locale: ptBR }).toUpperCase();
                            const total = totaisPorMes[mesAno] || 0;
                            return (
                              <td
                                key={mes.toISOString()}
                                className="text-right p-2 sm:p-3 border-r border-border"
                              >
                                <span className="text-xs sm:text-sm">
                                  {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  }).format(total)}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

