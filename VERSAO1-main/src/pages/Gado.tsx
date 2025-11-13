import { Beef } from "lucide-react";

export default function Gado() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Beef className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Gestão de Gado</h1>
      </div>
      <p className="text-muted-foreground">Módulo em desenvolvimento...</p>
    </div>
  );
}
