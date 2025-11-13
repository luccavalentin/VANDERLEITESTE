import { TrendingDown } from "lucide-react";

export default function SaidaCaixa() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <TrendingDown className="h-8 w-8 text-red-500" />
        <h1 className="text-3xl font-bold">Saída de Caixa</h1>
      </div>
      <p className="text-muted-foreground">Módulo em desenvolvimento...</p>
    </div>
  );
}
