import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { BotaoVoltar } from "@/components/BotaoVoltar";
import { Plus, Edit, Trash2, StickyNote, Download, FileSpreadsheet, CheckSquare } from "lucide-react";
import { gerarPDFRelatorio } from "@/lib/pdf-utils";
import { gerarExcelRelatorio } from "@/lib/excel-utils";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Anotacao {
  id: string;
  titulo: string;
  categoria: string;
  conteudo: string;
  data: string | null;
}

export default function Anotacoes() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [openDialogTarefa, setOpenDialogTarefa] = useState(false);
  const [anotacaoParaTarefa, setAnotacaoParaTarefa] = useState<Anotacao | null>(null);
  const [editingAnotacao, setEditingAnotacao] = useState<Anotacao | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos");

  const [formData, setFormData] = useState<{
    titulo: string;
    categoria: string;
    conteudo: string;
    data: string;
  }>({
    titulo: "",
    categoria: "",
    conteudo: "",
    data: new Date().toISOString().split('T')[0],
  });

  const { data: anotacoes, isLoading } = useQuery({
    queryKey: ['anotacoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('anotacoes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Anotacao[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Anotacao, 'id'>) => {
      const { error } = await supabase.from('anotacoes').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anotacoes'] });
      toast.success("Anotação criada com sucesso!");
      setOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Erro ao criar anotação");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Anotacao) => {
      const { error } = await supabase.from('anotacoes').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anotacoes'] });
      toast.success("Anotação atualizada com sucesso!");
      setOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Erro ao atualizar anotação");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('anotacoes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anotacoes'] });
      toast.success("Anotação excluída com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir anotação");
    },
  });

  const transformarEmTarefaMutation = useMutation({
    mutationFn: async (anotacao: Anotacao) => {
      // Calcular data de vencimento: usar a data da anotação ou adicionar 7 dias a partir de hoje
      let dataVencimento: string;
      if (anotacao.data) {
        dataVencimento = anotacao.data;
      } else {
        dataVencimento = format(addDays(new Date(), 7), 'yyyy-MM-dd');
      }

      // Criar tarefa a partir da anotação
      const tarefaData = {
        titulo: anotacao.titulo,
        descricao: anotacao.conteudo,
        data_vencimento: dataVencimento,
        prioridade: 'media' as const,
        status: 'pendente' as const,
        observacoes: `Transformada da anotação: ${anotacao.categoria}`,
      };

      const { error } = await supabase.from('tarefas').insert(tarefaData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarefas'] });
      toast.success("Anotação transformada em tarefa com sucesso!");
    },
    onError: (error: any) => {
      console.error('Erro ao transformar em tarefa:', error);
      toast.error("Erro ao transformar anotação em tarefa");
    },
  });

  const handleTransformarEmTarefa = (anotacao: Anotacao) => {
    setAnotacaoParaTarefa(anotacao);
    setOpenDialogTarefa(true);
  };

  const confirmarTransformarEmTarefa = () => {
    if (anotacaoParaTarefa) {
      transformarEmTarefaMutation.mutate(anotacaoParaTarefa);
      setOpenDialogTarefa(false);
      setAnotacaoParaTarefa(null);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: "",
      categoria: "",
      conteudo: "",
      data: new Date().toISOString().split('T')[0],
    });
    setEditingAnotacao(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.categoria || !formData.conteudo) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const data = {
      titulo: formData.titulo,
      categoria: formData.categoria,
      conteudo: formData.conteudo,
      data: formData.data || null,
    };

    if (editingAnotacao) {
      updateMutation.mutate({ ...data, id: editingAnotacao.id } as Anotacao);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (anotacao: Anotacao) => {
    setEditingAnotacao(anotacao);
    setFormData({
      titulo: anotacao.titulo,
      categoria: anotacao.categoria,
      conteudo: anotacao.conteudo,
      data: anotacao.data || new Date().toISOString().split('T')[0],
    });
    setOpen(true);
  };

  const anotacoesFiltradas = anotacoes?.filter((a) => {
    const matchBusca = a.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      a.conteudo.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = filtroCategoria === "todos" || a.categoria === filtroCategoria;
    return matchBusca && matchCategoria;
  });

  const categorias = Array.from(new Set(anotacoes?.map(a => a.categoria) || []));

  const handleExportarPDF = () => {
    const dadosFormatados = (anotacoesFiltradas || []).map(anotacao => ({
      'Título': anotacao.titulo,
      'Categoria': anotacao.categoria,
      'Conteúdo': anotacao.conteudo.substring(0, 100) + (anotacao.conteudo.length > 100 ? '...' : ''),
      'Data': anotacao.data ? format(new Date(anotacao.data), 'dd/MM/yyyy', { locale: ptBR }) : '-',
    }));

    gerarPDFRelatorio({
      titulo: 'Relatório de Anotações',
      dados: dadosFormatados,
      colunas: ['Título', 'Categoria', 'Conteúdo', 'Data'],
    });
  };

  const handleExportarExcel = () => {
    const dadosFormatados = (anotacoesFiltradas || []).map(anotacao => ({
      titulo: anotacao.titulo,
      categoria: anotacao.categoria,
      conteudo: anotacao.conteudo,
      data: anotacao.data ? format(new Date(anotacao.data), 'dd/MM/yyyy', { locale: ptBR }) : '-',
    }));

    gerarExcelRelatorio({
      titulo: 'Relatório de Anotações',
      dados: dadosFormatados,
      colunas: ['Título', 'Categoria', 'Conteúdo', 'Data'],
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BotaoVoltar />
          <div>
            <h1 className="text-3xl font-bold">Bloco de Anotações</h1>
            <p className="text-muted-foreground">Organize suas anotações e lembretes</p>
          </div>
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
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Anotação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingAnotacao ? 'Editar Anotação' : 'Nova Anotação'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Input
                      id="categoria"
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      placeholder="Ex: Pessoal, Trabalho, etc."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="data">Data</Label>
                    <Input
                      id="data"
                      type="date"
                      value={formData.data}
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="conteudo">Conteúdo *</Label>
                  <Textarea
                    id="conteudo"
                    value={formData.conteudo}
                    onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                    rows={10}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingAnotacao ? 'Atualizar' : 'Criar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dialog de Confirmação para Transformar em Tarefa */}
      <Dialog open={openDialogTarefa} onOpenChange={setOpenDialogTarefa}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transformar Anotação em Tarefa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Deseja transformar a anotação <strong>"{anotacaoParaTarefa?.titulo}"</strong> em uma tarefa?
            </p>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
              <p><strong>Título da tarefa:</strong> {anotacaoParaTarefa?.titulo}</p>
              <p><strong>Descrição:</strong> {anotacaoParaTarefa?.conteudo.substring(0, 100)}{anotacaoParaTarefa && anotacaoParaTarefa.conteudo.length > 100 ? '...' : ''}</p>
              <p><strong>Data de vencimento:</strong> {
                anotacaoParaTarefa?.data 
                  ? format(new Date(anotacaoParaTarefa.data), 'dd/MM/yyyy', { locale: ptBR })
                  : format(addDays(new Date(), 7), 'dd/MM/yyyy', { locale: ptBR }) + ' (7 dias a partir de hoje)'
              }</p>
              <p><strong>Prioridade:</strong> Média</p>
              <p><strong>Status:</strong> Pendente</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialogTarefa(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={confirmarTransformarEmTarefa}
              disabled={transformarEmTarefaMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {transformarEmTarefaMutation.isPending ? 'Criando...' : 'Transformar em Tarefa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex gap-4">
        <Input
          placeholder="Buscar anotações..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as Categorias</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground">Carregando...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {anotacoesFiltradas && anotacoesFiltradas.length > 0 ? (
            anotacoesFiltradas.map((anotacao) => (
              <Card key={anotacao.id} className="p-4 hover:shadow-lg hover:scale-105 active:scale-95 transition-all border-2 hover:border-primary/50 group">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{anotacao.titulo}</h3>
                    <div className="flex gap-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleTransformarEmTarefa(anotacao)}
                        title="Transformar em tarefa"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                        disabled={transformarEmTarefaMutation.isPending}
                      >
                        <CheckSquare className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleEdit(anotacao)}
                        title="Editar anotação"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => deleteMutation.mutate(anotacao.id)}
                        title="Excluir anotação"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Categoria: {anotacao.categoria}</p>
                  {anotacao.data && (
                    <p className="text-xs text-muted-foreground">
                      Data: {format(new Date(anotacao.data), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-4">{anotacao.conteudo}</p>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 col-span-full text-center">
              <p className="text-muted-foreground">Nenhuma anotação encontrada.</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
