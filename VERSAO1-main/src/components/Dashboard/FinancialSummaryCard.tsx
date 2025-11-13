import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinancialSummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
  iconColor?: string;
}

export function FinancialSummaryCard({
  title,
  value,
  icon: Icon,
  trend,
  onClick,
  iconColor = "text-primary",
}: FinancialSummaryCardProps) {
  return (
    <Card
      className={cn(
        "p-6 transition-all duration-200 hover:shadow-lg",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className={cn("p-3 rounded-lg bg-primary/10", iconColor)}>
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold">{value}</h3>
            {trend && (
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-green-500" : "text-red-500"
                )}
              >
                {trend.isPositive ? "+" : ""}{trend.value}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
