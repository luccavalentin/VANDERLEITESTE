import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
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
import { Plus, Edit, Trash2, Beef, Search, Calendar, FileText, Download, Activity } from "lucide-react";
import { format, differenceInMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { gerarPDFRelatorio } from "@/lib/pdf-utils";

interface Evento {
  tipo: 'cobricao' | 'parto' | 'venda' | 'morte' | 'outro';
  data: string;
  descricao: string;
}

interface HistoricoPeso {
  data: string;
  peso: number;
}

interface Gado {
  id: string;
  identificacao: string;
  brinco?: string | null;
  lote?: string | null;
  categoria: string;
  status: 'ativo' | 'vendido' | 'abatido' | 'morto';
  data_nascimento?: string | null;
  raca?: string | null;
  origem?: 'cria' | 'compra' | null;
  idade_meses: number | null;
  peso_atual: number | null;
  localizacao?: string | null;
  observacoes: string | null;
  historico_peso?: HistoricoPeso[];
  eventos?: Evento[];
}

export default function Gado() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [openDetalhes, setOpenDetalhes] = useState(false);
  const [openEvento, setOpenEvento] = useState(false);
  const [gadoSelecionado, setGadoSelecionado] = useState<Gado | null>(null);
  const [editingGado, setEditingGado] = useState<Gado | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  const [formData, setFormData] = useState<{
    identificacao: string;
    brinco: string;
    lote: string;
    categoria: string;
    status: 'ativo' | 'vendido' | 'abatido' | 'morto';
    data_nascimento: string;
    raca: string;
    origem: 'cria' | 'compra' | '';
    peso_atual: string;
    localizacao: string;
    observacoes: string;
  }>({
    identificacao: "",
    brinco: "",
    lote: "",
    categoria: "",
    status: "ativo",
    data_nascimento: "",
    raca: "",
    origem: "",
    peso_atual: "",
    localizacao: "",
    observacoes: "",
  });

  const [eventoData, setEventoData] = useState<{
    tipo: 'cobricao' | 'parto' | 'venda' | 'morte' | 'outro';
    data: string;
    descricao: string;
  }>({
    tipo: 'outro',
    data: new Date().toISOString().split('T')[0],
    descricao: "",
  });

  const { data: gado, isLoading } = useQuery({
    queryKey: ['gado'],
    queryFn: async () => {
      const { data, error } = await supabase.from('gado').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Gado[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('gado').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gado'] });
      toast.success("Animal cadastrado com sucesso!");
      setOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase.from('gado').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gado'] });
      toast.success("Animal atualizado com sucesso!");
      setOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gado').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gado'] });
      toast.success("Animal excluído com sucesso!");
    },
  });

  const registrarEventoMutation = useMutation({
    mutationFn: async ({ id, evento }: { id: string; evento: Evento }) => {
      const animal = gado?.find(g => g.id === id);
      if (!animal) return;
      
      const eventos = [...(animal.eventos || []), evento];
      const { error } = await supabase
        .from('gado')
        .update({ eventos: eventos as unknown as Json })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gado'] });
      toast.success("Evento registrado com sucesso!");
      setOpenEvento(false);
    },
  });

  const registrarPesoMutation = useMutation({
    mutationFn: async ({ id, peso, data }: { id: string; peso: number; data: string }) => {
      const animal = gado?.find(g => g.id === id);
      if (!animal) return;
      
      const historico = [...(animal.historico_peso || []), { data, peso }];
      const { error } = await supabase
        .from('gado')
        .update({ historico_peso: historico as unknown as Json, peso_atual: peso })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gado'] });
      toast.success("Peso registrado com sucesso!");
    },
  });

  const resetForm = () => {
    setFormData({
      identificacao: "",
      brinco: "",
      lote: "",
      categoria: "",
      status: "ativo",
      data_nascimento: "",
      raca: "",
      origem: "",
      peso_atual: "",
      localizacao: "",
      observacoes: "",
    });
    setEditingGado(null);
  };

  const calcularIdade = (dataNascimento: string | null | undefined): number | null => {
    if (!dataNascimento) return null;
    return differenceInMonths(new Date(), new Date(dataNascimento));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.identificacao || !formData.categoria) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const idadeMeses = formData.data_nascimento ? calcularIdade(formData.data_nascimento) : null;

    const data: any = {
      identificacao: formData.identificacao,
      brinco: formData.brinco || null,
      lote: formData.lote || null,
      categoria: formData.categoria,
      status: formData.status,
      data_nascimento: formData.data_nascimento || null,
      raca: formData.raca || null,
      origem: formData.origem || null,
      idade_meses: idadeMeses,
      peso_atual: formData.peso_atual ? Number(formData.peso_atual) : null,
      localizacao: formData.localizacao || null,
      observacoes: formData.observacoes || null,
      historico_peso: [],
      eventos: [],
    };

    if (editingGado) {
      updateMutation.mutate({ id: editingGado.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (animal: Gado) => {
    setEditingGado(animal);
    setFormData({
      identificacao: animal.identificacao,
      brinco: animal.brinco || "",
      lote: animal.lote || "",
      categoria: animal.categoria,
      status: animal.status,
      data_nascimento: animal.data_nascimento || "",
      raca: animal.raca || "",
      origem: animal.origem || "",
      peso_atual: animal.peso_atual ? String(animal.peso_atual) : "",
      localizacao: animal.localizacao || "",
      observacoes: animal.observacoes || "",
    });
    setOpen(true);
  };

  const handleAbrirDetalhes = (animal: Gado) => {
    setGadoSelecionado(animal);
    setOpenDetalhes(true);
  };

  const handleRegistrarEvento = () => {
    if (!gadoSelecionado) return;
    registrarEventoMutation.mutate({ id: gadoSelecionado.id, evento: eventoData });
    setEventoData({
      tipo: 'outro',
      data: new Date().toISOString().split('T')[0],
      descricao: "",
    });
  };

  const handleRegistrarPeso = (peso: number) => {
    if (!gadoSelecionado) return;
    registrarPesoMutation.mutate({
      id: gadoSelecionado.id,
      peso,
      data: new Date().toISOString().split('T')[0],
    });
  };

  const handleGerarRelatorio = () => {
    if (!gado) return;
    gerarPDFRelatorio(
      'Relatório de Gado',
      gado.map(a => ({
        Identificação: a.identificacao,
        Brinco: a.brinco || '-',
        Lote: a.lote || '-',
        Categoria: a.categoria,
        Status: a.status,
        Idade: a.idade_meses ? `${a.idade_meses} meses` : '-',
        'Peso Atual': a.peso_atual ? `${a.peso_atual} kg` : '-',
        Localização: a.localizacao || '-',
      })),
      ['Identificação', 'Brinco', 'Lote', 'Categoria', 'Status', 'Idade', 'Peso Atual', 'Localização']
    );
  };

  const gadoFiltrado = gado?.filter((g) => {
    const matchBusca = 
      g.identificacao.toLowerCase().includes(busca.toLowerCase()) ||
      g.brinco?.toLowerCase().includes(busca.toLowerCase()) ||
      g.lote?.toLowerCase().includes(busca.toLowerCase()) ||
      g.categoria.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = filtroCategoria === "todos" || g.categoria === filtroCategoria;
    const matchStatus = filtroStatus === "todos" || g.status === filtroStatus;
    return matchBusca && matchCategoria && matchStatus;
  });

  const categorias = Array.from(new Set(gado?.map(a => a.categoria) || []));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BotaoVoltar />
          <div>
            <h1 className="text-3xl font-bold">Gestão de Gado</h1>
            <p className="text-muted-foreground">Gerencie seu rebanho</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGerarRelatorio}>
            <Download className="h-4 w-4 mr-2" />
            Gerar Relatório
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Animal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingGado ? 'Editar Animal' : 'Cadastrar Animal'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="identificacao">Identificação *</Label>
                    <Input
                      id="identificacao"
                      value={formData.identificacao}
                      onChange={(e) => setFormData({ ...formData, identificacao: e.target.value })}
                      placeholder="Ex: Nome, Brinco, etc."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="brinco">Número de Brinco</Label>
                    <Input
                      id="brinco"
                      value={formData.brinco}
                      onChange={(e) => setFormData({ ...formData, brinco: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lote">Lote</Label>
                    <Input
                      id="lote"
                      value={formData.lote}
                      onChange={(e) => setFormData({ ...formData, lote: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Input
                      id="categoria"
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      placeholder="Ex: Bezerro, Vaca, Touro, etc."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                    <Input
                      id="data_nascimento"
                      type="date"
                      value={formData.data_nascimento}
                      onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="raca">Raça</Label>
                    <Input
                      id="raca"
                      value={formData.raca}
                      onChange={(e) => setFormData({ ...formData, raca: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="origem">Origem</Label>
                    <Select value={formData.origem} onValueChange={(value: any) => setFormData({ ...formData, origem: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cria">Cria</SelectItem>
                        <SelectItem value="compra">Compra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Situação *</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="vendido">Vendido</SelectItem>
                        <SelectItem value="abatido">Abatido</SelectItem>
                        <SelectItem value="morto">Morto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="peso_atual">Peso Atual (kg)</Label>
                    <Input
                      id="peso_atual"
                      type="number"
                      step="0.01"
                      value={formData.peso_atual}
                      onChange={(e) => setFormData({ ...formData, peso_atual: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="localizacao">Localização (Fazenda/Lote)</Label>
                    <Input
                      id="localizacao"
                      value={formData.localizacao}
                      onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
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
                  <Button type="submit">Salvar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por brinco, lote, categoria ou status..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as Categorias</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="vendido">Vendido</SelectItem>
            <SelectItem value="abatido">Abatido</SelectItem>
            <SelectItem value="morto">Morto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brinco</TableHead>
              <TableHead>Lote</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Idade</TableHead>
              <TableHead>Peso Atual</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">Carregando...</TableCell>
              </TableRow>
            ) : gadoFiltrado && gadoFiltrado.length > 0 ? (
              gadoFiltrado.map((animal) => {
                const idade = animal.data_nascimento ? calcularIdade(animal.data_nascimento) : animal.idade_meses;
                return (
                  <TableRow key={animal.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleAbrirDetalhes(animal)}>
                    <TableCell className="font-medium">{animal.brinco || animal.identificacao}</TableCell>
                    <TableCell>{animal.lote || "-"}</TableCell>
                    <TableCell>{animal.categoria}</TableCell>
                    <TableCell>{idade ? `${idade} meses` : "-"}</TableCell>
                    <TableCell>{animal.peso_atual ? `${animal.peso_atual} kg` : "-"}</TableCell>
                    <TableCell>
                      <Badge className={
                        animal.status === 'ativo' ? 'bg-green-500' :
                        animal.status === 'vendido' ? 'bg-blue-500' :
                        animal.status === 'abatido' ? 'bg-orange-500' :
                        'bg-red-500'
                      }>
                        {animal.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(animal)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleAbrirDetalhes(animal)}>
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(animal.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">Nenhum animal encontrado</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={openDetalhes} onOpenChange={setOpenDetalhes}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ficha do Animal - {gadoSelecionado?.identificacao}</DialogTitle>
          </DialogHeader>
          {gadoSelecionado && (
            <div className="space-y-4">
              <Tabs defaultValue="dados">
                <TabsList>
                  <TabsTrigger value="dados">Dados</TabsTrigger>
                  <TabsTrigger value="peso">Histórico de Peso</TabsTrigger>
                  <TabsTrigger value="eventos">Eventos</TabsTrigger>
                </TabsList>

                <TabsContent value="dados" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Identificação</Label>
                      <p className="font-medium">{gadoSelecionado.identificacao}</p>
                    </div>
                    <div>
                      <Label>Brinco</Label>
                      <p className="font-medium">{gadoSelecionado.brinco || "-"}</p>
                    </div>
                    <div>
                      <Label>Lote</Label>
                      <p className="font-medium">{gadoSelecionado.lote || "-"}</p>
                    </div>
                    <div>
                      <Label>Categoria</Label>
                      <p className="font-medium">{gadoSelecionado.categoria}</p>
                    </div>
                    <div>
                      <Label>Raça</Label>
                      <p className="font-medium">{gadoSelecionado.raca || "-"}</p>
                    </div>
                    <div>
                      <Label>Origem</Label>
                      <p className="font-medium">{gadoSelecionado.origem || "-"}</p>
                    </div>
                    <div>
                      <Label>Data de Nascimento</Label>
                      <p className="font-medium">
                        {gadoSelecionado.data_nascimento ? format(new Date(gadoSelecionado.data_nascimento), 'dd/MM/yyyy', { locale: ptBR }) : "-"}
                      </p>
                    </div>
                    <div>
                      <Label>Idade</Label>
                      <p className="font-medium">
                        {gadoSelecionado.data_nascimento ? `${calcularIdade(gadoSelecionado.data_nascimento)} meses` : gadoSelecionado.idade_meses ? `${gadoSelecionado.idade_meses} meses` : "-"}
                      </p>
                    </div>
                    <div>
                      <Label>Peso Atual</Label>
                      <p className="font-medium">{gadoSelecionado.peso_atual ? `${gadoSelecionado.peso_atual} kg` : "-"}</p>
                    </div>
                    <div>
                      <Label>Localização</Label>
                      <p className="font-medium">{gadoSelecionado.localizacao || "-"}</p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Badge className={
                        gadoSelecionado.status === 'ativo' ? 'bg-green-500' :
                        gadoSelecionado.status === 'vendido' ? 'bg-blue-500' :
                        gadoSelecionado.status === 'abatido' ? 'bg-orange-500' :
                        'bg-red-500'
                      }>
                        {gadoSelecionado.status}
                      </Badge>
                    </div>
                  </div>
                  {gadoSelecionado.observacoes && (
                    <div>
                      <Label>Observações</Label>
                      <p className="text-sm text-muted-foreground">{gadoSelecionado.observacoes}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="peso" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Histórico de Peso</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const peso = prompt("Digite o peso atual (kg):");
                        if (peso) {
                          handleRegistrarPeso(Number(peso));
                        }
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Registrar Peso
                    </Button>
                  </div>
                  {gadoSelecionado.historico_peso && gadoSelecionado.historico_peso.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Peso (kg)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {gadoSelecionado.historico_peso.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{format(new Date(item.data), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                            <TableCell>{item.peso} kg</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground">Nenhum registro de peso encontrado.</p>
                  )}
                </TabsContent>

                <TabsContent value="eventos" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Eventos</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setOpenEvento(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Registrar Evento
                    </Button>
                  </div>
                  {gadoSelecionado.eventos && gadoSelecionado.eventos.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Descrição</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {gadoSelecionado.eventos.map((evento, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Badge>{evento.tipo}</Badge>
                            </TableCell>
                            <TableCell>{format(new Date(evento.data), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                            <TableCell>{evento.descricao}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground">Nenhum evento registrado.</p>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => handleEdit(gadoSelecionado)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline" onClick={handleGerarRelatorio}>
                  <Download className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Registrar Evento */}
      <Dialog open={openEvento} onOpenChange={setOpenEvento}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Evento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="evento_tipo">Tipo de Evento</Label>
              <Select value={eventoData.tipo} onValueChange={(value: any) => setEventoData({ ...eventoData, tipo: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cobricao">Cobrição</SelectItem>
                  <SelectItem value="parto">Parto</SelectItem>
                  <SelectItem value="venda">Venda</SelectItem>
                  <SelectItem value="morte">Morte</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="evento_data">Data</Label>
              <Input
                id="evento_data"
                type="date"
                value={eventoData.data}
                onChange={(e) => setEventoData({ ...eventoData, data: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="evento_descricao">Descrição</Label>
              <Textarea
                id="evento_descricao"
                value={eventoData.descricao}
                onChange={(e) => setEventoData({ ...eventoData, descricao: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenEvento(false)}>
                Cancelar
              </Button>
              <Button onClick={handleRegistrarEvento}>
                Registrar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
