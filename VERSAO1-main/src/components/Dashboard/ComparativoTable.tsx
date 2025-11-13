import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ComparativoData {
  mes: string;
  entradas: number;
  saidas: number;
  saldo: number;
  variacao: number;
}

interface ComparativoTableProps {
  data: ComparativoData[];
}

export function ComparativoTable({ data }: ComparativoTableProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Comparativo Periódico</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mês</TableHead>
              <TableHead className="text-right">Entradas</TableHead>
              <TableHead className="text-right">Saídas</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
              <TableHead className="text-right">Variação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{row.mes}</TableCell>
                <TableCell className="text-right text-green-600">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(row.entradas)}
                </TableCell>
                <TableCell className="text-right text-red-600">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(row.saidas)}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(row.saldo)}
                </TableCell>
                <TableCell
                  className={`text-right font-medium ${
                    row.variacao >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {row.variacao >= 0 ? "+" : ""}
                  {row.variacao.toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
