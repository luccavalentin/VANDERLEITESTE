import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { isToday, isTomorrow, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Tarefa {
  id: string;
  titulo: string;
  descricao: string | null;
  data_vencimento: string;
  prioridade: 'alta' | 'media' | 'baixa';
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
  responsavel: string | null;
}

export function TarefasAlerta() {
  const [isVisible, setIsVisible] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const { data: tarefas } = useQuery({
    queryKey: ['tarefas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tarefas')
        .select('*')
        .order('prioridade', { ascending: false })
        .order('data_vencimento', { ascending: true });
      if (error) throw error;
      return (data || []) as Tarefa[];
    },
  });

  const tarefasUrgentes = tarefas?.filter((t) => {
    if (t.status === 'concluida' || t.status === 'cancelada') return false;
    const dataVenc = new Date(t.data_vencimento);
    return isToday(dataVenc) || isTomorrow(dataVenc);
  }) || [];

  // Ordenar por prioridade: alta > media > baixa
  const tarefasOrdenadas = [...tarefasUrgentes].sort((a, b) => {
    const prioridades = { alta: 3, media: 2, baixa: 1 };
    return prioridades[b.prioridade] - prioridades[a.prioridade];
  });

  useEffect(() => {
    setIsVisible(tarefasUrgentes.length > 0);
  }, [tarefasUrgentes.length]);

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-500';
      case 'media': return 'bg-orange-500';
      case 'baixa': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPrioridadeLabel = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'Alta';
      case 'media': return 'Média';
      case 'baixa': return 'Baixa';
      default: return prioridade;
    }
  };

  if (!isVisible || tarefasUrgentes.length === 0) return null;

  // Card compacto e discreto no topo direito - estilo similar à imagem
  const cardClasses = 'fixed top-14 right-4 z-[100] px-3 py-2.5 border border-orange-500/40 bg-background/98 backdrop-blur-sm cursor-pointer hover:border-orange-500/60 hover:shadow-lg transition-all duration-200 shadow-sm rounded-lg max-w-[260px]';
  
  const iconClasses = 'h-3.5 w-3.5 text-orange-500 flex-shrink-0';
  
  const textClasses = 'text-xs font-semibold text-orange-500';

  return (
    <>
      <div
        className={cardClasses}
        onClick={() => setOpenDialog(true)}
      >
        <div className="flex items-start gap-2.5">
          <AlertCircle className={`${iconClasses} mt-0.5`} />
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className={textClasses}>
              {tarefasUrgentes.length} Tarefa{tarefasUrgentes.length > 1 ? 's' : ''} Vencendo
            </h3>
            <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-snug">
              {tarefasOrdenadas[0]?.titulo || 'Clique para ver detalhes'}
            </p>
          </div>
        </div>
      </div>

      <Dialog open={openDialog} onOpenChange={(open) => {
        setOpenDialog(open);
        if (!open) {
          setIsVisible(false);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tarefas Vencendo Hoje ou Amanhã</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {tarefasOrdenadas.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarefa</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Responsável</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tarefasOrdenadas.map((tarefa) => (
                    <TableRow key={tarefa.id}>
                      <TableCell className="font-medium">{tarefa.titulo}</TableCell>
                      <TableCell>
                        <Badge className={getPrioridadeColor(tarefa.prioridade)}>
                          {getPrioridadeLabel(tarefa.prioridade)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(tarefa.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          tarefa.status === 'concluida' ? 'bg-green-500' :
                          tarefa.status === 'em_andamento' ? 'bg-blue-500' :
                          'bg-gray-500'
                        }>
                          {tarefa.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{tarefa.responsavel || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Nenhuma tarefa pendente
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

