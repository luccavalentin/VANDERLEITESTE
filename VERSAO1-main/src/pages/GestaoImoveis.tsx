import { Home } from "lucide-react";

export default function GestaoImoveis() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Home className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Gestão de Imóveis</h1>
      </div>
      <p className="text-muted-foreground">Módulo em desenvolvimento...</p>
    </div>
  );
}
