import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Database,
  AlertCircle,
} from "lucide-react";
import { BotaoVoltar } from "@/components/BotaoVoltar";

interface ResultadoTeste {
  tabela: string;
  status: "sucesso" | "erro";
  mensagem: string;
}

export default function TesteConexao() {
  const [testando, setTestando] = useState(false);
  const [resultados, setResultados] = useState<ResultadoTeste[]>([]);
  const [resumo, setResumo] = useState<{
    total: number;
    sucesso: number;
    falhas: number;
  } | null>(null);

  const tabelas = [
    "tarefas",
    "clientes",
    "leads",
    "processos",
    "orcamentos_recibos",
    "imoveis",
    "transacoes",
    "gado",
    "caminhoes",
    "motoristas",
    "fretes",
    "financiamentos",
    "investimentos",
    "anotacoes",
  ] as const;

  const testarConexao = async () => {
    setTestando(true);
    setResultados([]);
    setResumo(null);

    const resultadosTeste: ResultadoTeste[] = [];
    let sucesso = 0;
    let falhas = 0;

    // Teste 1: Verificar URL e chave
    const url = import.meta.env.VITE_SUPABASE_URL || "Não configurado";
    const temChave = !!import.meta.env.VITE_SUPABASE_ANON_KEY;

    console.log("🔍 Iniciando testes de conexão...");
    console.log("URL:", url);
    console.log("Chave configurada:", temChave);

    // Teste cada tabela
    for (const tabela of tabelas) {
      try {
        const { error } = await supabase.from(tabela).select("*").limit(1);

        if (error) {
          resultadosTeste.push({
            tabela,
            status: "erro",
            mensagem: error.message,
          });
          falhas++;
          console.error(`❌ ${tabela}:`, error.message);
        } else {
          resultadosTeste.push({
            tabela,
            status: "sucesso",
            mensagem: "Tabela acessível",
          });
          sucesso++;
          console.log(`✅ ${tabela}: OK`);
        }
      } catch (err: any) {
        resultadosTeste.push({
          tabela,
          status: "erro",
          mensagem: err.message || "Erro desconhecido",
        });
        falhas++;
        console.error(`❌ ${tabela}:`, err.message);
      }
    }

    setResultados(resultadosTeste);
    setResumo({
      total: tabelas.length,
      sucesso,
      falhas,
    });
    setTestando(false);

    // Log do resumo
    console.log("\n📊 RESUMO DO TESTE:");
    console.log(`✅ Tabelas acessíveis: ${sucesso}/${tabelas.length}`);
    console.log(`❌ Tabelas com erro: ${falhas}/${tabelas.length}`);
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BotaoVoltar />
          <div>
            <h1 className="text-3xl font-bold">
              Teste de Conexão com Supabase
            </h1>
            <p className="text-muted-foreground">
              Verifique se o banco de dados está conectado corretamente
            </p>
          </div>
        </div>
        <Button onClick={testarConexao} disabled={testando}>
          {testando ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testando...
            </>
          ) : (
            <>
              <Database className="h-4 w-4 mr-2" />
              Executar Testes
            </>
          )}
        </Button>
      </div>

      {/* Informações da Conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Informações da Conexão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              URL do Supabase:
            </span>
            <code className="text-sm bg-muted px-2 py-1 rounded">
              {import.meta.env.VITE_SUPABASE_URL || "Não configurado"}
            </code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Chave API:</span>
            <Badge
              variant={
                import.meta.env.VITE_SUPABASE_ANON_KEY
                  ? "default"
                  : "destructive"
              }
            >
              {import.meta.env.VITE_SUPABASE_ANON_KEY
                ? "Configurada"
                : "Não configurada"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Resumo dos Resultados */}
      {resumo && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo dos Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold">{resumo.total}</div>
                <div className="text-sm text-muted-foreground">
                  Total de Tabelas
                </div>
              </div>
              <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="text-3xl font-bold text-green-500">
                  {resumo.sucesso}
                </div>
                <div className="text-sm text-muted-foreground">Tabelas OK</div>
              </div>
              <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="text-3xl font-bold text-red-500">
                  {resumo.falhas}
                </div>
                <div className="text-sm text-muted-foreground">Com Erro</div>
              </div>
            </div>
            {resumo.falhas === 0 && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-green-500 font-semibold">
                  🎉 Todas as tabelas estão acessíveis! Conexão funcionando
                  perfeitamente!
                </span>
              </div>
            )}
            {resumo.falhas > 0 && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-500 font-semibold">
                  ⚠️ Algumas tabelas não estão acessíveis. Verifique os detalhes
                  abaixo.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resultados Detalhados */}
      {resultados.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados Detalhados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tabela</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Mensagem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resultados.map((resultado) => (
                  <TableRow key={resultado.tabela}>
                    <TableCell className="font-medium">
                      {resultado.tabela}
                    </TableCell>
                    <TableCell>
                      {resultado.status === "sucesso" ? (
                        <Badge className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          OK
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Erro
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {resultado.mensagem}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Instruções */}
      {resultados.length === 0 && !testando && (
        <Card>
          <CardHeader>
            <CardTitle>Como Usar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Clique no botão "Executar Testes" acima</p>
            <p>2. Aguarde alguns segundos enquanto os testes são executados</p>
            <p>3. Verifique os resultados para cada tabela</p>
            <p>
              4. Se todas as tabelas estiverem OK, sua conexão está funcionando!
            </p>
            <p className="mt-4 text-xs">
              💡 <strong>Dica:</strong> Abra o Console do navegador (F12) para
              ver logs detalhados
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
