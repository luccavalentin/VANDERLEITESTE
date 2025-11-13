import { Card } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";

interface FluxoChartProps {
  data: Array<{
    mes: string;
    entradas: number;
    saidas: number;
    saldo: number;
  }>;
}

export function FluxoChart({ data }: FluxoChartProps) {
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Evolução do Fluxo de Caixa</h3>
        <p className="text-sm text-muted-foreground">
          Entradas, saídas e saldo ao longo do tempo
        </p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" />
          <YAxis stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="entradas"
            stroke="hsl(142 76% 36%)"
            name="Entradas"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="saidas"
            stroke="hsl(0 84% 60%)"
            name="Saídas"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="saldo"
            stroke="hsl(var(--primary))"
            name="Saldo"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
