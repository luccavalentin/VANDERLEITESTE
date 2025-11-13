import { useState } from "react";
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
import { toast } from "sonner";
import { BotaoVoltar } from "@/components/BotaoVoltar";
import { Plus, Edit, Trash2, Truck, User, Package, Download } from "lucide-react";
import { gerarPDFRelatorio } from "@/lib/pdf-utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Caminhao {
  id: string;
  placa: string;
  modelo: string;
  ano: number | null;
  quilometragem: number | null;
  status: 'ativo' | 'manutencao' | 'inativo';
  data_ultima_revisao: string | null;
}

interface Motorista {
  id: string;
  nome: string;
  cnh: string;
  validade_cnh: string;
  telefone: string;
  caminhao_id: string | null;
}

interface Frete {
  id: string;
  cliente: string;
  origem: string;
  destino: string;
  valor_frete: number;
  despesas: number | null;
  data: string;
  observacoes: string | null;
}

export default function Transportadora() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("caminhoes");

  const handleExportarPDF = () => {
    // Exportar dados da aba ativa
    let dadosFormatados: any[] = [];
    let titulo = '';
    let colunas: string[] = [];

    if (activeTab === 'caminhoes') {
      // Será preenchido dentro do componente CaminhoesTab
      titulo = 'Relatório de Caminhões';
    } else if (activeTab === 'motoristas') {
      titulo = 'Relatório de Motoristas';
    } else if (activeTab === 'fretes') {
      titulo = 'Relatório de Fretes';
    }

    gerarPDFRelatorio({
      titulo,
      dados: dadosFormatados,
      colunas,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BotaoVoltar />
          <Truck className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Gestão da Transportadora</h1>
        </div>
        <Button variant="outline" onClick={handleExportarPDF}>
          <Download className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="caminhoes">Caminhões</TabsTrigger>
          <TabsTrigger value="motoristas">Motoristas</TabsTrigger>
          <TabsTrigger value="fretes">Fretes</TabsTrigger>
        </TabsList>

        <TabsContent value="caminhoes">
          <CaminhoesTab />
        </TabsContent>

        <TabsContent value="motoristas">
          <MotoristasTab />
        </TabsContent>

        <TabsContent value="fretes">
          <FretesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CaminhoesTab() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingCaminhao, setEditingCaminhao] = useState<Caminhao | null>(null);

  const [formData, setFormData] = useState<{
    placa: string;
    modelo: string;
    ano: string;
    quilometragem: string;
    status: 'ativo' | 'manutencao' | 'inativo';
    data_ultima_revisao: string;
  }>({
    placa: "",
    modelo: "",
    ano: "",
    quilometragem: "",
    status: "ativo",
    data_ultima_revisao: "",
  });

  const { data: caminhoes, isLoading } = useQuery({
    queryKey: ['caminhoes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('caminhoes').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Caminhao[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Caminhao, 'id'>) => {
      const { error } = await supabase.from('caminhoes').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caminhoes'] });
      toast.success("Caminhão cadastrado com sucesso!");
      setOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Caminhao) => {
      const { error } = await supabase.from('caminhoes').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caminhoes'] });
      toast.success("Caminhão atualizado com sucesso!");
      setOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('caminhoes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caminhoes'] });
      toast.success("Caminhão excluído com sucesso!");
    },
  });

  const resetForm = () => {
    setFormData({
      placa: "",
      modelo: "",
      ano: "",
      quilometragem: "",
      status: "ativo",
      data_ultima_revisao: "",
    });
    setEditingCaminhao(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.placa || !formData.modelo) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const data = {
      placa: formData.placa,
      modelo: formData.modelo,
      ano: formData.ano ? Number(formData.ano) : null,
      quilometragem: formData.quilometragem ? Number(formData.quilometragem) : null,
      status: formData.status,
      data_ultima_revisao: formData.data_ultima_revisao || null,
    };

    if (editingCaminhao) {
      updateMutation.mutate({ ...data, id: editingCaminhao.id } as Caminhao);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (caminhao: Caminhao) => {
    setEditingCaminhao(caminhao);
    setFormData({
      placa: caminhao.placa,
      modelo: caminhao.modelo,
      ano: caminhao.ano ? String(caminhao.ano) : "",
      quilometragem: caminhao.quilometragem ? String(caminhao.quilometragem) : "",
      status: caminhao.status,
      data_ultima_revisao: caminhao.data_ultima_revisao || "",
    });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Caminhão
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCaminhao ? 'Editar Caminhão' : 'Novo Caminhão'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="placa">Placa *</Label>
                <Input id="placa" value={formData.placa} onChange={(e) => setFormData({ ...formData, placa: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="modelo">Modelo *</Label>
                <Input id="modelo" value={formData.modelo} onChange={(e) => setFormData({ ...formData, modelo: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ano">Ano</Label>
                  <Input id="ano" type="number" value={formData.ano} onChange={(e) => setFormData({ ...formData, ano: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="quilometragem">Quilometragem</Label>
                  <Input id="quilometragem" type="number" value={formData.quilometragem} onChange={(e) => setFormData({ ...formData, quilometragem: e.target.value })} />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="data_ultima_revisao">Data Última Revisão</Label>
                <Input id="data_ultima_revisao" type="date" value={formData.data_ultima_revisao} onChange={(e) => setFormData({ ...formData, data_ultima_revisao: e.target.value })} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingCaminhao ? 'Atualizar' : 'Criar'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Placa</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Ano</TableHead>
              <TableHead>Quilometragem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Carregando...</TableCell>
              </TableRow>
            ) : caminhoes && caminhoes.length > 0 ? (
              caminhoes.map((caminhao) => (
                <TableRow key={caminhao.id}>
                  <TableCell className="font-medium">{caminhao.placa}</TableCell>
                  <TableCell>{caminhao.modelo}</TableCell>
                  <TableCell>{caminhao.ano || "-"}</TableCell>
                  <TableCell>{caminhao.quilometragem ? `${caminhao.quilometragem.toLocaleString()} km` : "-"}</TableCell>
                  <TableCell>
                    <Badge className={
                      caminhao.status === 'ativo' ? 'bg-green-500' :
                      caminhao.status === 'manutencao' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }>
                      {caminhao.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(caminhao)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(caminhao.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Nenhum caminhão encontrado</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function MotoristasTab() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingMotorista, setEditingMotorista] = useState<Motorista | null>(null);
  const [selectedCaminhaoId, setSelectedCaminhaoId] = useState<string | null>(null);

  const { data: caminhoes } = useQuery({
    queryKey: ['caminhoes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('caminhoes').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const [formData, setFormData] = useState<{
    nome: string;
    cnh: string;
    validade_cnh: string;
    telefone: string;
  }>({
    nome: "",
    cnh: "",
    validade_cnh: "",
    telefone: "",
  });

  const { data: motoristas, isLoading } = useQuery({
    queryKey: ['motoristas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('motoristas')
        .select('*, caminhoes(placa, modelo)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('motoristas').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motoristas'] });
      toast.success("Motorista cadastrado com sucesso!");
      setOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase.from('motoristas').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motoristas'] });
      toast.success("Motorista atualizado com sucesso!");
      setOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('motoristas').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motoristas'] });
      toast.success("Motorista excluído com sucesso!");
    },
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      cnh: "",
      validade_cnh: "",
      telefone: "",
    });
    setEditingMotorista(null);
    setSelectedCaminhaoId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.cnh || !formData.validade_cnh || !formData.telefone) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const data = {
      nome: formData.nome,
      cnh: formData.cnh,
      validade_cnh: formData.validade_cnh,
      telefone: formData.telefone,
      caminhao_id: selectedCaminhaoId || null,
    };

    if (editingMotorista) {
      updateMutation.mutate({ id: editingMotorista.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (motorista: any) => {
    setEditingMotorista(motorista);
    setFormData({
      nome: motorista.nome,
      cnh: motorista.cnh,
      validade_cnh: motorista.validade_cnh,
      telefone: motorista.telefone,
    });
    setSelectedCaminhaoId(motorista.caminhao_id);
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Motorista
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMotorista ? 'Editar Motorista' : 'Novo Motorista'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input id="nome" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cnh">CNH *</Label>
                  <Input id="cnh" value={formData.cnh} onChange={(e) => setFormData({ ...formData, cnh: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="validade_cnh">Validade CNH *</Label>
                  <Input id="validade_cnh" type="date" value={formData.validade_cnh} onChange={(e) => setFormData({ ...formData, validade_cnh: e.target.value })} required />
                </div>
              </div>
              <div>
                <Label htmlFor="telefone">Telefone *</Label>
                <Input id="telefone" value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="caminhao_id">Caminhão</Label>
                <Select value={selectedCaminhaoId || undefined} onValueChange={(value) => setSelectedCaminhaoId(value || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um caminhão (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {caminhoes && caminhoes.length > 0 ? (
                      caminhoes.map((caminhao) => (
                        <SelectItem key={caminhao.id} value={caminhao.id}>
                          {caminhao.placa} - {caminhao.modelo}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">Nenhum caminhão cadastrado</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingMotorista ? 'Atualizar' : 'Criar'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CNH</TableHead>
              <TableHead>Validade CNH</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Caminhão</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Carregando...</TableCell>
              </TableRow>
            ) : motoristas && motoristas.length > 0 ? (
              motoristas.map((motorista: any) => (
                <TableRow key={motorista.id}>
                  <TableCell className="font-medium">{motorista.nome}</TableCell>
                  <TableCell>{motorista.cnh}</TableCell>
                  <TableCell>{format(new Date(motorista.validade_cnh), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                  <TableCell>{motorista.telefone}</TableCell>
                  <TableCell>{motorista.caminhoes ? `${motorista.caminhoes.placa} - ${motorista.caminhoes.modelo}` : "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(motorista)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(motorista.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Nenhum motorista encontrado</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function FretesTab() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingFrete, setEditingFrete] = useState<Frete | null>(null);

  const [formData, setFormData] = useState<{
    cliente: string;
    origem: string;
    destino: string;
    valor_frete: string;
    despesas: string;
    data: string;
    observacoes: string;
  }>({
    cliente: "",
    origem: "",
    destino: "",
    valor_frete: "",
    despesas: "",
    data: new Date().toISOString().split('T')[0],
    observacoes: "",
  });

  const { data: fretes, isLoading } = useQuery({
    queryKey: ['fretes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fretes').select('*').order('data', { ascending: false });
      if (error) throw error;
      return data as Frete[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Frete, 'id'>) => {
      const { error } = await supabase.from('fretes').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fretes'] });
      toast.success("Frete registrado com sucesso!");
      setOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Frete) => {
      const { error } = await supabase.from('fretes').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fretes'] });
      toast.success("Frete atualizado com sucesso!");
      setOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('fretes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fretes'] });
      toast.success("Frete excluído com sucesso!");
    },
  });

  const resetForm = () => {
    setFormData({
      cliente: "",
      origem: "",
      destino: "",
      valor_frete: "",
      despesas: "",
      data: new Date().toISOString().split('T')[0],
      observacoes: "",
    });
    setEditingFrete(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cliente || !formData.origem || !formData.destino || !formData.valor_frete || !formData.data) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const data = {
      cliente: formData.cliente,
      origem: formData.origem,
      destino: formData.destino,
      valor_frete: Number(formData.valor_frete),
      despesas: formData.despesas ? Number(formData.despesas) : 0,
      data: formData.data,
      observacoes: formData.observacoes || null,
    };

    if (editingFrete) {
      updateMutation.mutate({ ...data, id: editingFrete.id } as Frete);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (frete: Frete) => {
    setEditingFrete(frete);
    setFormData({
      cliente: frete.cliente,
      origem: frete.origem,
      destino: frete.destino,
      valor_frete: String(frete.valor_frete),
      despesas: frete.despesas ? String(frete.despesas) : "",
      data: frete.data,
      observacoes: frete.observacoes || "",
    });
    setOpen(true);
  };

  const totalFretes = fretes?.reduce((acc, f) => acc + Number(f.valor_frete), 0) || 0;
  const totalDespesas = fretes?.reduce((acc, f) => acc + (Number(f.despesas) || 0), 0) || 0;
  const lucroLiquido = totalFretes - totalDespesas;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 hover:shadow-green-500/20 hover:border-green-500/50 group">
          <p className="text-sm text-muted-foreground">Total de Fretes</p>
          <h3 className="text-2xl font-bold text-green-500">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalFretes)}
          </h3>
        </Card>
        <Card className="p-4 hover:shadow-red-500/20 hover:border-red-500/50 group">
          <p className="text-sm text-muted-foreground">Total de Despesas</p>
          <h3 className="text-2xl font-bold text-red-500">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDespesas)}
          </h3>
        </Card>
        <Card className="p-4 hover:shadow-primary/20 hover:border-primary/50 group">
          <p className="text-sm text-muted-foreground">Lucro Líquido</p>
          <h3 className={`text-2xl font-bold ${lucroLiquido >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lucroLiquido)}
          </h3>
        </Card>
      </div>

      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Frete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingFrete ? 'Editar Frete' : 'Novo Frete'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="cliente">Cliente *</Label>
                <Input id="cliente" value={formData.cliente} onChange={(e) => setFormData({ ...formData, cliente: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="origem">Origem *</Label>
                  <Input id="origem" value={formData.origem} onChange={(e) => setFormData({ ...formData, origem: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="destino">Destino *</Label>
                  <Input id="destino" value={formData.destino} onChange={(e) => setFormData({ ...formData, destino: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valor_frete">Valor do Frete *</Label>
                  <Input id="valor_frete" type="number" step="0.01" value={formData.valor_frete} onChange={(e) => setFormData({ ...formData, valor_frete: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="despesas">Despesas</Label>
                  <Input id="despesas" type="number" step="0.01" value={formData.despesas} onChange={(e) => setFormData({ ...formData, despesas: e.target.value })} />
                </div>
              </div>
              <div>
                <Label htmlFor="data">Data *</Label>
                <Input id="data" type="date" value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingFrete ? 'Atualizar' : 'Criar'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Origem → Destino</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Valor Frete</TableHead>
              <TableHead>Despesas</TableHead>
              <TableHead>Lucro</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">Carregando...</TableCell>
              </TableRow>
            ) : fretes && fretes.length > 0 ? (
              fretes.map((frete) => {
                const lucro = Number(frete.valor_frete) - (Number(frete.despesas) || 0);
                return (
                  <TableRow key={frete.id}>
                    <TableCell className="font-medium">{frete.cliente}</TableCell>
                    <TableCell>{frete.origem} → {frete.destino}</TableCell>
                    <TableCell>{format(new Date(frete.data), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                    <TableCell className="text-green-500">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(frete.valor_frete))}
                    </TableCell>
                    <TableCell className="text-red-500">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(frete.despesas) || 0)}
                    </TableCell>
                    <TableCell className={lucro >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lucro)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(frete)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(frete.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">Nenhum frete encontrado</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
