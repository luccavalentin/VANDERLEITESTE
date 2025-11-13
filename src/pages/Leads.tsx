import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { BotaoVoltar } from "@/components/BotaoVoltar";
import { Phone, Mail, Plus, Search, Edit, Trash2, UserPlus, Download, FileSpreadsheet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { gerarPDFRelatorio } from "@/lib/pdf-utils";
import { gerarExcelRelatorio } from "@/lib/excel-utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Lead {
  id: string;
  nome: string; // Mantido para compatibilidade
  descricao?: string | null; // Novo campo principal
  contato: string;
  origem: string;
  status: string;
  observacoes: string | null;
  // Novos campos da planilha
  data_inicio?: string | null;
  data_fim?: string | null;
  valor_contrato?: number | null;
  tarefa?: string | null;
  created_at: string;
}

export default function Leads() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: any) => {
      const { error } = await supabase.from("leads").insert([formData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead criado com sucesso!");
      setIsDialogOpen(false);
      setEditingLead(null);
    },
    onError: () => {
      toast.error("Erro ao criar lead");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase.from("leads").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead atualizado com sucesso!");
      setIsDialogOpen(false);
      setEditingLead(null);
    },
    onError: () => {
      toast.error("Erro ao atualizar lead");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir lead");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const descricao = (formData.get("descricao") as string) || "";
    const nome = descricao || "Lead sem descrição"; // Usa descrição como nome
    
    const data: any = {
      nome: nome,
      descricao: descricao || null,
      contato: (formData.get("contato") as string) || null,
      origem: (formData.get("origem") as string) || null,
      status: (formData.get("status") as string) || "novo",
      observacoes: (formData.get("observacoes") as string) || null,
      // Novos campos da planilha
      data_inicio: (formData.get("data_inicio") as string) || null,
      data_fim: (formData.get("data_fim") as string) || null,
      valor_contrato: formData.get("valor_contrato") ? Number(formData.get("valor_contrato")) : null,
      tarefa: (formData.get("tarefa") as string) || null,
    };

    if (editingLead) {
      updateMutation.mutate({ id: editingLead.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const convertToClient = async (lead: Lead) => {
    try {
      const nome = lead.descricao || lead.nome || "";
      await supabase.from("clientes").insert({
        nome: nome,
        tipo: "pf",
        telefone: lead.contato && !lead.contato.includes("@") ? lead.contato : "",
        email: lead.contato && lead.contato.includes("@") ? lead.contato : "",
        status: "ativo",
        cep: "",
        endereco: "",
        cidade: "",
        estado: "",
      });
      
      await supabase.from("leads").update({ status: "convertido" }).eq("id", lead.id);
      
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Lead convertido em cliente!");
    } catch (error) {
      toast.error("Erro ao converter lead");
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const searchLower = searchTerm.toLowerCase();
    const descricao = lead.descricao || lead.nome || "";
    return (
      descricao.toLowerCase().includes(searchLower) ||
      lead.nome.toLowerCase().includes(searchLower) ||
      (lead.contato && lead.contato.toLowerCase().includes(searchLower)) ||
      (lead.origem && lead.origem.toLowerCase().includes(searchLower)) ||
      (lead.tarefa && lead.tarefa.toLowerCase().includes(searchLower))
  );
  });

  const handleExportarPDF = () => {
    const dadosFormatados = filteredLeads.map(lead => ({
      descricao: lead.descricao || lead.nome,
      data_inicio: lead.data_inicio ? format(new Date(lead.data_inicio), 'dd/MM/yyyy', { locale: ptBR }) : '-',
      data_fim: lead.data_fim ? format(new Date(lead.data_fim), 'dd/MM/yyyy', { locale: ptBR }) : '-',
      valor_contrato: lead.valor_contrato ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.valor_contrato) : '-',
      tarefa: lead.tarefa || '-',
    }));

    gerarPDFRelatorio({
      titulo: 'Relatório de Leads',
      dados: dadosFormatados,
      colunas: ['Descrição', 'Data Início', 'Data Fim', 'Valor do Contrato', 'Tarefa'],
    });
  };

  const handleExportarExcel = () => {
    const dadosFormatados = filteredLeads.map(lead => ({
      descricao: lead.descricao || lead.nome,
      data_inicio: lead.data_inicio ? format(new Date(lead.data_inicio), 'dd/MM/yyyy', { locale: ptBR }) : '-',
      data_fim: lead.data_fim ? format(new Date(lead.data_fim), 'dd/MM/yyyy', { locale: ptBR }) : '-',
      valor_contrato: lead.valor_contrato || 0,
      tarefa: lead.tarefa || '-',
    }));

    gerarExcelRelatorio({
      titulo: 'Relatório de Leads',
      dados: dadosFormatados,
      colunas: ['Descrição', 'Data Início', 'Data Fim', 'Valor do Contrato', 'Tarefa'],
    });
  };

  const statusColors = {
    novo: "bg-blue-500",
    contatado: "bg-yellow-500",
    interessado: "bg-green-500",
    convertido: "bg-purple-500",
    perdido: "bg-red-500",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <BotaoVoltar />
          <div>
            <h1 className="text-3xl font-bold">Gestão de Leads</h1>
            <p className="text-muted-foreground">Gerencie seus leads e oportunidades</p>
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
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 md:p-6 hover:shadow-primary/20 hover:border-primary/50 group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10 transition-transform duration-200 group-hover:scale-110">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Leads</p>
              <p className="text-2xl font-bold">{leads.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 md:p-6 hover:shadow-green-500/20 hover:border-green-500/50 group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/10 transition-transform duration-200 group-hover:scale-110">
              <UserPlus className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Convertidos</p>
              <p className="text-2xl font-bold">
                {leads.filter((l) => l.status === "convertido").length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 md:p-6 hover:shadow-blue-500/20 hover:border-blue-500/50 group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10 transition-transform duration-200 group-hover:scale-110">
              <Mail className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Novos</p>
              <p className="text-2xl font-bold">
                {leads.filter((l) => l.status === "novo").length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, contato ou origem..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingLead(null)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Novo Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingLead ? "Editar Lead" : "Novo Lead"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição *</Label>
                <Input
                  id="descricao"
                  name="descricao"
                  placeholder="Ex: VIA CAMPOS, INTERCAMBIO, SILVIO FELIX..."
                  defaultValue={editingLead?.descricao || editingLead?.nome || ""}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_inicio">Data Início</Label>
                  <Input
                    id="data_inicio"
                    name="data_inicio"
                    type="date"
                    defaultValue={editingLead?.data_inicio || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_fim">Data Fim</Label>
                  <Input
                    id="data_fim"
                    name="data_fim"
                    type="date"
                    defaultValue={editingLead?.data_fim || ""}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor_contrato">Valor do Contrato</Label>
                <Input
                  id="valor_contrato"
                  name="valor_contrato"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 10000.00"
                  defaultValue={editingLead?.valor_contrato || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tarefa">Tarefa</Label>
                <Input
                  id="tarefa"
                  name="tarefa"
                  placeholder="Ex: Seguir up, Fechar contrato..."
                  defaultValue={editingLead?.tarefa || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contato">Telefone ou E-mail</Label>
                <Input
                  id="contato"
                  name="contato"
                  defaultValue={editingLead?.contato || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="origem">Origem</Label>
                <Select name="origem" defaultValue={editingLead?.origem || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="indicacao">Indicação</SelectItem>
                    <SelectItem value="site">Site</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={editingLead?.status || "novo"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="novo">Novo</SelectItem>
                    <SelectItem value="contatado">Contatado</SelectItem>
                    <SelectItem value="interessado">Interessado</SelectItem>
                    <SelectItem value="convertido">Convertido</SelectItem>
                    <SelectItem value="perdido">Perdido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  name="observacoes"
                  defaultValue={editingLead?.observacoes || ""}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground">Carregando...</p>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Data Início</TableHead>
                  <TableHead>Data Fim</TableHead>
                  <TableHead>Valor do Contrato</TableHead>
                  <TableHead>Tarefa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Nenhum lead encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => {
                    const descricao = lead.descricao || lead.nome || "";
                    // Itens em vermelho: status "novo" ou "perdido" (conforme planilha)
                    const isRed = lead.status === "novo" || lead.status === "perdido";
                    
                    return (
                      <TableRow key={lead.id} className="hover:bg-muted/30">
                        <TableCell className={`font-medium ${isRed ? 'text-red-500' : 'text-foreground'}`}>
                          {descricao}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {lead.data_inicio ? format(new Date(lead.data_inicio), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {lead.data_fim ? format(new Date(lead.data_fim), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {lead.valor_contrato 
                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.valor_contrato)
                            : '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {lead.tarefa || '-'}
                        </TableCell>
                        <TableCell>
                <Badge className={statusColors[lead.status as keyof typeof statusColors]}>
                  {lead.status}
                </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                              variant="ghost"
                  onClick={() => {
                    setEditingLead(lead);
                    setIsDialogOpen(true);
                  }}
                >
                              <Edit className="h-4 w-4" />
                </Button>
                {lead.status !== "convertido" && (
                  <Button
                    size="sm"
                                variant="ghost"
                    onClick={() => convertToClient(lead)}
                  >
                                <UserPlus className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                              variant="ghost"
                  onClick={() => deleteMutation.mutate(lead.id)}
                >
                              <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
              </div>
            </Card>
      )}
    </div>
  );
}
