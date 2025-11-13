import { CreditCard } from "lucide-react";

export default function Financiamentos() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <CreditCard className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Financiamentos e Empréstimos</h1>
      </div>
      <p className="text-muted-foreground">Módulo em desenvolvimento...</p>
    </div>
  );
}
