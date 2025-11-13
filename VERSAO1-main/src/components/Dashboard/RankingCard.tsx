import { Card } from "@/components/ui/card";

interface RankingItem {
  nome: string;
  valor: number;
  percentual: number;
}

interface RankingCardProps {
  title: string;
  items: RankingItem[];
  isEntrada?: boolean;
}

export function RankingCard({ title, items, isEntrada = true }: RankingCardProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{item.nome}</span>
              <span className={isEntrada ? "text-green-600" : "text-red-600"}>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(item.valor)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${
                    isEntrada ? "bg-green-500" : "bg-red-500"
                  }`}
                  style={{ width: `${item.percentual}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground min-w-[3rem] text-right">
                {item.percentual.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
