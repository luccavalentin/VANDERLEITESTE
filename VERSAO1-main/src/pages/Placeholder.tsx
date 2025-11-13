import { Card } from "@/components/ui/card";
import { Construction } from "lucide-react";

interface PlaceholderProps {
  pageName: string;
}

const pageNames: Record<string, string> = {
  "leads": "Gestão de Leads",
  "processos": "Gestão de Processos",
  "orcamentos-recibos": "Orçamentos e Recibos",
  "gestao-imoveis": "Gestão de Imóveis",
  "entrada-caixa": "Entrada de Caixa",
  "saida-caixa": "Saída de Caixa",
  "dashboard-caixa": "Dashboard de Caixa",
  "gado": "Gestão de Gado",
  "transportadora": "Gestão da Transportadora",
  "financiamentos": "Financiamentos e Empréstimos",
  "investimentos": "Investimentos",
  "relatorios": "Relatórios",
  "anotacoes": "Bloco de Anotações",
};

export default function Placeholder({ pageName }: PlaceholderProps) {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">{pageNames[pageName] || "Página"}</h1>
        <p className="text-muted-foreground">Esta funcionalidade está em desenvolvimento</p>
      </div>
      
      <Card className="p-12 text-center">
        <Construction className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Em Desenvolvimento</h2>
        <p className="text-muted-foreground">
          Esta funcionalidade será implementada em breve.
        </p>
      </Card>
    </div>
  );
}
