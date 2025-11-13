import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, X } from "lucide-react";
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

  const prioridadeAlta = tarefasOrdenadas[0]?.prioridade === 'alta';
  const prioridadeMedia = tarefasOrdenadas[0]?.prioridade === 'media';
  
  const cardClasses = prioridadeAlta 
    ? 'fixed top-20 right-4 z-50 p-4 border-2 border-red-500/50 bg-red-500/10 animate-pulse cursor-pointer hover:scale-105 transition-all duration-200 shadow-lg'
    : prioridadeMedia
    ? 'fixed top-20 right-4 z-50 p-4 border-2 border-orange-500/50 bg-orange-500/10 animate-pulse cursor-pointer hover:scale-105 transition-all duration-200 shadow-lg'
    : 'fixed top-20 right-4 z-50 p-4 border-2 border-yellow-500/50 bg-yellow-500/10 animate-pulse cursor-pointer hover:scale-105 transition-all duration-200 shadow-lg';

  const iconClasses = prioridadeAlta
    ? 'h-6 w-6 text-red-500'
    : prioridadeMedia
    ? 'h-6 w-6 text-orange-500'
    : 'h-6 w-6 text-yellow-500';

  const bgIconClasses = prioridadeAlta
    ? 'p-2 bg-red-500/20 rounded-lg'
    : prioridadeMedia
    ? 'p-2 bg-orange-500/20 rounded-lg'
    : 'p-2 bg-yellow-500/20 rounded-lg';

  const textClasses = prioridadeAlta
    ? 'text-sm font-bold text-red-500'
    : prioridadeMedia
    ? 'text-sm font-bold text-orange-500'
    : 'text-sm font-bold text-yellow-500';

  return (
    <>
      <Card
        className={cardClasses}
        onClick={() => setOpenDialog(true)}
      >
        <div className="flex items-center gap-3">
          <div className={bgIconClasses}>
            <AlertCircle className={iconClasses} />
          </div>
          <div className="flex-1">
            <h3 className={textClasses}>
              {tarefasUrgentes.length} Tarefa{tarefasUrgentes.length > 1 ? 's' : ''} Vencendo
            </h3>
            <p className="text-xs text-muted-foreground">
              {tarefasOrdenadas[0]?.titulo || 'Clique para ver detalhes'}
            </p>
          </div>
          <X className="h-4 w-4 text-muted-foreground" />
        </div>
      </Card>

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

