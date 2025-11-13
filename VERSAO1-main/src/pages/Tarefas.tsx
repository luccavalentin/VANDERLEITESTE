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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, CheckCircle2, Calendar } from "lucide-react";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Tarefa {
  id: string;
  titulo: string;
  descricao: string | null;
  data_vencimento: string;
  prioridade: 'alta' | 'media' | 'baixa';
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
  responsavel: string | null;
  observacoes: string | null;
}

export default function Tarefas() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingTarefa, setEditingTarefa] = useState<Tarefa | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>("todos");

  const [formData, setFormData] = useState<{
    titulo: string;
    descricao: string;
    data_vencimento: string;
    prioridade: 'alta' | 'media' | 'baixa';
    status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
    responsavel: string;
    observacoes: string;
  }>({
    titulo: "",
    descricao: "",
    data_vencimento: "",
    prioridade: "media",
    status: "pendente",
    responsavel: "",
    observacoes: "",
  });

  const { data: tarefas, isLoading } = useQuery({
    queryKey: ['tarefas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tarefas')
        .select('*')
        .order('data_vencimento', { ascending: true });
      if (error) throw error;
      return data as Tarefa[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Tarefa, 'id'>) => {
      const { error } = await supabase.from('tarefas').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarefas'] });
      toast.success("Tarefa criada com sucesso!");
      setOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Erro ao criar tarefa");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Tarefa) => {
      const { error } = await supabase.from('tarefas').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarefas'] });
      toast.success("Tarefa atualizada com sucesso!");
      setOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Erro ao atualizar tarefa");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tarefas').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarefas'] });
      toast.success("Tarefa excluída com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir tarefa");
    },
  });

  const resetForm = () => {
    setFormData({
      titulo: "",
      descricao: "",
      data_vencimento: "",
      prioridade: "media",
      status: "pendente",
      responsavel: "",
      observacoes: "",
    });
    setEditingTarefa(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.data_vencimento) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    if (editingTarefa) {
      updateMutation.mutate({ ...formData, id: editingTarefa.id } as Tarefa);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (tarefa: Tarefa) => {
    setEditingTarefa(tarefa);
    setFormData({
      titulo: tarefa.titulo,
      descricao: tarefa.descricao || "",
      data_vencimento: tarefa.data_vencimento,
      prioridade: tarefa.prioridade,
      status: tarefa.status,
      responsavel: tarefa.responsavel || "",
      observacoes: tarefa.observacoes || "",
    });
    setOpen(true);
  };

  const tarefasFiltradas = tarefas?.filter((tarefa) => {
    const matchBusca = tarefa.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      tarefa.descricao?.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "todos" || tarefa.status === filtroStatus;
    const matchPrioridade = filtroPrioridade === "todos" || tarefa.prioridade === filtroPrioridade;
    return matchBusca && matchStatus && matchPrioridade;
  });

  const tarefasHoje = tarefasFiltradas?.filter((t) => isToday(new Date(t.data_vencimento)) && t.status !== 'concluida' && t.status !== 'cancelada');
  const tarefasAmanha = tarefasFiltradas?.filter((t) => isTomorrow(new Date(t.data_vencimento)) && t.status !== 'concluida' && t.status !== 'cancelada');
  const tarefasPendentes = tarefasFiltradas?.filter((t) => t.status === 'pendente' || t.status === 'em_andamento').length || 0;
  const tarefasConcluidas = tarefasFiltradas?.filter((t) => t.status === 'concluida').length || 0;
  const tarefasAtrasadas = tarefasFiltradas?.filter((t) => isPast(new Date(t.data_vencimento)) && t.status !== 'concluida' && t.status !== 'cancelada').length || 0;

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-500';
      case 'media': return 'bg-orange-500';
      case 'baixa': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida': return 'bg-green-500';
      case 'em_andamento': return 'bg-blue-500';
      case 'pendente': return 'bg-gray-500';
      case 'cancelada': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Tarefas</h1>
          <p className="text-muted-foreground">Gerencie suas tarefas e compromissos</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTarefa ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
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
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_vencimento">Data de Vencimento *</Label>
                  <Input
                    id="data_vencimento"
                    type="date"
                    value={formData.data_vencimento}
                    onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="prioridade">Prioridade *</Label>
                  <Select value={formData.prioridade} onValueChange={(value: any) => setFormData({ ...formData, prioridade: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluida">Concluída</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input
                    id="responsavel"
                    value={formData.responsavel}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingTarefa ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total de Tarefas</p>
          <h3 className="text-2xl font-bold">{tarefasFiltradas?.length || 0}</h3>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Pendentes</p>
          <h3 className="text-2xl font-bold text-orange-500">{tarefasPendentes}</h3>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Concluídas</p>
          <h3 className="text-2xl font-bold text-green-500">{tarefasConcluidas}</h3>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Atrasadas</p>
          <h3 className="text-2xl font-bold text-red-500">{tarefasAtrasadas}</h3>
        </Card>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Buscar tarefas..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluida">Concluída</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as Prioridades</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="media">Média</SelectItem>
            <SelectItem value="baixa">Baixa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {tarefasHoje && tarefasHoje.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tarefas de Hoje
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tarefasHoje.map((tarefa) => (
              <Card key={tarefa.id} className="p-4 hover:shadow-lg transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{tarefa.titulo}</h3>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(tarefa)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(tarefa.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {tarefa.descricao && (
                    <p className="text-sm text-muted-foreground">{tarefa.descricao}</p>
                  )}
                  <div className="flex gap-2">
                    <Badge className={getPrioridadeColor(tarefa.prioridade)}>
                      {tarefa.prioridade}
                    </Badge>
                    <Badge className={getStatusColor(tarefa.status)}>
                      {tarefa.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tarefasAmanha && tarefasAmanha.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tarefas de Amanhã
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tarefasAmanha.map((tarefa) => (
              <Card key={tarefa.id} className="p-4 hover:shadow-lg transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{tarefa.titulo}</h3>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(tarefa)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(tarefa.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {tarefa.descricao && (
                    <p className="text-sm text-muted-foreground">{tarefa.descricao}</p>
                  )}
                  <div className="flex gap-2">
                    <Badge className={getPrioridadeColor(tarefa.prioridade)}>
                      {tarefa.prioridade}
                    </Badge>
                    <Badge className={getStatusColor(tarefa.status)}>
                      {tarefa.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold mb-4">Todas as Tarefas</h2>
        {isLoading ? (
          <p>Carregando...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tarefasFiltradas?.map((tarefa) => (
              <Card key={tarefa.id} className="p-4 hover:shadow-lg transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{tarefa.titulo}</h3>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(tarefa)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(tarefa.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {tarefa.descricao && (
                    <p className="text-sm text-muted-foreground">{tarefa.descricao}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Vencimento: {format(new Date(tarefa.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                  <div className="flex gap-2">
                    <Badge className={getPrioridadeColor(tarefa.prioridade)}>
                      {tarefa.prioridade}
                    </Badge>
                    <Badge className={getStatusColor(tarefa.status)}>
                      {tarefa.status}
                    </Badge>
                  </div>
                  {tarefa.responsavel && (
                    <p className="text-xs text-muted-foreground">
                      Responsável: {tarefa.responsavel}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
