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
import { toast } from "sonner";
import { BotaoVoltar } from "@/components/BotaoVoltar";
import { ClienteAutocomplete } from "@/components/ClienteAutocomplete";
import { Plus, Edit, Trash2, FileText, X, Download, Mail, MessageCircle, Search, FileCheck, FileSpreadsheet } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { gerarPDFOrcamentoRecibo } from "@/lib/pdf-utils";
import { gerarExcelOrcamentoRecibo } from "@/lib/excel-utils";

interface Item {
  descricao: string;
  quantidade: number;
  valorUnitario: number;
}

interface Documento {
  id: string;
  numero: string;
  tipo: 'orcamento' | 'recibo';
  cliente_id: string | null;
  itens: Item[];
  valor_total: number;
  data_emissao: string;
  data_vencimento: string | null;
  status: string;
  observacoes: string | null;
  clientes?: { nome: string };
}

export default function OrcamentosRecibos() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [openDetalhes, setOpenDetalhes] = useState(false);
  const [documentoSelecionado, setDocumentoSelecionado] = useState<Documento | null>(null);
  const [editingDocumento, setEditingDocumento] = useState<Documento | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [tipoDocumento, setTipoDocumento] = useState<"orcamento" | "recibo">("orcamento");
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null);
  const [itens, setItens] = useState<Item[]>([{ descricao: "", quantidade: 1, valorUnitario: 0 }]);

  const { data: clientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('clientes').select('id, nome, telefone, email').order('nome');
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // Cache por 10 minutos
  });

  const [formData, setFormData] = useState<{
    numero: string;
    data_emissao: string;
    data_vencimento: string;
    status: string;
    observacoes: string;
  }>({
    numero: "",
    data_emissao: new Date().toISOString().split('T')[0],
    data_vencimento: "",
    status: "pendente",
    observacoes: "",
  });

  const { data: documentos, isLoading } = useQuery({
    queryKey: ['orcamentos_recibos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orcamentos_recibos')
        .select('*, clientes(nome)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Documento[];
    },
    staleTime: 2 * 60 * 1000, // Cache por 2 minutos
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('orcamentos_recibos').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos_recibos'] });
      toast.success(`${tipoDocumento === "orcamento" ? "Orçamento" : "Recibo"} criado com sucesso!`);
      setOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar documento: ${error.message || 'Erro desconhecido'}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase.from('orcamentos_recibos').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos_recibos'] });
      toast.success("Documento atualizado com sucesso!");
      setOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Erro ao atualizar documento");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('orcamentos_recibos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos_recibos'] });
      toast.success("Documento excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir documento");
    },
  });

  const converterEmReciboMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('orcamentos_recibos')
        .update({ tipo: 'recibo', status: 'pago' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos_recibos'] });
      toast.success("Orçamento convertido em recibo!");
      setOpenDetalhes(false);
    },
    onError: () => {
      toast.error("Erro ao converter documento");
    },
  });

  const resetForm = () => {
    setFormData({
      numero: "",
      data_emissao: new Date().toISOString().split('T')[0],
      data_vencimento: "",
      status: "pendente",
      observacoes: "",
    });
    setItens([{ descricao: "", quantidade: 1, valorUnitario: 0 }]);
    setSelectedClienteId(null);
    setEditingDocumento(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validação
    if (!formData.numero?.trim()) {
      toast.error("O número do documento é obrigatório");
      return;
    }
    
    if (itens.length === 0) {
      toast.error("Adicione pelo menos um item");
      return;
    }
    
    const itensInvalidos = itens.filter(i => !i.descricao?.trim() || i.valorUnitario <= 0);
    if (itensInvalidos.length > 0) {
      toast.error("Preencha todos os itens corretamente (descrição e valor maior que zero)");
      return;
    }

    const valorTotal = itens.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0);

    const data = {
      numero: formData.numero.trim(),
      tipo: tipoDocumento,
      cliente_id: selectedClienteId || null,
      itens: itens.filter(i => i.descricao?.trim() && i.valorUnitario > 0),
      valor_total: valorTotal,
      data_emissao: formData.data_emissao,
      data_vencimento: formData.data_vencimento || null,
      status: formData.status,
      observacoes: formData.observacoes?.trim() || null,
    };

    try {
      if (editingDocumento) {
        await updateMutation.mutateAsync({ id: editingDocumento.id, ...data });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error: any) {
      console.error("Erro ao salvar documento:", error);
      toast.error(`Erro ao salvar: ${error?.message || 'Erro desconhecido'}`);
    }
  };

  const adicionarItem = () => {
    setItens([...itens, { descricao: "", quantidade: 1, valorUnitario: 0 }]);
  };

  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const atualizarItem = (index: number, campo: keyof Item, valor: any) => {
    const novosItens = [...itens];
    novosItens[index] = { ...novosItens[index], [campo]: valor };
    setItens(novosItens);
  };

  const handleGerarPDF = (doc: Documento) => {
    gerarPDFOrcamentoRecibo({
      tipo: doc.tipo,
      numero: doc.numero,
      cliente: doc.clientes?.nome,
      itens: doc.itens,
      valorTotal: doc.valor_total,
      dataEmissao: doc.data_emissao,
      dataVencimento: doc.data_vencimento || undefined,
      observacoes: doc.observacoes || undefined,
    });
    toast.success("PDF gerado com sucesso!");
  };

  const handleGerarExcel = (doc: Documento) => {
    gerarExcelOrcamentoRecibo({
      tipo: doc.tipo,
      numero: doc.numero,
      cliente: doc.clientes?.nome,
      itens: doc.itens,
      valorTotal: doc.valor_total,
      dataEmissao: doc.data_emissao,
      dataVencimento: doc.data_vencimento || undefined,
      observacoes: doc.observacoes || undefined,
    });
  };

  const handleEnviarWhatsApp = (doc: Documento) => {
    const cliente = clientes?.find(c => c.id === doc.cliente_id);
    if (!cliente?.telefone) {
      toast.error("Cliente não possui telefone cadastrado");
      return;
    }
    const texto = encodeURIComponent(
      `Olá ${cliente.nome}! Segue o ${doc.tipo === 'orcamento' ? 'orçamento' : 'recibo'} nº ${doc.numero}.\n\n` +
      `Valor Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(doc.valor_total)}\n\n` +
      `Acesse o link para visualizar: [Link do documento]`
    );
    window.open(`https://wa.me/55${cliente.telefone.replace(/\D/g, '')}?text=${texto}`, '_blank');
  };

  const handleEnviarEmail = (doc: Documento) => {
    const cliente = clientes?.find(c => c.id === doc.cliente_id);
    if (!cliente?.email) {
      toast.error("Cliente não possui e-mail cadastrado");
      return;
    }
    const assunto = encodeURIComponent(`${doc.tipo === 'orcamento' ? 'Orçamento' : 'Recibo'} nº ${doc.numero}`);
    const corpo = encodeURIComponent(
      `Olá ${cliente.nome},\n\n` +
      `Segue em anexo o ${doc.tipo === 'orcamento' ? 'orçamento' : 'recibo'} nº ${doc.numero}.\n\n` +
      `Valor Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(doc.valor_total)}\n\n` +
      `Atenciosamente,\nSistema Vanderlei`
    );
    window.open(`mailto:${cliente.email}?subject=${assunto}&body=${corpo}`, '_blank');
  };

  const handleAbrirDetalhes = (doc: Documento) => {
    setDocumentoSelecionado(doc);
    setOpenDetalhes(true);
  };

  const handleEditar = (doc: Documento) => {
    setEditingDocumento(doc);
    setTipoDocumento(doc.tipo);
    setFormData({
      numero: doc.numero,
      data_emissao: doc.data_emissao,
      data_vencimento: doc.data_vencimento || "",
      status: doc.status,
      observacoes: doc.observacoes || "",
    });
    setItens(doc.itens.length > 0 ? doc.itens : [{ descricao: "", quantidade: 1, valorUnitario: 0 }]);
    setSelectedClienteId(doc.cliente_id);
    setOpen(true);
    setOpenDetalhes(false);
  };

  const documentosFiltrados = documentos?.filter((doc) => {
    const matchBusca = 
      doc.numero?.toLowerCase().includes(busca.toLowerCase()) ||
      doc.clientes?.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      doc.data_emissao?.includes(busca);
    const matchStatus = filtroStatus === "todos" || doc.status === filtroStatus;
    const matchTipo = filtroTipo === "todos" || doc.tipo === filtroTipo;
    return matchBusca && matchStatus && matchTipo;
  });

  const valorTotalItens = itens.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BotaoVoltar />
          <div>
            <h1 className="text-3xl font-bold">Orçamentos e Recibos</h1>
            <p className="text-muted-foreground">Gerencie orçamentos e recibos</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setTipoDocumento("orcamento"); }}>
                <FileText className="h-4 w-4 mr-2" />
                Novo Orçamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingDocumento ? 'Editar Documento' : `Novo ${tipoDocumento === 'orcamento' ? 'Orçamento' : 'Recibo'}`}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select value={tipoDocumento} onValueChange={(v: any) => setTipoDocumento(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="orcamento">Orçamento</SelectItem>
                        <SelectItem value="recibo">Recibo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="numero">Número *</Label>
                    <Input id="numero" value={formData.numero} onChange={(e) => setFormData({ ...formData, numero: e.target.value })} required />
                  </div>
                </div>

                <ClienteAutocomplete
                  value={selectedClienteId}
                  onChange={setSelectedClienteId}
                  label="Cliente"
                  placeholder="Digite o nome do cliente..."
                  required={false}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Itens *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={adicionarItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Item
                    </Button>
                  </div>
                  {itens.map((item, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-5">
                          <Label>Descrição</Label>
                          <Input
                            value={item.descricao}
                            onChange={(e) => atualizarItem(index, 'descricao', e.target.value)}
                            placeholder="Descrição do item"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Qtd</Label>
                          <Input
                            type="number"
                            value={item.quantidade}
                            onChange={(e) => atualizarItem(index, 'quantidade', Number(e.target.value))}
                            min="1"
                          />
                        </div>
                        <div className="col-span-3">
                          <Label>Valor Unit.</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.valorUnitario}
                            onChange={(e) => atualizarItem(index, 'valorUnitario', Number(e.target.value))}
                          />
                        </div>
                        <div className="col-span-1">
                          <Label>Total</Label>
                          <Input
                            value={(item.quantidade * item.valorUnitario).toFixed(2)}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                        <div className="col-span-1">
                          <Button type="button" variant="ghost" size="icon" onClick={() => removerItem(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  <div className="flex justify-end">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Valor Total</p>
                      <p className="text-2xl font-bold">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotalItens)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="data_emissao">Data de Emissão *</Label>
                    <Input
                      id="data_emissao"
                      type="date"
                      value={formData.data_emissao}
                      onChange={(e) => setFormData({ ...formData, data_emissao: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="data_vencimento">Data de Vencimento</Label>
                    <Input
                      id="data_vencimento"
                      type="date"
                      value={formData.data_vencimento}
                      onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="aprovado">Aprovado</SelectItem>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="recusado">Recusado</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Button 
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending ? 'Salvando...' : (editingDocumento ? 'Atualizar' : 'Criar')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => { resetForm(); setTipoDocumento("recibo"); setOpen(true); }}>
            <FileCheck className="h-4 w-4 mr-2" />
            Novo Recibo
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, número, status ou data..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Tipos</SelectItem>
            <SelectItem value="orcamento">Orçamento</SelectItem>
            <SelectItem value="recibo">Recibo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="aprovado">Aprovado</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="recusado">Recusado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nº</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data Emissão</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-3 text-muted-foreground">Carregando...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : documentosFiltrados && documentosFiltrados.length > 0 ? (
              documentosFiltrados.map((doc) => (
                <TableRow key={doc.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleAbrirDetalhes(doc)}>
                  <TableCell className="font-medium">{doc.numero}</TableCell>
                  <TableCell>{doc.clientes?.nome || "-"}</TableCell>
                  <TableCell>
                    <Badge>{doc.tipo === 'orcamento' ? 'Orçamento' : 'Recibo'}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(doc.data_emissao), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(doc.valor_total))}
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      doc.status === 'pago' ? 'bg-green-500' :
                      doc.status === 'aprovado' ? 'bg-blue-500' :
                      doc.status === 'recusado' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }>
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleAbrirDetalhes(doc)}>
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleGerarPDF(doc)} title="Gerar PDF">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleGerarExcel(doc)} title="Baixar Excel">
                        <FileSpreadsheet className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">Nenhum documento encontrado</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={openDetalhes} onOpenChange={setOpenDetalhes}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {documentoSelecionado?.tipo === 'orcamento' ? 'Orçamento' : 'Recibo'} - {documentoSelecionado?.numero}
            </DialogTitle>
          </DialogHeader>
          {documentoSelecionado && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cliente</Label>
                  <p className="font-medium">{documentoSelecionado.clientes?.nome || "-"}</p>
                </div>
                <div>
                  <Label>Data de Emissão</Label>
                  <p className="font-medium">{format(new Date(documentoSelecionado.data_emissao), 'dd/MM/yyyy', { locale: ptBR })}</p>
                </div>
                {documentoSelecionado.data_vencimento && (
                  <div>
                    <Label>Data de Vencimento</Label>
                    <p className="font-medium">{format(new Date(documentoSelecionado.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}</p>
                  </div>
                )}
                <div>
                  <Label>Status</Label>
                  <Badge className={
                    documentoSelecionado.status === 'pago' ? 'bg-green-500' :
                    documentoSelecionado.status === 'aprovado' ? 'bg-blue-500' :
                    documentoSelecionado.status === 'recusado' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }>
                    {documentoSelecionado.status}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Itens</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Qtd</TableHead>
                      <TableHead>Valor Unit.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentoSelecionado.itens.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.descricao}</TableCell>
                        <TableCell>{item.quantidade}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valorUnitario)}
                        </TableCell>
                        <TableCell className="text-right">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantidade * item.valorUnitario)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 text-right">
                  <p className="text-lg font-bold">
                    Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(documentoSelecionado.valor_total)}
                  </p>
                </div>
              </div>

              {documentoSelecionado.observacoes && (
                <div>
                  <Label>Observações</Label>
                  <p className="text-sm text-muted-foreground">{documentoSelecionado.observacoes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => handleEditar(documentoSelecionado)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                {documentoSelecionado.tipo === 'orcamento' && documentoSelecionado.status !== 'pago' && (
                  <Button variant="outline" onClick={() => converterEmReciboMutation.mutate(documentoSelecionado.id)}>
                    <FileCheck className="h-4 w-4 mr-2" />
                    Converter em Recibo
                  </Button>
                )}
                <Button variant="outline" onClick={() => handleGerarPDF(documentoSelecionado)}>
                  <Download className="h-4 w-4 mr-2" />
                  Gerar PDF
                </Button>
                <Button variant="outline" onClick={() => handleGerarExcel(documentoSelecionado)}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Baixar Excel
                </Button>
                <Button variant="outline" onClick={() => handleEnviarWhatsApp(documentoSelecionado)}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button variant="outline" onClick={() => handleEnviarEmail(documentoSelecionado)}>
                  <Mail className="h-4 w-4 mr-2" />
                  E-mail
                </Button>
                <Button variant="destructive" onClick={() => deleteMutation.mutate(documentoSelecionado.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
