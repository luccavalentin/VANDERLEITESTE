import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Scale, Search, Edit, Trash2, FileText } from "lucide-react";
import { formatarStatus } from "@/lib/processos-data";

interface ProcessosFilteredProps {
  filterStatus?: string;
  title: string;
  onBack: () => void;
}

export default function ProcessosFiltered({ filterStatus, title, onBack }: ProcessosFilteredProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: processos = [], isLoading } = useQuery({
    queryKey: ["processos", filterStatus],
    queryFn: async () => {
      let query = supabase
        .from("processos")
        .select("*, clientes(nome)")
        .order("created_at", { ascending: false });
      
      if (filterStatus) {
        query = query.eq("status", filterStatus);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filteredProcessos = processos.filter((p: any) =>
    p.numero_processo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.clientes?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          ← Voltar
        </Button>
        <div className="flex items-center gap-4">
          <Scale className="h-8 w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
        </div>
      </div>

      <Card className="p-4 md:p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Scale className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{processos.length}</p>
          </div>
        </div>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar processos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground">Carregando...</p>
      ) : filteredProcessos.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nenhum processo encontrado</p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 md:p-4">Nº Processo</th>
                <th className="text-left p-3 md:p-4 hidden md:table-cell">Cliente</th>
                <th className="text-left p-3 md:p-4 hidden sm:table-cell">Tipo</th>
                <th className="text-left p-3 md:p-4">Status</th>
                <th className="text-left p-3 md:p-4 hidden lg:table-cell">Data Inicial</th>
                <th className="text-left p-3 md:p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProcessos.map((processo: any) => (
                <tr key={processo.id} className="border-b hover:bg-muted/50">
                  <td className="p-3 md:p-4 font-medium">{processo.numero_processo}</td>
                  <td className="p-3 md:p-4 hidden md:table-cell">{processo.clientes?.nome || "Sem cliente"}</td>
                  <td className="p-3 md:p-4 hidden sm:table-cell">{processo.tipo}</td>
                  <td className="p-3 md:p-4">{formatarStatus(processo.status)}</td>
                  <td className="p-3 md:p-4 hidden lg:table-cell">
                    {new Date(processo.data_inicial).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="p-3 md:p-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="hidden sm:flex">
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
