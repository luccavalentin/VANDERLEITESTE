import { TrendingUp } from "lucide-react";

export default function EntradaCaixa() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <TrendingUp className="h-8 w-8 text-green-500" />
        <h1 className="text-3xl font-bold">Entrada de Caixa</h1>
      </div>
      <p className="text-muted-foreground">Módulo em desenvolvimento...</p>
    </div>
  );
}
