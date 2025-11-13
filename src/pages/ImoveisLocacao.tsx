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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { BotaoVoltar } from "@/components/BotaoVoltar";
import { ClienteAutocomplete } from "@/components/ClienteAutocomplete";
import { 
  Plus, Edit, Trash2, Home, Search, FileText, Download, 
  Calendar, DollarSign, CheckCircle, XCircle, Settings, 
  AlertCircle, Receipt
} from "lucide-react";
import { format, addMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { gerarPDFRelatorio } from "@/lib/pdf-utils";
import { notify } from "@/lib/toast-custom";

interface ContratoLocacao {
  id: string;
  imovel_id: string;
  locatario_id: string;
  valor_aluguel: number;
  data_inicio: string;
  data_fim: string;
  deposito_caucao?: number | null;
  reajuste_indice?: string | null;
  dia_vencimento: number;
  conta_agua: 'inquilino' | 'proprietario';
  conta_energia: 'inquilino' | 'proprietario';
  tornar_receita: boolean;
  gerar_previsao: boolean;
  observacoes?: string | null;
  status: 'ativo' | 'encerrado' | 'suspenso';
  imoveis?: { endereco: string; cidade: string; estado: string };
  clientes?: { nome: string; telefone: string; email: string };
}

interface Imovel {
  id: string;
  endereco: string;
  cidade: string;
  estado: string;
  status: string;
}

export default function ImoveisLocacao() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [openPagamento, setOpenPagamento] = useState(false);
  const [openTarefas, setOpenTarefas] = useState(false);
  const [editingContrato, setEditingContrato] = useState<ContratoLocacao | null>(null);
  const [contratoSelecionado, setContratoSelecionado] = useState<ContratoLocacao | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroImovel, setFiltroImovel] = useState<string>("todos");
  const [filtroLocatario, setFiltroLocatario] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  const [formData, setFormData] = useState({
    imovel_id: "",
    locatario_id: "",
    valor_aluguel: "",
    data_inicio: "",
    data_fim: "",
    deposito_caucao: "",
    reajuste_indice: "",
    dia_vencimento: "5",
    conta_agua: "inquilino" as 'inquilino' | 'proprietario',
    conta_energia: "inquilino" as 'inquilino' | 'proprietario',
    tornar_receita: false,
    gerar_previsao: false,
    observacoes: "",
    status: "ativo" as 'ativo' | 'encerrado' | 'suspenso',
  });

  const { data: contratos, isLoading } = useQuery({
    queryKey: ['contratos-locacao'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contratos_locacao' as any)
        .select(`
          *,
          imoveis:imovel_id(endereco, cidade, estado),
          clientes:locatario_id(nome, telefone, email)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as ContratoLocacao[];
    },
  });

  const { data: imoveis } = useQuery({
    queryKey: ['imoveis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('imoveis')
        .select('id, endereco, cidade, estado, status')
        .order('endereco');
      if (error) throw error;
      return (data || []) as Imovel[];
    },
  });

  const { data: clientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome, telefone, email')
        .order('nome');
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: contrato, error } = await supabase
        .from('contratos_locacao' as any)
        .insert(data)
        .select()
        .single();
      if (error) throw error;

      // Se marcar para gerar previsão, criar lançamentos mensais
      if (data.gerar_previsao && data.tornar_receita) {
        const meses = eachMonthOfInterval({
          start: new Date(data.data_inicio),
          end: new Date(data.data_fim),
        });

        const previsoes = meses.map((mes) => {
          const diaVencimento = parseInt(data.dia_vencimento);
          const dataVencimento = new Date(mes.getFullYear(), mes.getMonth(), diaVencimento);
          
          return {
            tipo: 'entrada',
            descricao: `Aluguel ${imoveis?.find(i => i.id === data.imovel_id)?.endereco || ''} – ${clientes?.find(c => c.id === data.locatario_id)?.nome || ''}`,
            categoria: 'Receita de Aluguel',
            valor: data.valor_aluguel,
            data: format(dataVencimento, 'yyyy-MM-dd'),
            status: 'previsto',
            contrato_locacao_id: (contrato as any).id,
          };
        });

        await supabase.from('transacoes').insert(previsoes);
      }

      return contrato;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos-locacao'] });
      queryClient.invalidateQueries({ queryKey: ['transacoes'] });
      notify.success("Contrato de locação criado com sucesso!");
      setOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      notify.error("Erro ao criar contrato", error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase
        .from('contratos_locacao' as any)
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos-locacao'] });
      notify.success("Contrato atualizado com sucesso!");
      setOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      notify.error("Erro ao atualizar contrato", error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contratos_locacao' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos-locacao'] });
      notify.success("Contrato excluído com sucesso!");
    },
    onError: (error: any) => {
      notify.error("Erro ao excluir contrato", error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      imovel_id: "",
      locatario_id: "",
      valor_aluguel: "",
      data_inicio: "",
      data_fim: "",
      deposito_caucao: "",
      reajuste_indice: "",
      dia_vencimento: "5",
      conta_agua: "inquilino",
      conta_energia: "inquilino",
      tornar_receita: false,
      gerar_previsao: false,
      observacoes: "",
      status: "ativo",
    });
    setEditingContrato(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imovel_id || !formData.locatario_id || !formData.valor_aluguel || !formData.data_inicio || !formData.data_fim) {
      notify.error("Preencha todos os campos obrigatórios");
      return;
    }

    const data = {
      imovel_id: formData.imovel_id,
      locatario_id: formData.locatario_id,
      valor_aluguel: Number(formData.valor_aluguel),
      data_inicio: formData.data_inicio,
      data_fim: formData.data_fim,
      deposito_caucao: formData.deposito_caucao ? Number(formData.deposito_caucao) : null,
      reajuste_indice: formData.reajuste_indice || null,
      dia_vencimento: parseInt(formData.dia_vencimento),
      conta_agua: formData.conta_agua,
      conta_energia: formData.conta_energia,
      tornar_receita: formData.tornar_receita,
      gerar_previsao: formData.gerar_previsao,
      observacoes: formData.observacoes || null,
      status: formData.status,
    };

    if (editingContrato) {
      updateMutation.mutate({ id: editingContrato.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (contrato: ContratoLocacao) => {
    setEditingContrato(contrato);
    setFormData({
      imovel_id: contrato.imovel_id,
      locatario_id: contrato.locatario_id,
      valor_aluguel: contrato.valor_aluguel.toString(),
      data_inicio: contrato.data_inicio,
      data_fim: contrato.data_fim,
      deposito_caucao: contrato.deposito_caucao?.toString() || "",
      reajuste_indice: contrato.reajuste_indice || "",
      dia_vencimento: contrato.dia_vencimento.toString(),
      conta_agua: contrato.conta_agua,
      conta_energia: contrato.conta_energia,
      tornar_receita: contrato.tornar_receita,
      gerar_previsao: contrato.gerar_previsao,
      observacoes: contrato.observacoes || "",
      status: contrato.status,
    });
    setOpen(true);
  };

  const handleEncerrar = (contrato: ContratoLocacao) => {
    updateMutation.mutate({
      id: contrato.id,
      status: 'encerrado',
      data_fim: new Date().toISOString().split('T')[0],
    });
  };

  const contratosFiltrados = useMemo(() => {
    return contratos?.filter((contrato) => {
      const matchBusca = 
        contrato.imoveis?.endereco.toLowerCase().includes(busca.toLowerCase()) ||
        contrato.clientes?.nome.toLowerCase().includes(busca.toLowerCase());
      const matchImovel = filtroImovel === "todos" || contrato.imovel_id === filtroImovel;
      const matchLocatario = filtroLocatario === "todos" || contrato.locatario_id === filtroLocatario;
      const matchStatus = filtroStatus === "todos" || contrato.status === filtroStatus;
      return matchBusca && matchImovel && matchLocatario && matchStatus;
    }) || [];
  }, [contratos, busca, filtroImovel, filtroLocatario, filtroStatus]);

  const handleExportarPDF = () => {
    const dadosFormatados = contratosFiltrados.map(contrato => ({
      imovel: contrato.imoveis?.endereco || '-',
      locatario: contrato.clientes?.nome || '-',
      valor_aluguel: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contrato.valor_aluguel),
      data_inicio: format(new Date(contrato.data_inicio), 'dd/MM/yyyy', { locale: ptBR }),
      data_fim: format(new Date(contrato.data_fim), 'dd/MM/yyyy', { locale: ptBR }),
      conta_agua: contrato.conta_agua === 'inquilino' ? 'Locatário' : 'Proprietário',
      conta_energia: contrato.conta_energia === 'inquilino' ? 'Locatário' : 'Proprietário',
      status: contrato.status === 'ativo' ? 'Ativo' : contrato.status === 'encerrado' ? 'Encerrado' : 'Suspenso',
    }));

    gerarPDFRelatorio({
      titulo: 'Relatório de Contratos de Locação',
      dados: dadosFormatados,
      colunas: ['Imóvel', 'Locatário', 'Valor Aluguel', 'Data Início', 'Data Fim', 'Água', 'Energia', 'Status'],
    });
  };

  const handleRegistrarPagamento = async () => {
    if (!contratoSelecionado) return;

    const { data, error } = await supabase
      .from('transacoes')
      .insert({
        tipo: 'entrada',
        descricao: `Aluguel ${contratoSelecionado.imoveis?.endereco || ''} – ${contratoSelecionado.clientes?.nome || ''}`,
        categoria: 'Receita de Aluguel',
        valor: contratoSelecionado.valor_aluguel,
        data: new Date().toISOString().split('T')[0],
      });

    if (error) {
      notify.error("Erro ao registrar pagamento", error.message);
    } else {
      notify.success("Pagamento registrado com sucesso!");
      setOpenPagamento(false);
      queryClient.invalidateQueries({ queryKey: ['transacoes'] });
    }
  };

  const handleGerarRecibo = () => {
    if (!contratoSelecionado) return;

    gerarPDFRelatorio({
      titulo: "Recibo de Aluguel",
      dados: [
        { label: "Imóvel", valor: contratoSelecionado.imoveis?.endereco || '' },
        { label: "Locatário", valor: contratoSelecionado.clientes?.nome || '' },
        { label: "Valor", valor: contratoSelecionado.valor_aluguel },
        { label: "Data", valor: format(new Date(), 'dd/MM/yyyy', { locale: ptBR }) },
      ],
      colunas: ['Descrição', 'Valor'],
    });
  };

  const handleVincularTarefas = async () => {
    if (!contratoSelecionado) return;

    const tarefas = [
      {
        titulo: `Vistoria - ${contratoSelecionado.imoveis?.endereco || ''}`,
        descricao: `Vistoria do imóvel alugado para ${contratoSelecionado.clientes?.nome || ''}`,
        data_vencimento: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
        prioridade: 'media',
        status: 'pendente',
      },
      {
        titulo: `Cobrança Aluguel - ${contratoSelecionado.clientes?.nome || ''}`,
        descricao: `Cobrança do aluguel do imóvel ${contratoSelecionado.imoveis?.endereco || ''}`,
        data_vencimento: format(new Date(), 'yyyy-MM-dd'),
        prioridade: 'alta',
        status: 'pendente',
      },
    ];

    const { error } = await supabase.from('tarefas').insert(tarefas);

    if (error) {
      notify.error("Erro ao criar tarefas", error.message);
    } else {
      notify.success("Tarefas criadas com sucesso!");
      setOpenTarefas(false);
      queryClient.invalidateQueries({ queryKey: ['tarefas'] });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BotaoVoltar />
          <div>
            <h1 className="text-3xl font-bold">Imóveis de Locação</h1>
            <p className="text-muted-foreground">Gerencie contratos de locação</p>
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
              Novo Contrato de Locação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingContrato ? 'Editar Contrato' : 'Novo Contrato de Locação'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="imovel_id">Imóvel *</Label>
                  <Select
                    value={formData.imovel_id}
                    onValueChange={(value) => setFormData({ ...formData, imovel_id: value })}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o imóvel" />
                    </SelectTrigger>
                    <SelectContent>
                      {imoveis?.map((imovel) => (
                        <SelectItem key={imovel.id} value={imovel.id}>
                          {imovel.endereco} - {imovel.cidade}/{imovel.estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <ClienteAutocomplete
                    value={formData.locatario_id || null}
                    onChange={(value) => setFormData({ ...formData, locatario_id: value || "" })}
                    label="Locatário"
                    required={true}
                    placeholder="Digite o nome do cliente..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_inicio">Data de Início *</Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    required
                    disabled={createMutation.isPending || updateMutation.isPending}
                  />
                </div>
                <div>
                  <Label htmlFor="data_fim">Data de Fim *</Label>
                  <Input
                    id="data_fim"
                    type="date"
                    value={formData.data_fim}
                    onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                    required
                    disabled={createMutation.isPending || updateMutation.isPending}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valor_aluguel">Valor do Aluguel (R$) *</Label>
                  <Input
                    id="valor_aluguel"
                    type="number"
                    step="0.01"
                    value={formData.valor_aluguel}
                    onChange={(e) => setFormData({ ...formData, valor_aluguel: e.target.value })}
                    required
                    disabled={createMutation.isPending || updateMutation.isPending}
                  />
                </div>
                <div>
                  <Label htmlFor="dia_vencimento">Dia de Vencimento *</Label>
                  <Input
                    id="dia_vencimento"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.dia_vencimento}
                    onChange={(e) => setFormData({ ...formData, dia_vencimento: e.target.value })}
                    required
                    disabled={createMutation.isPending || updateMutation.isPending}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="conta_agua">Conta de Água Responsável *</Label>
                  <Select
                    value={formData.conta_agua}
                    onValueChange={(value: any) => setFormData({ ...formData, conta_agua: value })}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inquilino">Locatário</SelectItem>
                      <SelectItem value="proprietario">Proprietário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="conta_energia">Conta de Energia Responsável *</Label>
                  <Select
                    value={formData.conta_energia}
                    onValueChange={(value: any) => setFormData({ ...formData, conta_energia: value })}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inquilino">Locatário</SelectItem>
                      <SelectItem value="proprietario">Proprietário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deposito_caucao">Depósito Caução (R$)</Label>
                  <Input
                    id="deposito_caucao"
                    type="number"
                    step="0.01"
                    value={formData.deposito_caucao}
                    onChange={(e) => setFormData({ ...formData, deposito_caucao: e.target.value })}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  />
                </div>
                <div>
                  <Label htmlFor="reajuste_indice">Reajuste Anual (Índice)</Label>
                  <Select
                    value={formData.reajuste_indice || ""}
                    onValueChange={(value) => setFormData({ ...formData, reajuste_indice: value })}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o índice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IGPM">IGPM</SelectItem>
                      <SelectItem value="IPCA">IPCA</SelectItem>
                      <SelectItem value="percentual_fixo">Percentual Fixo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tornar_receita"
                    checked={formData.tornar_receita}
                    onCheckedChange={(checked) => setFormData({ ...formData, tornar_receita: checked as boolean, gerar_previsao: checked ? formData.gerar_previsao : false })}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  />
                  <Label htmlFor="tornar_receita" className="cursor-pointer">
                    Tornar Receita Recorrente?
                  </Label>
                </div>
                {formData.tornar_receita && (
                  <div className="flex items-center space-x-2 ml-6">
                    <Checkbox
                      id="gerar_previsao"
                      checked={formData.gerar_previsao}
                      onCheckedChange={(checked) => setFormData({ ...formData, gerar_previsao: checked as boolean })}
                      disabled={createMutation.isPending || updateMutation.isPending}
                    />
                    <Label htmlFor="gerar_previsao" className="cursor-pointer">
                      Gerar Previsão no Financeiro?
                    </Label>
                  </div>
                )}
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

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={createMutation.isPending || updateMutation.isPending}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingContrato ? 'Salvar Alterações' : 'Criar Contrato'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por imóvel ou locatário..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filtroImovel} onValueChange={setFiltroImovel}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os Imóveis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Imóveis</SelectItem>
              {imoveis?.map((imovel) => (
                <SelectItem key={imovel.id} value={imovel.id}>
                  {imovel.endereco}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filtroLocatario} onValueChange={setFiltroLocatario}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os Locatários" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Locatários</SelectItem>
              {clientes?.map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="encerrado">Encerrado</SelectItem>
              <SelectItem value="suspenso">Suspenso</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Contratos de Locação</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : contratosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum contrato encontrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imóvel</TableHead>
                  <TableHead>Locatário</TableHead>
                  <TableHead>Valor (R$)</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Fim</TableHead>
                  <TableHead>Água</TableHead>
                  <TableHead>Energia</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Opções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contratosFiltrados.map((contrato) => (
                  <TableRow key={contrato.id}>
                    <TableCell className="font-medium">
                      {contrato.imoveis?.endereco || '-'}
                    </TableCell>
                    <TableCell>{contrato.clientes?.nome || '-'}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contrato.valor_aluguel)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(contrato.data_inicio), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(contrato.data_fim), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {contrato.conta_agua === 'inquilino' ? 'Locatário' : 'Proprietário'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {contrato.conta_energia === 'inquilino' ? 'Locatário' : 'Proprietário'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        contrato.status === 'ativo' ? 'bg-green-500' :
                        contrato.status === 'encerrado' ? 'bg-gray-500' :
                        'bg-yellow-500'
                      }>
                        {contrato.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setContratoSelecionado(contrato);
                            handleEdit(contrato);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {contrato.status === 'ativo' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEncerrar(contrato)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setContratoSelecionado(contrato);
                            setOpenTarefas(true);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setContratoSelecionado(contrato);
                            setOpenPagamento(true);
                          }}
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Pagamento */}
      <Dialog open={openPagamento} onOpenChange={setOpenPagamento}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento / Gerar Recibo</DialogTitle>
          </DialogHeader>
          {contratoSelecionado && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Imóvel: {contratoSelecionado.imoveis?.endereco}</p>
                <p className="text-sm text-muted-foreground">Locatário: {contratoSelecionado.clientes?.nome}</p>
                <p className="text-lg font-bold">
                  Valor: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contratoSelecionado.valor_aluguel)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRegistrarPagamento} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Registrar Pagamento
                </Button>
                <Button variant="outline" onClick={handleGerarRecibo} className="flex-1">
                  <Receipt className="h-4 w-4 mr-2" />
                  Gerar Recibo (PDF)
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Tarefas */}
      <Dialog open={openTarefas} onOpenChange={setOpenTarefas}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular Tarefas</DialogTitle>
          </DialogHeader>
          {contratoSelecionado && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Serão criadas tarefas automáticas para:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Vistoria do imóvel</li>
                <li>Cobrança de aluguel</li>
                <li>Manutenção (se necessário)</li>
              </ul>
              <Button onClick={handleVincularTarefas} className="w-full">
                <CheckCircle className="h-4 w-4 mr-2" />
                Criar Tarefas
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

