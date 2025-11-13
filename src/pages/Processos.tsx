import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { notify } from "@/lib/toast-custom";
import { AREAS_DIREITO, TIPOS_ACAO, STATUS_PROCESSO, DATAS_CRONOLOGIA } from "@/lib/tipos-acao";
import { BotaoVoltar } from "@/components/BotaoVoltar";
import { ClienteAutocomplete } from "@/components/ClienteAutocomplete";
import { Plus, Edit, Trash2, Scale, Search, BarChart3, Download, FileSpreadsheet } from "lucide-react";
import { gerarPDFRelatorio } from "@/lib/pdf-utils";
import { gerarExcelRelatorio } from "@/lib/excel-utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  resultado_causa?: 'ganha' | 'perdida' | 'acordo' | 'parcial' | 'indeferida' | 'anulada' | 'extinta' | null;
  andamento_atual: string | null;
  observacoes: string | null;
  proximos_passos: string | null;
  comarca?: string | null;
  tribunal?: string | null;
  fase_processual?: string | null;
  clientes?: { nome: string };
}

export default function Processos() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingProcesso, setEditingProcesso] = useState<Processo | null>(null);
  const [busca, setBusca] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: clientes, isLoading: loadingClientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('clientes').select('id, nome').order('nome');
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // Cache por 10 minutos
  });

  const [tipoAcaoArea, setTipoAcaoArea] = useState<string>("");
  const [tipoAcao, setTipoAcao] = useState<string>("");
  const [statusCategoria, setStatusCategoria] = useState<string>("");
  const [statusDetalhado, setStatusDetalhado] = useState<string>("");

  const [formData, setFormData] = useState<{
    numero_processo: string;
    tipo: string;
    tipo_acao_area: string;
    tipo_acao: string;
    cliente_id: string;
    status: 'em_andamento' | 'concluido' | 'arquivado';
    status_categoria: string;
    status_detalhado: string;
    data_inicial: string;
    data_conclusao: string;
    responsavel: string;
    valor_causa: string;
    resultado_causa: string;
    andamento_atual: string;
    observacoes: string;
    proximos_passos: string;
    comarca: string;
    tribunal: string;
    fase_processual: string;
    // Cronologia
    data_distribuicao: string;
    data_citacao: string;
    data_contestacao: string;
    data_audiencia_conciliacao: string;
    data_audiencia_instrucao: string;
    data_sentenca: string;
    data_publicacao_sentenca: string;
    data_recurso: string;
    data_transito_julgado: string;
    data_arquivamento: string;
    data_cumprimento_sentenca: string;
    data_acordo: string;
    data_pagamento_liquidacao: string;
    data_limite_prazo: string;
  }>({
    numero_processo: "",
    tipo: "",
    tipo_acao_area: "",
    tipo_acao: "",
    cliente_id: "",
    status: "em_andamento",
    status_categoria: "",
    status_detalhado: "",
    data_inicial: new Date().toISOString().split('T')[0],
    data_conclusao: "",
    responsavel: "",
    valor_causa: "",
    resultado_causa: "",
    andamento_atual: "",
    observacoes: "",
    proximos_passos: "",
    comarca: "",
    tribunal: "",
    fase_processual: "",
    data_distribuicao: "",
    data_citacao: "",
    data_contestacao: "",
    data_audiencia_conciliacao: "",
    data_audiencia_instrucao: "",
    data_sentenca: "",
    data_publicacao_sentenca: "",
    data_recurso: "",
    data_transito_julgado: "",
    data_arquivamento: "",
    data_cumprimento_sentenca: "",
    data_acordo: "",
    data_pagamento_liquidacao: "",
    data_limite_prazo: "",
  });

  const { data: processos, isLoading } = useQuery({
    queryKey: ['processos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('processos')
        .select('*, clientes(nome)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Processo[];
    },
    staleTime: 2 * 60 * 1000, // Cache por 2 minutos
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('processos').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processos'] });
      notify.success("Processo criado com sucesso!");
      setOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      notify.error(`Erro ao criar processo`, error.message || 'Erro desconhecido');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase.from('processos').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processos'] });
      notify.success("Processo atualizado com sucesso!");
      setOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      notify.error(`Erro ao atualizar processo`, error.message || 'Erro desconhecido');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('processos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processos'] });
      notify.success("Processo excluído com sucesso!");
    },
    onError: (error: any) => {
      notify.error(`Erro ao excluir processo`, error.message || 'Erro desconhecido');
    },
  });

  const resetForm = () => {
    setTipoAcaoArea("");
    setTipoAcao("");
    setStatusCategoria("");
    setStatusDetalhado("");
    setFormData({
      numero_processo: "",
      tipo: "",
      tipo_acao_area: "",
      tipo_acao: "",
      cliente_id: "",
      status: "em_andamento",
      status_categoria: "",
      status_detalhado: "",
      data_inicial: new Date().toISOString().split('T')[0],
      data_conclusao: "",
      responsavel: "",
      valor_causa: "",
      resultado_causa: "",
      andamento_atual: "",
      observacoes: "",
      proximos_passos: "",
      comarca: "",
      tribunal: "",
      fase_processual: "",
      data_distribuicao: "",
      data_citacao: "",
      data_contestacao: "",
      data_audiencia_conciliacao: "",
      data_audiencia_instrucao: "",
      data_sentenca: "",
      data_publicacao_sentenca: "",
      data_recurso: "",
      data_transito_julgado: "",
      data_arquivamento: "",
      data_cumprimento_sentenca: "",
      data_acordo: "",
      data_pagamento_liquidacao: "",
      data_limite_prazo: "",
    });
    setEditingProcesso(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validação
    if (!formData.numero_processo?.trim()) {
      notify.error("O número do processo é obrigatório");
      return;
    }
    
    if (!formData.tipo?.trim()) {
      notify.error("O tipo do processo é obrigatório");
      return;
    }
    
    if (!formData.data_inicial) {
      notify.error("A data inicial é obrigatória");
      return;
    }

    const data = {
      numero_processo: formData.numero_processo.trim(),
      tipo: formData.tipo.trim(),
      tipo_acao_area: tipoAcaoArea || null,
      tipo_acao: tipoAcao || null,
      cliente_id: formData.cliente_id || null,
      status: formData.status,
      status_categoria: statusCategoria || null,
      status_detalhado: statusDetalhado || null,
      data_inicial: formData.data_inicial,
      data_conclusao: formData.data_conclusao || null,
      responsavel: formData.responsavel?.trim() || null,
      valor_causa: formData.valor_causa ? Number(formData.valor_causa) : null,
      resultado_causa: formData.resultado_causa || null,
      andamento_atual: formData.andamento_atual?.trim() || null,
      observacoes: formData.observacoes?.trim() || null,
      proximos_passos: formData.proximos_passos?.trim() || null,
      comarca: formData.comarca?.trim() || null,
      tribunal: formData.tribunal?.trim() || null,
      fase_processual: formData.fase_processual?.trim() || null,
      data_distribuicao: formData.data_distribuicao || null,
      data_citacao: formData.data_citacao || null,
      data_contestacao: formData.data_contestacao || null,
      data_audiencia_conciliacao: formData.data_audiencia_conciliacao || null,
      data_audiencia_instrucao: formData.data_audiencia_instrucao || null,
      data_sentenca: formData.data_sentenca || null,
      data_publicacao_sentenca: formData.data_publicacao_sentenca || null,
      data_recurso: formData.data_recurso || null,
      data_transito_julgado: formData.data_transito_julgado || null,
      data_arquivamento: formData.data_arquivamento || null,
      data_cumprimento_sentenca: formData.data_cumprimento_sentenca || null,
      data_acordo: formData.data_acordo || null,
      data_pagamento_liquidacao: formData.data_pagamento_liquidacao || null,
      data_limite_prazo: formData.data_limite_prazo || null,
    };

    try {
      if (editingProcesso) {
        await updateMutation.mutateAsync({ id: editingProcesso.id, ...data });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error: any) {
      console.error("Erro ao salvar processo:", error);
      notify.error(`Erro ao salvar`, error?.message || 'Erro desconhecido');
    }
  };

  const handleEdit = (processo: Processo) => {
    setEditingProcesso(processo);
    const proc = processo as any;
    setTipoAcaoArea(proc.tipo_acao_area || "");
    setTipoAcao(proc.tipo_acao || "");
    setStatusCategoria(proc.status_categoria || "");
    setStatusDetalhado(proc.status_detalhado || "");
    setFormData({
      numero_processo: processo.numero_processo,
      tipo: processo.tipo,
      tipo_acao_area: proc.tipo_acao_area || "",
      tipo_acao: proc.tipo_acao || "",
      cliente_id: processo.cliente_id || "",
      status: processo.status,
      status_categoria: proc.status_categoria || "",
      status_detalhado: proc.status_detalhado || "",
      data_inicial: processo.data_inicial,
      data_conclusao: processo.data_conclusao || "",
      responsavel: processo.responsavel || "",
      valor_causa: processo.valor_causa ? String(processo.valor_causa) : "",
      resultado_causa: processo.resultado_causa || "",
      andamento_atual: processo.andamento_atual || "",
      observacoes: processo.observacoes || "",
      proximos_passos: processo.proximos_passos || "",
      comarca: processo.comarca || "",
      tribunal: processo.tribunal || "",
      fase_processual: processo.fase_processual || "",
      data_distribuicao: proc.data_distribuicao || "",
      data_citacao: proc.data_citacao || "",
      data_contestacao: proc.data_contestacao || "",
      data_audiencia_conciliacao: proc.data_audiencia_conciliacao || "",
      data_audiencia_instrucao: proc.data_audiencia_instrucao || "",
      data_sentenca: proc.data_sentenca || "",
      data_publicacao_sentenca: proc.data_publicacao_sentenca || "",
      data_recurso: proc.data_recurso || "",
      data_transito_julgado: proc.data_transito_julgado || "",
      data_arquivamento: proc.data_arquivamento || "",
      data_cumprimento_sentenca: proc.data_cumprimento_sentenca || "",
      data_acordo: proc.data_acordo || "",
      data_pagamento_liquidacao: proc.data_pagamento_liquidacao || "",
      data_limite_prazo: proc.data_limite_prazo || "",
    });
    setOpen(true);
  };

  const processosFiltrados = useMemo(() => {
    if (!processos) return [];
    const buscaLower = busca.toLowerCase();
    return processos.filter((p) =>
      p.numero_processo.toLowerCase().includes(buscaLower) ||
      p.tipo.toLowerCase().includes(buscaLower) ||
      p.clientes?.nome?.toLowerCase().includes(buscaLower)
    );
  }, [processos, busca]);

  const handleNavigateToMapeamento = () => {
    // Disparar evento customizado para navegação
    const event = new CustomEvent('navigate', { detail: 'mapeamento-estrategico' });
    window.dispatchEvent(event);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BotaoVoltar />
          <div>
            <h1 className="text-3xl font-bold">Gestão de Processos</h1>
            <p className="text-muted-foreground">Gerencie processos jurídicos</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            const dadosFormatados = processosFiltrados.map(processo => ({
              numero_processo: processo.numero_processo,
              tipo: processo.tipo,
              cliente: processo.clientes?.nome || '-',
              status: processo.status === 'em_andamento' ? 'Em Andamento' : processo.status === 'concluido' ? 'Concluído' : 'Arquivado',
              data_inicial: format(new Date(processo.data_inicial), 'dd/MM/yyyy', { locale: ptBR }),
              valor_causa: processo.valor_causa ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(processo.valor_causa) : '-',
            }));
            gerarPDFRelatorio({
              titulo: 'Relatório de Processos',
              dados: dadosFormatados,
              colunas: ['Número', 'Tipo', 'Cliente', 'Status', 'Data Inicial', 'Valor da Causa'],
            });
          }}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={() => {
            const dadosFormatados = processosFiltrados.map(processo => ({
              numero_processo: processo.numero_processo,
              tipo: processo.tipo,
              cliente: processo.clientes?.nome || '-',
              status: processo.status === 'em_andamento' ? 'Em Andamento' : processo.status === 'concluido' ? 'Concluído' : 'Arquivado',
              data_inicial: format(new Date(processo.data_inicial), 'dd/MM/yyyy', { locale: ptBR }),
              valor_causa: processo.valor_causa || 0,
            }));
            gerarExcelRelatorio({
              titulo: 'Relatório de Processos',
              dados: dadosFormatados,
              colunas: ['Número', 'Tipo', 'Cliente', 'Status', 'Data Inicial', 'Valor da Causa'],
            });
          }}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Baixar Excel
          </Button>
          <Button variant="outline" onClick={handleNavigateToMapeamento}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Mapeamento Estratégico
          </Button>
          <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Processo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProcesso ? 'Editar Processo' : 'Novo Processo'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="numero_processo">Número do Processo *</Label>
                    <Input
                      id="numero_processo"
                      value={formData.numero_processo}
                      onChange={(e) => setFormData({ ...formData, numero_processo: e.target.value })}
                      required
                      disabled={createMutation.isPending || updateMutation.isPending}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Input
                      id="tipo"
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      placeholder="Ex: Trabalhista, Cível, etc."
                      required
                      disabled={createMutation.isPending || updateMutation.isPending}
                    />
                  </div>
                </div>
                
                {/* Tipo de Ação Hierárquico */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo_acao_area">Área do Direito</Label>
                    <Select 
                      value={tipoAcaoArea} 
                      onValueChange={(value) => {
                        setTipoAcaoArea(value);
                        setTipoAcao(""); // Reset tipo de ação quando área muda
                      }}
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a área do direito" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(AREAS_DIREITO).map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tipo_acao">Tipo de Ação</Label>
                    <Select 
                      value={tipoAcao} 
                      onValueChange={setTipoAcao}
                      disabled={!tipoAcaoArea || createMutation.isPending || updateMutation.isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={tipoAcaoArea ? "Selecione o tipo de ação" : "Primeiro selecione a área"} />
                      </SelectTrigger>
                      <SelectContent>
                        {tipoAcaoArea && TIPOS_ACAO[tipoAcaoArea]?.map((acao) => (
                          <SelectItem key={acao} value={acao}>
                            {acao}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <ClienteAutocomplete
                  value={formData.cliente_id || null}
                  onChange={(value) => setFormData({ ...formData, cliente_id: value || "" })}
                  label="Cliente"
                  placeholder="Digite o nome do cliente..."
                  required={false}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status *</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="em_andamento">Em Andamento</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="arquivado">Arquivado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="data_inicial">Data Inicial *</Label>
                    <Input
                      id="data_inicial"
                      type="date"
                      value={formData.data_inicial}
                      onChange={(e) => setFormData({ ...formData, data_inicial: e.target.value })}
                      required
                      disabled={createMutation.isPending || updateMutation.isPending}
                    />
                  </div>
                </div>
                
                {/* Status Detalhado */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status_categoria">Categoria do Status</Label>
                    <Select 
                      value={statusCategoria} 
                      onValueChange={(value) => {
                        setStatusCategoria(value);
                        setStatusDetalhado(""); // Reset status detalhado quando categoria muda
                      }}
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_PROCESSO).map(([key, categoria]) => (
                          <SelectItem key={key} value={key}>
                            {categoria.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status_detalhado">Status Detalhado</Label>
                    <Select 
                      value={statusDetalhado} 
                      onValueChange={setStatusDetalhado}
                      disabled={!statusCategoria || createMutation.isPending || updateMutation.isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={statusCategoria ? "Selecione o status" : "Primeiro selecione a categoria"} />
                      </SelectTrigger>
                      <SelectContent>
                        {statusCategoria && STATUS_PROCESSO[statusCategoria as keyof typeof STATUS_PROCESSO]?.status.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                              {status.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {formData.status === 'concluido' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="data_conclusao">Data de Conclusão</Label>
                      <Input
                        id="data_conclusao"
                        type="date"
                        value={formData.data_conclusao}
                        onChange={(e) => setFormData({ ...formData, data_conclusao: e.target.value })}
                        disabled={createMutation.isPending || updateMutation.isPending}
                      />
                    </div>
                    <div>
                      <Label htmlFor="resultado_causa">Resultado da Causa</Label>
                      <Select 
                        value={formData.resultado_causa || undefined} 
                        onValueChange={(value: any) => setFormData({ ...formData, resultado_causa: value })}
                        disabled={createMutation.isPending || updateMutation.isPending}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o resultado (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ganha">Ganha</SelectItem>
                          <SelectItem value="perdida">Perdida</SelectItem>
                          <SelectItem value="acordo">Acordo</SelectItem>
                          <SelectItem value="parcial">Parcial</SelectItem>
                          <SelectItem value="indeferida">Indeferida</SelectItem>
                          <SelectItem value="anulada">Anulada</SelectItem>
                          <SelectItem value="extinta">Extinta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="responsavel">Responsável</Label>
                    <Input
                      id="responsavel"
                      value={formData.responsavel}
                      onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                      disabled={createMutation.isPending || updateMutation.isPending}
                    />
                  </div>
                  <div>
                    <Label htmlFor="valor_causa">Valor da Causa</Label>
                    <Input
                      id="valor_causa"
                      type="number"
                      step="0.01"
                      value={formData.valor_causa}
                      onChange={(e) => setFormData({ ...formData, valor_causa: e.target.value })}
                      disabled={createMutation.isPending || updateMutation.isPending}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="andamento_atual">Andamento Atual</Label>
                  <Textarea
                    id="andamento_atual"
                    value={formData.andamento_atual}
                    onChange={(e) => setFormData({ ...formData, andamento_atual: e.target.value })}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  />
                </div>
                <div>
                  <Label htmlFor="proximos_passos">Próximos Passos</Label>
                  <Textarea
                    id="proximos_passos"
                    value={formData.proximos_passos}
                    onChange={(e) => setFormData({ ...formData, proximos_passos: e.target.value })}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  />
                </div>
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  />
                </div>
                
                {/* Cronologia do Processo */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-semibold mb-4">📅 Cronologia do Processo</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {DATAS_CRONOLOGIA.map((dataItem) => (
                      <div key={dataItem.key}>
                        <Label htmlFor={dataItem.key} title={dataItem.description}>
                          {dataItem.label}
                        </Label>
                        <Input
                          id={dataItem.key}
                          type="date"
                          value={formData[dataItem.key as keyof typeof formData] as string}
                          onChange={(e) => setFormData({ ...formData, [dataItem.key]: e.target.value })}
                          disabled={createMutation.isPending || updateMutation.isPending}
                        />
                      </div>
                    ))}
                  </div>
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
                    {createMutation.isPending || updateMutation.isPending ? 'Salvando...' : (editingProcesso ? 'Atualizar' : 'Criar')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar processos..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-10 max-w-sm"
        />
      </div>

      {isLoading ? (
        <Card className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Carregando processos...</span>
          </div>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Inicial</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processosFiltrados.length > 0 ? (
                processosFiltrados.map((processo) => (
                  <TableRow key={processo.id}>
                    <TableCell className="font-medium">{processo.numero_processo}</TableCell>
                    <TableCell>{processo.tipo}</TableCell>
                    <TableCell>{processo.clientes?.nome || "-"}</TableCell>
                    <TableCell>
                      <Badge className={
                        processo.status === 'concluido' ? 'bg-green-500' :
                        processo.status === 'arquivado' ? 'bg-gray-500' :
                        'bg-blue-500'
                      }>
                        {processo.status === 'concluido' ? 'Concluído' : 
                         processo.status === 'arquivado' ? 'Arquivado' : 
                         'Em Andamento'}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(processo.data_inicial), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                    <TableCell>
                      {processo.valor_causa ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(processo.valor_causa)) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(processo)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => deleteMutation.mutate(processo.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Nenhum processo encontrado</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
