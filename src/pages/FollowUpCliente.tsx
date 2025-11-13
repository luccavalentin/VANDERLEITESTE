import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { notify } from "@/lib/toast-custom";
import { BotaoVoltar } from "@/components/BotaoVoltar";
import { ClienteAutocomplete } from "@/components/ClienteAutocomplete";
import { Plus, MessageSquare, Clock, User, Calendar, CheckCircle2, AlertCircle, FileText, Filter, Edit, Trash2, Download } from "lucide-react";
import { gerarPDFRelatorio } from "@/lib/pdf-utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FollowUp {
  id: string;
  cliente_id: string;
  mensagem: string;
  responsavel: string;
  data_hora: string;
  lembrete_data: string | null;
  lembrete_texto: string | null;
  transformar_tarefa: boolean;
  tarefa_id: string | null;
  status: 'pendente' | 'concluido' | 'aguardando_cliente';
  anexos: any[];
  clientes?: { nome: string };
}

interface Cliente {
  id: string;
  nome: string;
}

export default function FollowUpCliente() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>("all");
  const [filtroResponsavel, setFiltroResponsavel] = useState<string>("all");
  const [filtroCliente, setFiltroCliente] = useState<string>("all");

  const { data: clientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('clientes').select('id, nome').order('nome');
      if (error) throw error;
      return data as Cliente[];
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: followUps, isLoading } = useQuery({
    queryKey: ['followups'],
    queryFn: async () => {
      // followups não está no types.ts, usar 'as any'
      const { data, error } = await (supabase.from as any)('followups')
        .select('*, clientes(nome)')
        .order('data_hora', { ascending: false });
      if (error) throw error;
      return (data || []) as FollowUp[];
    },
    staleTime: 2 * 60 * 1000,
  });

  const [formData, setFormData] = useState({
    mensagem: "",
    responsavel: "",
    lembrete_data: "",
    lembrete_texto: "",
    transformar_tarefa: false,
    status: "pendente" as 'pendente' | 'concluido' | 'aguardando_cliente',
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: followUp, error } = await (supabase.from as any)('followups').insert(data).select().single();
      if (error) throw error;
      return { followUp, data };
    },
    onSuccess: async (result) => {
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      notify.success("Follow-up registrado com sucesso!");
      
      // Se transformar em tarefa, criar tarefa
      if (result.data.transformar_tarefa && result.data.cliente_id) {
        const clienteNome = clientes?.find(c => c.id === result.data.cliente_id)?.nome || 'Cliente';
        const tarefaData = {
          titulo: `Follow-up: ${clienteNome}`,
          descricao: result.data.mensagem,
          data_vencimento: result.data.lembrete_data || new Date().toISOString().split('T')[0],
          prioridade: 'media',
          status: 'pendente',
          responsavel: result.data.responsavel,
        };
        const { data: tarefa, error: tarefaError } = await supabase.from('tarefas').insert(tarefaData).select().single();
        if (!tarefaError && tarefa && result.followUp) {
          await (supabase.from as any)('followups').update({ tarefa_id: tarefa.id }).eq('id', result.followUp.id);
          queryClient.invalidateQueries({ queryKey: ['followups'] });
          queryClient.invalidateQueries({ queryKey: ['tarefas'] });
          notify.success("Tarefa criada automaticamente!");
        }
      }
      
      setOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      notify.error("Erro ao registrar follow-up", error.message || 'Erro desconhecido');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await (supabase.from as any)('followups').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      notify.success("Follow-up atualizado com sucesso!");
      setOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      notify.error("Erro ao atualizar follow-up", error.message || 'Erro desconhecido');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from as any)('followups').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      notify.success("Follow-up excluído com sucesso!");
    },
    onError: (error: any) => {
      notify.error("Erro ao excluir follow-up", error.message || 'Erro desconhecido');
    },
  });

  const resetForm = () => {
    setFormData({
      mensagem: "",
      responsavel: "",
      lembrete_data: "",
      lembrete_texto: "",
      transformar_tarefa: false,
      status: "pendente",
    });
    setSelectedClienteId(null);
    setEditingFollowUp(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedClienteId) {
      notify.error("Selecione um cliente");
      return;
    }

    if (!formData.mensagem?.trim()) {
      notify.error("A mensagem é obrigatória");
      return;
    }

    const data = {
      cliente_id: selectedClienteId,
      mensagem: formData.mensagem.trim(),
      responsavel: formData.responsavel.trim() || "Usuário",
      lembrete_data: formData.lembrete_data || null,
      lembrete_texto: formData.lembrete_texto?.trim() || null,
      transformar_tarefa: formData.transformar_tarefa,
      status: formData.status,
    };

    try {
      if (editingFollowUp) {
        await updateMutation.mutateAsync({ id: editingFollowUp.id, ...data });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error: any) {
      console.error("Erro ao salvar follow-up:", error);
      notify.error("Erro ao salvar", error?.message || 'Erro desconhecido');
    }
  };

  const followUpsFiltrados = useMemo(() => {
    if (!followUps) return [];
    let filtrados = followUps;

    if (filtroCliente !== "all") {
      filtrados = filtrados.filter(f => f.cliente_id === filtroCliente);
    }

    if (filtroStatus !== "all") {
      filtrados = filtrados.filter(f => f.status === filtroStatus);
    }

    if (filtroResponsavel !== "all") {
      filtrados = filtrados.filter(f => f.responsavel === filtroResponsavel);
    }

    return filtrados;
  }, [followUps, filtroCliente, filtroStatus, filtroResponsavel]);

  const responsaveis = useMemo(() => {
    if (!followUps) return [];
    return Array.from(new Set(followUps.map(f => f.responsavel).filter(Boolean)));
  }, [followUps]);

  const handleExportarPDF = () => {
    const dadosFormatados = (followUps || []).map(followUp => ({
      cliente: followUp.clientes?.nome || '-',
      mensagem: followUp.mensagem,
      responsavel: followUp.responsavel,
      data_hora: format(new Date(followUp.data_hora), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      status: followUp.status === 'pendente' ? 'Pendente' : followUp.status === 'concluido' ? 'Concluído' : 'Aguardando Cliente',
      lembrete: followUp.lembrete_texto || '-',
    }));

    gerarPDFRelatorio({
      titulo: 'Relatório de Follow-ups',
      dados: dadosFormatados,
      colunas: ['Cliente', 'Mensagem', 'Responsável', 'Data/Hora', 'Status', 'Lembrete'],
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { label: "Pendente", color: "bg-yellow-500" },
      concluido: { label: "Concluído", color: "bg-green-500" },
      aguardando_cliente: { label: "Aguardando Cliente", color: "bg-blue-500" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BotaoVoltar />
          <div>
            <h1 className="text-3xl font-bold">Follow-up de Clientes</h1>
            <p className="text-muted-foreground">Gerencie o histórico de relacionamento com clientes</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportarPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Follow-up
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingFollowUp ? 'Editar Follow-up' : 'Novo Follow-up'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <ClienteAutocomplete
                  value={selectedClienteId}
                  onChange={setSelectedClienteId}
                  label="Cliente"
                  placeholder="Digite o nome do cliente..."
                  required={true}
                />

              <div>
                <Label htmlFor="mensagem">Mensagem / Descrição *</Label>
                <Textarea
                  id="mensagem"
                  value={formData.mensagem}
                  onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                  placeholder="Registre o conteúdo da conversa ou interação..."
                  rows={5}
                  required
                  disabled={createMutation.isPending || updateMutation.isPending}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input
                    id="responsavel"
                    value={formData.responsavel}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                    placeholder="Nome do advogado/assistente"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                      <SelectItem value="aguardando_cliente">Aguardando Cliente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lembrete_data">Data do Lembrete</Label>
                  <Input
                    id="lembrete_data"
                    type="date"
                    value={formData.lembrete_data}
                    onChange={(e) => setFormData({ ...formData, lembrete_data: e.target.value })}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  />
                </div>
                <div>
                  <Label htmlFor="lembrete_texto">Próxima Ação</Label>
                  <Input
                    id="lembrete_texto"
                    value={formData.lembrete_texto}
                    onChange={(e) => setFormData({ ...formData, lembrete_texto: e.target.value })}
                    placeholder="Ex: Ligar em 7 dias"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="transformar_tarefa"
                  checked={formData.transformar_tarefa}
                  onCheckedChange={(checked) => setFormData({ ...formData, transformar_tarefa: checked as boolean })}
                  disabled={createMutation.isPending || updateMutation.isPending}
                />
                <Label htmlFor="transformar_tarefa" className="cursor-pointer">
                  Transformar em Tarefa
                </Label>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Salvando...' : (editingFollowUp ? 'Atualizar' : 'Salvar')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Cliente</Label>
              <Select value={filtroCliente} onValueChange={setFiltroCliente}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {clientes?.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="aguardando_cliente">Aguardando Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Responsável</Label>
              <Select value={filtroResponsavel} onValueChange={setFiltroResponsavel}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os responsáveis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {responsaveis.map((resp) => (
                    <SelectItem key={resp} value={resp}>
                      {resp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline de Follow-ups */}
      {isLoading ? (
        <Card className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Carregando follow-ups...</span>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {followUpsFiltrados.length > 0 ? (
            followUpsFiltrados.map((followUp) => (
              <Card key={followUp.id} className="hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 border-2 hover:border-primary/50 group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{followUp.clientes?.nome || "Cliente"}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <User className="h-3 w-3" />
                          {followUp.responsavel}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(followUp.status)}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingFollowUp(followUp);
                          setSelectedClienteId(followUp.cliente_id);
                          setFormData({
                            mensagem: followUp.mensagem,
                            responsavel: followUp.responsavel,
                            lembrete_data: followUp.lembrete_data || "",
                            lembrete_texto: followUp.lembrete_texto || "",
                            transformar_tarefa: followUp.transformar_tarefa,
                            status: followUp.status,
                          });
                          setOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm("Tem certeza que deseja excluir este follow-up?")) {
                            deleteMutation.mutate(followUp.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm mb-4 whitespace-pre-wrap">{followUp.mensagem}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(followUp.data_hora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </div>
                    {followUp.lembrete_data && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Próximo contato: {format(new Date(followUp.lembrete_data), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    )}
                    {followUp.lembrete_texto && (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {followUp.lembrete_texto}
                      </div>
                    )}
                    {followUp.transformar_tarefa && (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Tarefa criada
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="p-8">
              <div className="text-center text-muted-foreground">
                Nenhum follow-up encontrado
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

