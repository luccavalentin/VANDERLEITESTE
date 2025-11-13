import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, Plus, Search, Edit, Trash2, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Lead {
  id: string;
  nome: string;
  contato: string;
  origem: string;
  status: string;
  observacoes: string | null;
  created_at: string;
}

export default function Leads() {
  const { toast } = useToast();
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
      toast({ title: "Lead criado com sucesso!" });
      setIsDialogOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase.from("leads").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Lead atualizado com sucesso!" });
      setIsDialogOpen(false);
      setEditingLead(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Lead excluído com sucesso!" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const data = {
      nome: formData.get("nome") as string,
      contato: formData.get("contato") as string,
      origem: formData.get("origem") as string,
      status: formData.get("status") as string,
      observacoes: formData.get("observacoes") as string || null,
    };

    if (editingLead) {
      updateMutation.mutate({ id: editingLead.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const convertToClient = async (lead: Lead) => {
    try {
      await supabase.from("clientes").insert({
        nome: lead.nome,
        tipo: "pf",
        telefone: lead.contato.includes("@") ? "" : lead.contato,
        email: lead.contato.includes("@") ? lead.contato : "",
        status: "ativo",
        cep: "",
        endereco: "",
        cidade: "",
        estado: "",
      });
      
      await supabase.from("leads").update({ status: "convertido" }).eq("id", lead.id);
      
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Lead convertido em cliente!" });
    } catch (error) {
      toast({ title: "Erro ao converter lead", variant: "destructive" });
    }
  };

  const filteredLeads = leads.filter((lead) =>
    lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.contato.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.origem.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors = {
    novo: "bg-blue-500",
    contatado: "bg-yellow-500",
    interessado: "bg-green-500",
    convertido: "bg-purple-500",
    perdido: "bg-red-500",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Leads</p>
              <p className="text-2xl font-bold">{leads.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/10">
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
        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
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

      {/* Busca e Ações */}
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
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  name="nome"
                  defaultValue={editingLead?.nome}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contato">Telefone ou E-mail *</Label>
                <Input
                  id="contato"
                  name="contato"
                  defaultValue={editingLead?.contato}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="origem">Origem *</Label>
                <Select name="origem" defaultValue={editingLead?.origem} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="indicacao">Indicação</SelectItem>
                    <SelectItem value="site">Site</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select name="status" defaultValue={editingLead?.status || "novo"} required>
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

      {/* Lista de Leads */}
      {isLoading ? (
        <p className="text-center text-muted-foreground">Carregando...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => (
            <Card key={lead.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{lead.nome}</h3>
                  <p className="text-sm text-muted-foreground">{lead.contato}</p>
                </div>
                <Badge className={statusColors[lead.status as keyof typeof statusColors]}>
                  {lead.status}
                </Badge>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">
                  Origem: <span className="text-foreground">{lead.origem}</span>
                </p>
                {lead.observacoes && (
                  <p className="text-muted-foreground mt-2">
                    {lead.observacoes.substring(0, 100)}...
                  </p>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingLead(lead);
                    setIsDialogOpen(true);
                  }}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                {lead.status !== "convertido" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => convertToClient(lead)}
                    className="flex-1"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Converter
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(lead.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
