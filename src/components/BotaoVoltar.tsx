import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BotaoVoltarProps {
  onClick?: () => void;
  destino?: string;
  className?: string;
}

export function BotaoVoltar({ onClick, destino, className = "" }: BotaoVoltarProps) {
  const handleVoltar = () => {
    if (onClick) {
      onClick();
    } else if (destino) {
      const event = new CustomEvent('navigate', { detail: destino });
      window.dispatchEvent(event);
    } else {
      // Voltar para dashboard por padrão
      const event = new CustomEvent('navigate', { detail: 'dashboard' });
      window.dispatchEvent(event);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleVoltar}
      className={`gap-2 hover:bg-accent hover:scale-105 active:scale-95 transition-all duration-200 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      Voltar
    </Button>
  );
}

