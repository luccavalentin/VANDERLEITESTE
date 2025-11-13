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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { BotaoVoltar } from "@/components/BotaoVoltar";
import { ClienteAutocomplete } from "@/components/ClienteAutocomplete";
import { CEPInput } from "@/components/CEPInput";
import { Plus, Edit, Trash2, Home, Search, Copy, Calendar, FileText, Download, TrendingUp, DollarSign, Building2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { gerarPDFRelatorio } from "@/lib/pdf-utils";
import { useTheme } from "next-themes";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Imovel {
  id: string;
  endereco: string;
  cep: string;
  numero: string;
  complemento: string | null;
  cidade: string;
  estado: string;
  matricula: string | null;
  proprietario: string | null;
  valor: number;
  status: 'disponivel' | 'alugado' | 'vendido' | 'manutencao';
  documento_pago: boolean | null;
  data_pagamento: string | null;
  inquilino_id?: string | null;
  valor_aluguel?: number | null;
  data_inicio_aluguel?: string | null;
  data_fim_aluguel?: string | null;
  conta_agua?: string | null;
  conta_energia?: string | null;
  tornar_receita?: boolean | null;
  clientes?: { nome: string; telefone: string; email: string };
  // Novos campos da planilha
  vigencia_inicio?: string | null;
  vigencia_fim?: string | null;
  reajuste_locacao_percentual?: number | null;
  reajuste_locacao_valor_inicial?: number | null;
  reajuste_locacao_valor_final?: number | null;
  inscricao_municipal?: string | null;
  valor_venal?: number | null;
  documentacao_status?: 'ok' | 'pendente' | null;
  contas_aberto_inquilino?: number | null;
}

export default function GestaoImoveis() {
  const [activeTab, setActiveTab] = useState("alugados");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <BotaoVoltar />
        <Home className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Imóveis</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="alugados">Alugados</TabsTrigger>
          <TabsTrigger value="gestao">Gestão de Imóveis</TabsTrigger>
        </TabsList>

        <TabsContent value="alugados">
          <AlugadosTab />
        </TabsContent>

        <TabsContent value="gestao">
          <GestaoTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AlugadosTab() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingImovel, setEditingImovel] = useState<Imovel | null>(null);
  const [busca, setBusca] = useState("");

  const { data: clientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('clientes').select('*').order('nome');
      if (error) throw error;
      return data || [];
    },
  });

  const [formData, setFormData] = useState<{
    endereco: string;
    cep: string;
    numero: string;
    complemento: string;
    cidade: string;
    estado: string;
    valor_aluguel: string;
    alugado: boolean;
    conta_agua: string;
    conta_energia: string;
    inquilino_id: string;
    data_inicio_aluguel: string;
    data_fim_aluguel: string;
    tornar_receita: boolean;
  }>({
    endereco: "",
    cep: "",
    numero: "",
    complemento: "",
    cidade: "",
    estado: "",
    valor_aluguel: "",
    alugado: false,
    conta_agua: "inquilino",
    conta_energia: "inquilino",
    inquilino_id: "",
    data_inicio_aluguel: "",
    data_fim_aluguel: "",
    tornar_receita: false,
  });

  const { data: imoveis, isLoading } = useQuery({
    queryKey: ['imoveis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('imoveis')
        .select('*, clientes(nome, telefone, email)')
        .in('status', ['alugado', 'disponivel'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Imovel[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('imoveis').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imoveis'] });
      queryClient.invalidateQueries({ queryKey: ['transacoes'] });
      toast.success("Imóvel cadastrado com sucesso!");
      setOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase.from('imoveis').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imoveis'] });
      queryClient.invalidateQueries({ queryKey: ['transacoes'] });
      toast.success("Imóvel atualizado com sucesso!");
      setOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('imoveis').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imoveis'] });
      toast.success("Imóvel excluído com sucesso!");
    },
  });

  const resetForm = () => {
    setFormData({
      endereco: "",
      cep: "",
      numero: "",
      complemento: "",
      cidade: "",
      estado: "",
      valor_aluguel: "",
      alugado: false,
      conta_agua: "inquilino",
      conta_energia: "inquilino",
      inquilino_id: "",
      data_inicio_aluguel: "",
      data_fim_aluguel: "",
      tornar_receita: false,
    });
    setEditingImovel(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.endereco || !formData.cep || !formData.numero || !formData.cidade || !formData.estado) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const data: any = {
      endereco: formData.endereco,
      cep: formData.cep,
      numero: formData.numero,
      complemento: formData.complemento || null,
      cidade: formData.cidade,
      estado: formData.estado,
      valor: formData.valor_aluguel ? Number(formData.valor_aluguel) : 0,
      status: formData.alugado ? 'alugado' : 'disponivel',
      inquilino_id: formData.inquilino_id || null,
      valor_aluguel: formData.valor_aluguel ? Number(formData.valor_aluguel) : null,
      data_inicio_aluguel: formData.data_inicio_aluguel || null,
      data_fim_aluguel: formData.data_fim_aluguel || null,
      conta_agua: formData.conta_agua || null,
      conta_energia: formData.conta_energia || null,
      tornar_receita: formData.tornar_receita,
    };

    if (editingImovel) {
      await updateMutation.mutateAsync({ id: editingImovel.id, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }

    // Se tornar_receita estiver marcado, criar transações de entrada
    if (formData.tornar_receita && formData.data_inicio_aluguel && formData.data_fim_aluguel && formData.valor_aluguel) {
      const inicio = new Date(formData.data_inicio_aluguel);
      const fim = new Date(formData.data_fim_aluguel);
      const meses = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24 * 30));
      
      for (let i = 0; i < meses; i++) {
        const dataTransacao = new Date(inicio);
        dataTransacao.setMonth(dataTransacao.getMonth() + i);
        
        await supabase.from('transacoes').insert({
          tipo: 'entrada',
          descricao: `Aluguel - ${formData.endereco}, ${formData.numero}`,
          categoria: 'Aluguel de Imóveis',
          valor: Number(formData.valor_aluguel),
          data: dataTransacao.toISOString().split('T')[0],
          area: 'imoveis',
        });
      }
    }
  };

  const handleEdit = (imovel: Imovel) => {
    setEditingImovel(imovel);
    setFormData({
      endereco: imovel.endereco,
      cep: imovel.cep,
      numero: imovel.numero,
      complemento: imovel.complemento || "",
      cidade: imovel.cidade,
      estado: imovel.estado,
      valor_aluguel: imovel.valor_aluguel ? String(imovel.valor_aluguel) : "",
      alugado: imovel.status === 'alugado',
      conta_agua: imovel.conta_agua || "inquilino",
      conta_energia: imovel.conta_energia || "inquilino",
      inquilino_id: imovel.inquilino_id || "",
      data_inicio_aluguel: imovel.data_inicio_aluguel || "",
      data_fim_aluguel: imovel.data_fim_aluguel || "",
      tornar_receita: imovel.tornar_receita || false,
    });
    setOpen(true);
  };

  const handleVincularTarefa = async (imovel: Imovel) => {
    await supabase.from('tarefas').insert({
      titulo: `Manutenção - ${imovel.endereco}`,
      descricao: `Manutenção do imóvel localizado em ${imovel.endereco}, ${imovel.numero}`,
      data_vencimento: new Date().toISOString().split('T')[0],
      prioridade: 'media',
      status: 'pendente',
    });
    toast.success("Tarefa de manutenção criada!");
  };

  const imoveisFiltrados = imoveis?.filter((i) =>
    i.endereco.toLowerCase().includes(busca.toLowerCase()) ||
    i.cidade.toLowerCase().includes(busca.toLowerCase()) ||
    i.clientes?.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por endereço, inquilino ou status..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Imóvel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingImovel ? 'Editar Imóvel' : 'Novo Imóvel'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="endereco">Endereço *</Label>
                  <Input id="endereco" value={formData.endereco} onChange={(e) => setFormData({ ...formData, endereco: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="numero">Número *</Label>
                  <Input id="numero" value={formData.numero} onChange={(e) => setFormData({ ...formData, numero: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="cep">CEP *</Label>
                  <Input id="cep" value={formData.cep} onChange={(e) => setFormData({ ...formData, cep: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input id="cidade" value={formData.cidade} onChange={(e) => setFormData({ ...formData, cidade: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="estado">Estado *</Label>
                  <Input id="estado" value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value })} maxLength={2} required />
                </div>
                <div>
                  <Label htmlFor="valor_aluguel">Valor do Aluguel</Label>
                  <Input id="valor_aluguel" type="number" step="0.01" value={formData.valor_aluguel} onChange={(e) => setFormData({ ...formData, valor_aluguel: e.target.value })} />
                </div>
                <ClienteAutocomplete
                  value={formData.inquilino_id || null}
                  onChange={(value) => setFormData({ ...formData, inquilino_id: value || null })}
                  label="Locatário"
                  placeholder="Digite o nome do cliente..."
                  required={false}
                />
                <div className="flex items-center space-x-2">
                  <Checkbox id="alugado" checked={formData.alugado} onCheckedChange={(checked) => setFormData({ ...formData, alugado: checked as boolean })} />
                  <Label htmlFor="alugado">Alugado?</Label>
                </div>
                <div>
                  <Label htmlFor="data_inicio_aluguel">Data de Início</Label>
                  <Input id="data_inicio_aluguel" type="date" value={formData.data_inicio_aluguel} onChange={(e) => setFormData({ ...formData, data_inicio_aluguel: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="data_fim_aluguel">Data de Fim</Label>
                  <Input id="data_fim_aluguel" type="date" value={formData.data_fim_aluguel} onChange={(e) => setFormData({ ...formData, data_fim_aluguel: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="conta_agua">Conta de Água</Label>
                  <Select value={formData.conta_agua} onValueChange={(value) => setFormData({ ...formData, conta_agua: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inquilino">Inquilino</SelectItem>
                      <SelectItem value="proprietario">Proprietário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="conta_energia">Conta de Energia</Label>
                  <Select value={formData.conta_energia} onValueChange={(value) => setFormData({ ...formData, conta_energia: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inquilino">Inquilino</SelectItem>
                      <SelectItem value="proprietario">Proprietário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="tornar_receita" checked={formData.tornar_receita} onCheckedChange={(checked) => setFormData({ ...formData, tornar_receita: checked as boolean })} />
                  <Label htmlFor="tornar_receita">Tornar Receita no Período</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingImovel ? 'Atualizar' : 'Salvar'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Endereço</TableHead>
              <TableHead>Inquilino</TableHead>
              <TableHead>Valor Aluguel</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead>Data Início/Fim</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Carregando...</TableCell>
              </TableRow>
            ) : imoveisFiltrados && imoveisFiltrados.length > 0 ? (
              imoveisFiltrados.map((imovel) => (
                <TableRow key={imovel.id}>
                  <TableCell className="font-medium">
                    {imovel.endereco}, {imovel.numero}
                  </TableCell>
                  <TableCell>{imovel.clientes?.nome || "-"}</TableCell>
                  <TableCell>
                    {imovel.valor_aluguel ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(imovel.valor_aluguel)) : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge className={imovel.status === 'alugado' ? 'bg-green-500' : 'bg-gray-500'}>
                      {imovel.status === 'alugado' ? 'Alugado' : 'Disponível'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {imovel.data_inicio_aluguel && imovel.data_fim_aluguel ? (
                      <>
                        {format(new Date(imovel.data_inicio_aluguel), 'dd/MM/yyyy', { locale: ptBR })} / {format(new Date(imovel.data_fim_aluguel), 'dd/MM/yyyy', { locale: ptBR })}
                      </>
                    ) : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(imovel)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleVincularTarefa(imovel)}>
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(imovel.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Nenhum imóvel encontrado</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function GestaoTab() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingImovel, setEditingImovel] = useState<Imovel | null>(null);
  const [busca, setBusca] = useState("");

  const [formData, setFormData] = useState<{
    endereco: string;
    cep: string;
    numero: string;
    complemento: string;
    cidade: string;
    estado: string;
    matricula: string;
    proprietario: string;
    valor: string;
    status: 'disponivel' | 'alugado' | 'vendido' | 'manutencao';
    documento_pago: boolean;
    data_pagamento: string;
    // Novos campos da planilha
    vigencia_inicio: string;
    vigencia_fim: string;
    reajuste_locacao_percentual: string;
    reajuste_locacao_valor_inicial: string;
    reajuste_locacao_valor_final: string;
    inscricao_municipal: string;
    valor_venal: string;
    documentacao_status: 'ok' | 'pendente' | '';
    conta_agua: 'proprio' | 'inquilino' | '';
    conta_energia: 'proprio' | 'inquilino' | '';
    contas_aberto_inquilino: string;
  }>({
    endereco: "",
    cep: "",
    numero: "",
    complemento: "",
    cidade: "",
    estado: "",
    matricula: "",
    proprietario: "",
    valor: "",
    status: "disponivel",
    documento_pago: false,
    data_pagamento: "",
    vigencia_inicio: "",
    vigencia_fim: "",
    reajuste_locacao_percentual: "",
    reajuste_locacao_valor_inicial: "",
    reajuste_locacao_valor_final: "",
    inscricao_municipal: "",
    valor_venal: "",
    documentacao_status: "",
    conta_agua: "",
    conta_energia: "",
    contas_aberto_inquilino: "",
  });

  const { data: imoveis, isLoading } = useQuery({
    queryKey: ['imoveis'],
    queryFn: async () => {
      const { data, error } = await supabase.from('imoveis').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Imovel[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Imovel, 'id'>) => {
      const { error } = await supabase.from('imoveis').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imoveis'] });
      toast.success("Imóvel cadastrado com sucesso!");
      setOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Imovel) => {
      const { error } = await supabase.from('imoveis').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imoveis'] });
      toast.success("Imóvel atualizado com sucesso!");
      setOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('imoveis').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imoveis'] });
      toast.success("Imóvel excluído com sucesso!");
    },
  });

  const resetForm = () => {
    setFormData({
      endereco: "",
      cep: "",
      numero: "",
      complemento: "",
      cidade: "",
      estado: "",
      matricula: "",
      proprietario: "",
      valor: "",
      status: "disponivel",
      documento_pago: false,
      data_pagamento: "",
      vigencia_inicio: "",
      vigencia_fim: "",
      reajuste_locacao_percentual: "",
      reajuste_locacao_valor_inicial: "",
      reajuste_locacao_valor_final: "",
      inscricao_municipal: "",
      valor_venal: "",
      documentacao_status: "",
      conta_agua: "",
      conta_energia: "",
      contas_aberto_inquilino: "",
    });
    setEditingImovel(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Nenhum campo é obrigatório - pode salvar com dados parciais
    const data: any = {
      endereco: formData.endereco || "",
      cep: formData.cep || "",
      numero: formData.numero || "",
      complemento: formData.complemento || null,
      cidade: formData.cidade || "",
      estado: formData.estado || "",
      matricula: formData.matricula || null,
      proprietario: formData.proprietario || null,
      valor: formData.valor ? Number(formData.valor) : 0,
      status: formData.status,
      documento_pago: formData.documento_pago,
      data_pagamento: formData.data_pagamento || null,
      // Novos campos da planilha
      vigencia_inicio: formData.vigencia_inicio || null,
      vigencia_fim: formData.vigencia_fim || null,
      reajuste_locacao_percentual: formData.reajuste_locacao_percentual ? Number(formData.reajuste_locacao_percentual) : null,
      reajuste_locacao_valor_inicial: formData.reajuste_locacao_valor_inicial ? Number(formData.reajuste_locacao_valor_inicial) : null,
      reajuste_locacao_valor_final: formData.reajuste_locacao_valor_final ? Number(formData.reajuste_locacao_valor_final) : null,
      inscricao_municipal: formData.inscricao_municipal || null,
      valor_venal: formData.valor_venal ? Number(formData.valor_venal) : null,
      documentacao_status: formData.documentacao_status || null,
      conta_agua: formData.conta_agua || null,
      conta_energia: formData.conta_energia || null,
      contas_aberto_inquilino: formData.contas_aberto_inquilino ? Number(formData.contas_aberto_inquilino) : null,
    };

    if (editingImovel) {
      updateMutation.mutate({ ...data, id: editingImovel.id } as Imovel);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEnderecoEncontrado = (endereco: {
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
  }) => {
    setFormData({
      ...formData,
      endereco: endereco.logradouro || formData.endereco,
      complemento: endereco.complemento || formData.complemento,
      cidade: endereco.localidade || formData.cidade,
      estado: endereco.uf || formData.estado,
    });
  };

  const handleEdit = (imovel: Imovel) => {
    setEditingImovel(imovel);
    setFormData({
      endereco: imovel.endereco,
      cep: imovel.cep,
      numero: imovel.numero,
      complemento: imovel.complemento || "",
      cidade: imovel.cidade,
      estado: imovel.estado,
      matricula: imovel.matricula || "",
      proprietario: imovel.proprietario || "",
      valor: String(imovel.valor),
      status: imovel.status,
      documento_pago: imovel.documento_pago || false,
      data_pagamento: imovel.data_pagamento || "",
      vigencia_inicio: imovel.vigencia_inicio || imovel.data_inicio_aluguel || "",
      vigencia_fim: imovel.vigencia_fim || imovel.data_fim_aluguel || "",
      reajuste_locacao_percentual: imovel.reajuste_locacao_percentual ? String(imovel.reajuste_locacao_percentual) : "",
      reajuste_locacao_valor_inicial: imovel.reajuste_locacao_valor_inicial ? String(imovel.reajuste_locacao_valor_inicial) : "",
      reajuste_locacao_valor_final: imovel.reajuste_locacao_valor_final ? String(imovel.reajuste_locacao_valor_final) : "",
      inscricao_municipal: imovel.inscricao_municipal || "",
      valor_venal: imovel.valor_venal ? String(imovel.valor_venal) : "",
      documentacao_status: imovel.documentacao_status || (imovel.documento_pago ? 'ok' : 'pendente') || "",
      conta_agua: imovel.conta_agua || "",
      conta_energia: imovel.conta_energia || "",
      contas_aberto_inquilino: imovel.contas_aberto_inquilino ? String(imovel.contas_aberto_inquilino) : "",
    });
    setOpen(true);
  };

  const handleDuplicarPagamento = async (imovel: Imovel) => {
    const novoPagamento = {
      ...imovel,
      data_pagamento: new Date().toISOString().split('T')[0],
    };
    await supabase.from('imoveis').update({ data_pagamento: novoPagamento.data_pagamento }).eq('id', imovel.id);
    toast.success("Pagamento duplicado!");
  };

  const handleAgendarPagamento = async (imovel: Imovel, dataPagamento: string, valor: number) => {
    await supabase.from('transacoes').insert({
      tipo: 'saida',
      descricao: `Pagamento Documento - ${imovel.endereco}`,
      categoria: 'Documentos Imóveis',
      valor: valor,
      data: dataPagamento,
      area: 'imoveis',
    });
    toast.success("Despesa agendada no financeiro!");
  };

  const handleGerarRelatorio = () => {
    if (!imoveis) return;
    gerarPDFRelatorio(
      'Relatório Completo de Imóveis',
      imoveis.map(i => ({
        Endereço: `${i.endereco}, ${i.numero}`,
        CEP: i.cep,
        Matrícula: i.matricula || '-',
        Proprietário: i.proprietario || '-',
        Valor: Number(i.valor),
        'Documento Pago': i.documento_pago ? 'Sim' : 'Não',
      })),
      ['Endereço', 'CEP', 'Matrícula', 'Proprietário', 'Valor', 'Documento Pago']
    );
  };

  const imoveisFiltrados = imoveis?.filter((i) =>
    i.endereco.toLowerCase().includes(busca.toLowerCase()) ||
    i.cidade.toLowerCase().includes(busca.toLowerCase()) ||
    i.matricula?.toLowerCase().includes(busca.toLowerCase())
  );

  const { theme } = useTheme();

  // Cores dos gráficos adaptáveis ao tema
  const chartColors = useMemo(() => {
    const isDark = theme === 'dark';
    return {
      primary: '#3b82f6',
      secondary: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      grid: isDark ? '#374151' : '#e5e7eb',
      axis: isDark ? '#9ca3af' : '#6b7280',
      text: isDark ? '#f3f4f6' : '#111827',
      tooltipBg: isDark ? '#1f2937' : '#ffffff',
      tooltipBorder: isDark ? '#374151' : '#e5e7eb',
    };
  }, [theme]);

  // Métricas calculadas
  const metricas = useMemo(() => {
    if (!imoveis) return {
      total: 0,
      alugados: 0,
      disponiveis: 0,
      vendidos: 0,
      manutencao: 0,
      totalValor: 0,
      mediaValor: 0,
      totalAluguel: 0,
      mediaAluguel: 0,
      totalValorVenal: 0,
    };

    const total = imoveis.length;
    const alugados = imoveis.filter(i => i.status === 'alugado').length;
    const disponiveis = imoveis.filter(i => i.status === 'disponivel').length;
    const vendidos = imoveis.filter(i => i.status === 'vendido').length;
    const manutencao = imoveis.filter(i => i.status === 'manutencao').length;
    
    const totalValor = imoveis.reduce((acc, i) => acc + Number(i.valor || 0), 0);
    const mediaValor = total > 0 ? totalValor / total : 0;
    
    const imoveisAlugados = imoveis.filter(i => i.status === 'alugado' && i.valor_aluguel);
    const totalAluguel = imoveisAlugados.reduce((acc, i) => acc + Number(i.valor_aluguel || 0), 0);
    const mediaAluguel = imoveisAlugados.length > 0 ? totalAluguel / imoveisAlugados.length : 0;
    
    const imoveisComValorVenal = imoveis.filter(i => i.valor_venal);
    const totalValorVenal = imoveisComValorVenal.reduce((acc, i) => acc + Number(i.valor_venal || 0), 0);

    return {
      total,
      alugados,
      disponiveis,
      vendidos,
      manutencao,
      totalValor,
      mediaValor,
      totalAluguel,
      mediaAluguel,
      totalValorVenal,
    };
  }, [imoveis]);

  // Dados para gráfico de distribuição por status
  const dadosPorStatus = useMemo(() => {
    if (!imoveis) return [];
    const statusMap = imoveis.reduce((acc: Record<string, number>, i) => {
      const key = i.status || 'disponivel';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(statusMap).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: value as number,
    }));
  }, [imoveis]);

  // Dados para gráfico de distribuição por cidade
  const dadosPorCidade = useMemo(() => {
    if (!imoveis) return [];
    const cidadeMap = imoveis.reduce((acc: Record<string, number>, i) => {
      const key = i.cidade || 'Sem cidade';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(cidadeMap)
      .map(([name, value]) => ({ name, value: value as number }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [imoveis]);

  // Dados para gráfico de valores de aluguel
  const dadosValoresAluguel = useMemo(() => {
    if (!imoveis) return [];
    const imoveisAlugados = imoveis.filter(i => i.status === 'alugado' && i.valor_aluguel);
    
    return imoveisAlugados.map(i => ({
      endereco: `${i.endereco.substring(0, 20)}...`,
      valor: Number(i.valor_aluguel || 0),
    })).sort((a, b) => b.valor - a.valor).slice(0, 10);
  }, [imoveis]);

  // Dados para gráfico de valores totais por status
  const dadosValoresPorStatus = useMemo(() => {
    if (!imoveis) return [];
    const statusMap = imoveis.reduce((acc: Record<string, number>, i) => {
      const key = i.status || 'disponivel';
      acc[key] = (acc[key] || 0) + Number(i.valor || 0);
      return acc;
    }, {});
    
    return Object.entries(statusMap).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: value as number,
    }));
  }, [imoveis]);

  // Cores para gráficos de pizza
  const COLORS_STATUS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const COLORS_CIDADE = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

  return (
    <div className="space-y-4">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 hover:shadow-primary/20 hover:border-primary/50 group">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Imóveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="text-3xl font-bold">{metricas.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6 hover:shadow-green-500/20 hover:border-green-500/50 group">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Imóveis Alugados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-3xl font-bold text-green-500">{metricas.alugados}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {metricas.total > 0 ? ((metricas.alugados / metricas.total) * 100).toFixed(1) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card className="p-6 hover:shadow-blue-500/20 hover:border-blue-500/50 group">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Média de Valor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <span className="text-3xl font-bold text-blue-500">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metricas.mediaValor)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6 hover:shadow-yellow-500/20 hover:border-yellow-500/50 group">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Média de Aluguel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-yellow-500" />
              <span className="text-3xl font-bold text-yellow-500">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metricas.mediaAluguel)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico de Distribuição por Status */}
        <Card className="p-4 sm:p-6">
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            {dadosPorStatus.length > 0 ? (
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosPorStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      animationDuration={1000}
                    >
                      {dadosPorStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_STATUS[index % COLORS_STATUS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartColors.tooltipBg,
                        border: `1px solid ${chartColors.tooltipBorder}`,
                        borderRadius: '8px',
                        padding: '10px',
                      }}
                      formatter={(value: number) => `${value} imóveis`}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px', color: chartColors.text }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum dado disponível</p>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Distribuição por Cidade */}
        <Card className="p-4 sm:p-6">
          <CardHeader>
            <CardTitle className="text-lg">Top 5 Cidades</CardTitle>
          </CardHeader>
          <CardContent>
            {dadosPorCidade.length > 0 ? (
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosPorCidade} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.2} />
                    <XAxis 
                      dataKey="name" 
                      stroke={chartColors.axis}
                      tick={{ fill: chartColors.axis }}
                      style={{ fontSize: '11px' }}
                    />
                    <YAxis 
                      stroke={chartColors.axis}
                      tick={{ fill: chartColors.axis }}
                      style={{ fontSize: '11px' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartColors.tooltipBg,
                        border: `1px solid ${chartColors.tooltipBorder}`,
                        borderRadius: '8px',
                        padding: '10px',
                      }}
                      formatter={(value: number) => `${value} imóveis`}
                      labelStyle={{ color: chartColors.text, fontWeight: 'bold' }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill={chartColors.primary}
                      radius={[8, 8, 0, 0]}
                      animationDuration={1000}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum dado disponível</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Valores de Aluguel */}
      {dadosValoresAluguel.length > 0 && (
        <Card className="p-4 sm:p-6">
          <CardHeader>
            <CardTitle className="text-lg">Top 10 Valores de Aluguel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosValoresAluguel} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.2} />
                  <XAxis 
                    dataKey="endereco" 
                    stroke={chartColors.axis}
                    tick={{ fill: chartColors.axis }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    style={{ fontSize: '10px' }}
                  />
                  <YAxis 
                    stroke={chartColors.axis}
                    tick={{ fill: chartColors.axis }}
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    style={{ fontSize: '11px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.tooltipBg,
                      border: `1px solid ${chartColors.tooltipBorder}`,
                      borderRadius: '8px',
                      padding: '10px',
                    }}
                    formatter={(value: number) => new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(value)}
                    labelStyle={{ color: chartColors.text, fontWeight: 'bold' }}
                  />
                  <Bar 
                    dataKey="valor" 
                    fill={chartColors.secondary}
                    radius={[8, 8, 0, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de Valores Totais por Status */}
      {dadosValoresPorStatus.length > 0 && (
        <Card className="p-4 sm:p-6">
          <CardHeader>
            <CardTitle className="text-lg">Valor Total por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosValoresPorStatus} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.2} />
                  <XAxis 
                    dataKey="name" 
                    stroke={chartColors.axis}
                    tick={{ fill: chartColors.axis }}
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis 
                    stroke={chartColors.axis}
                    tick={{ fill: chartColors.axis }}
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    style={{ fontSize: '11px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.tooltipBg,
                      border: `1px solid ${chartColors.tooltipBorder}`,
                      borderRadius: '8px',
                      padding: '10px',
                    }}
                    formatter={(value: number) => new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(value)}
                    labelStyle={{ color: chartColors.text, fontWeight: 'bold' }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill={chartColors.primary}
                    radius={[8, 8, 0, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar imóveis..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGerarRelatorio}>
            <Download className="h-4 w-4 mr-2" />
            Gerar Relatório Completo
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Novo Imóvel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingImovel ? 'Editar Imóvel' : 'Novo Imóvel'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input id="endereco" value={formData.endereco} onChange={(e) => setFormData({ ...formData, endereco: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="numero">Número</Label>
                    <Input id="numero" value={formData.numero} onChange={(e) => setFormData({ ...formData, numero: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input id="complemento" value={formData.complemento} onChange={(e) => setFormData({ ...formData, complemento: e.target.value })} />
                  </div>
                  <div>
                    <CEPInput
                      value={formData.cep}
                      onChange={(cep) => setFormData({ ...formData, cep })}
                      onEnderecoEncontrado={handleEnderecoEncontrado}
                      label="CEP"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input id="cidade" value={formData.cidade} onChange={(e) => setFormData({ ...formData, cidade: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="estado">Estado</Label>
                    <Input id="estado" value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })} maxLength={2} placeholder="Ex: SP" />
                  </div>
                  <div>
                    <Label htmlFor="matricula">Matrícula</Label>
                    <Input id="matricula" value={formData.matricula} onChange={(e) => setFormData({ ...formData, matricula: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="proprietario">Proprietário</Label>
                    <Input id="proprietario" value={formData.proprietario} onChange={(e) => setFormData({ ...formData, proprietario: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="valor">Valor</Label>
                    <Input id="valor" type="number" step="0.01" value={formData.valor} onChange={(e) => setFormData({ ...formData, valor: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="disponivel">Disponível</SelectItem>
                        <SelectItem value="alugado">Alugado</SelectItem>
                        <SelectItem value="vendido">Vendido</SelectItem>
                        <SelectItem value="manutencao">Manutenção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="data_pagamento">Data de Pagamento</Label>
                    <Input id="data_pagamento" type="date" value={formData.data_pagamento} onChange={(e) => setFormData({ ...formData, data_pagamento: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="vigencia_inicio">Vigência - Data Início</Label>
                    <Input id="vigencia_inicio" type="date" value={formData.vigencia_inicio} onChange={(e) => setFormData({ ...formData, vigencia_inicio: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="vigencia_fim">Vigência - Data Fim</Label>
                    <Input id="vigencia_fim" type="date" value={formData.vigencia_fim} onChange={(e) => setFormData({ ...formData, vigencia_fim: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="reajuste_locacao_percentual">Reajuste de Locação - %</Label>
                    <Input id="reajuste_locacao_percentual" type="number" step="0.01" placeholder="Ex: 10" value={formData.reajuste_locacao_percentual} onChange={(e) => setFormData({ ...formData, reajuste_locacao_percentual: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="reajuste_locacao_valor_inicial">Reajuste - Valor Inicial</Label>
                    <Input id="reajuste_locacao_valor_inicial" type="number" step="0.01" placeholder="Ex: 1200.00" value={formData.reajuste_locacao_valor_inicial} onChange={(e) => setFormData({ ...formData, reajuste_locacao_valor_inicial: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="reajuste_locacao_valor_final">Reajuste - Valor Final</Label>
                    <Input id="reajuste_locacao_valor_final" type="number" step="0.01" placeholder="Ex: 1800.00" value={formData.reajuste_locacao_valor_final} onChange={(e) => setFormData({ ...formData, reajuste_locacao_valor_final: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="inscricao_municipal">Inscrição Municipal</Label>
                    <Input id="inscricao_municipal" value={formData.inscricao_municipal} onChange={(e) => setFormData({ ...formData, inscricao_municipal: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="valor_venal">Valor Venal</Label>
                    <Input id="valor_venal" type="number" step="0.01" placeholder="Ex: 627644.75" value={formData.valor_venal} onChange={(e) => setFormData({ ...formData, valor_venal: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="documentacao_status">Documentação</Label>
                    <Select value={formData.documentacao_status} onValueChange={(value: any) => setFormData({ ...formData, documentacao_status: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ok">OK</SelectItem>
                        <SelectItem value="pendente">PENDENTE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="conta_agua">Titularidade Água</Label>
                    <Select value={formData.conta_agua} onValueChange={(value: any) => setFormData({ ...formData, conta_agua: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="proprio">PROPRIO</SelectItem>
                        <SelectItem value="inquilino">INQUILINO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="conta_energia">Titularidade Energia</Label>
                    <Select value={formData.conta_energia} onValueChange={(value: any) => setFormData({ ...formData, conta_energia: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="proprio">PROPRIO</SelectItem>
                        <SelectItem value="inquilino">INQUILINO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="contas_aberto_inquilino">Contas em Aberto Inquilino</Label>
                    <Input id="contas_aberto_inquilino" type="number" step="0.01" placeholder="Ex: 0.00" value={formData.contas_aberto_inquilino} onChange={(e) => setFormData({ ...formData, contas_aberto_inquilino: e.target.value })} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="documento_pago" checked={formData.documento_pago} onCheckedChange={(checked) => setFormData({ ...formData, documento_pago: checked as boolean })} />
                    <Label htmlFor="documento_pago">Documento Pago?</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit">{editingImovel ? 'Atualizar' : 'Criar'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Endereço</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Vigência</TableHead>
                <TableHead>Reajuste Locação</TableHead>
                <TableHead>Inscrição Municipal</TableHead>
                <TableHead>Valor Venal</TableHead>
                <TableHead>Documentação</TableHead>
                <TableHead>Titularidade Água</TableHead>
                <TableHead>Titularidade Energia</TableHead>
                <TableHead>Contas em Aberto</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                  <TableCell colSpan={11} className="text-center">Carregando...</TableCell>
              </TableRow>
            ) : imoveisFiltrados && imoveisFiltrados.length > 0 ? (
                imoveisFiltrados.map((imovel) => {
                  const vigenciaInicio = imovel.vigencia_inicio || imovel.data_inicio_aluguel;
                  const vigenciaFim = imovel.vigencia_fim || imovel.data_fim_aluguel;
                  const vigenciaTexto = vigenciaInicio && vigenciaFim 
                    ? `${format(new Date(vigenciaInicio), 'dd.MM.yyyy', { locale: ptBR })} / ${format(new Date(vigenciaFim), 'dd.MM.yyyy', { locale: ptBR })}`
                    : vigenciaInicio 
                    ? format(new Date(vigenciaInicio), 'dd.MM.yyyy', { locale: ptBR })
                    : '-';
                  
                  const reajusteTexto = imovel.reajuste_locacao_percentual 
                    ? `${imovel.reajuste_locacao_percentual}%`
                    : imovel.reajuste_locacao_valor_inicial && imovel.reajuste_locacao_valor_final
                    ? `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(imovel.reajuste_locacao_valor_inicial))} - ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(imovel.reajuste_locacao_valor_final))}`
                    : '-';
                  
                  const documentacaoStatus = imovel.documentacao_status || (imovel.documento_pago ? 'ok' : 'pendente');
                  
                  return (
                <TableRow key={imovel.id}>
                  <TableCell className="font-medium">
                    {imovel.endereco}, {imovel.numero}
                  </TableCell>
                      <TableCell>{imovel.cidade}</TableCell>
                      <TableCell>{vigenciaTexto}</TableCell>
                      <TableCell>{reajusteTexto}</TableCell>
                      <TableCell>{imovel.inscricao_municipal || "-"}</TableCell>
                  <TableCell>
                        {imovel.valor_venal 
                          ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(imovel.valor_venal))
                          : "-"}
                  </TableCell>
                  <TableCell>
                        <Badge className={documentacaoStatus === 'ok' ? 'bg-green-500' : 'bg-red-500'}>
                          {documentacaoStatus === 'ok' ? 'OK' : 'PENDENTE'}
                    </Badge>
                  </TableCell>
                      <TableCell>{imovel.conta_agua ? imovel.conta_agua.toUpperCase() : "-"}</TableCell>
                      <TableCell>{imovel.conta_energia ? imovel.conta_energia.toUpperCase() : "-"}</TableCell>
                      <TableCell>
                        {imovel.contas_aberto_inquilino 
                          ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(imovel.contas_aberto_inquilino))
                          : "R$ 0,00"}
                      </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(imovel)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDuplicarPagamento(imovel)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleAgendarPagamento(imovel, new Date().toISOString().split('T')[0], Number(imovel.valor))}>
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(imovel.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                  );
                })
            ) : (
              <TableRow>
                  <TableCell colSpan={11} className="text-center">Nenhum imóvel encontrado</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </Card>
    </div>
  );
}
