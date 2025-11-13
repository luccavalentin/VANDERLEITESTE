/**
 * Utilitário para testar a conexão com o Supabase
 * Use este arquivo para verificar se a conexão está funcionando corretamente
 */

import { supabase } from "@/integrations/supabase/client";

export async function testarConexaoSupabase() {
  console.log("🔍 Testando conexão com Supabase...");

  try {
    // Teste 1: Verificar se consegue conectar
    console.log("1️⃣ Testando conexão básica...");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: healthCheck, error: healthError } = await supabase
      .from("tarefas")
      .select("count")
      .limit(1);

    if (healthError) {
      console.error("❌ Erro na conexão:", healthError.message);
      return {
        sucesso: false,
        erro: healthError.message,
        detalhes: healthError,
      };
    }

    console.log("✅ Conexão básica OK");

    // Teste 2: Verificar se as tabelas existem
    console.log("2️⃣ Verificando tabelas...");
    const tabelasEsperadas = [
      "tarefas",
      "clientes",
      "leads",
      "processos",
      "orcamentos_recibos",
      "imoveis",
      "contratos_locacao",
      "transacoes",
      "gado",
      "caminhoes",
      "motoristas",
      "fretes",
      "financiamentos",
      "investimentos",
      "anotacoes",
      "followups",
    ];

    const tabelasEncontradas: string[] = [];
    const tabelasFaltando: string[] = [];

    for (const tabela of tabelasEsperadas) {
      try {
        const { error } = await (supabase.from as any)(tabela).select("count").limit(1);
        if (!error) {
          tabelasEncontradas.push(tabela);
          console.log(`  ✅ ${tabela}`);
        } else {
          tabelasFaltando.push(tabela);
          console.log(`  ❌ ${tabela} - ${error.message}`);
        }
      } catch (err: any) {
        tabelasFaltando.push(tabela);
        console.log(`  ❌ ${tabela} - ${err.message}`);
      }
    }

    // Teste 3: Verificar RLS (Row Level Security)
    console.log("3️⃣ Verificando políticas RLS...");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: rlsTest, error: rlsError } = await supabase
      .from("tarefas")
      .select("*")
      .limit(1);

    if (rlsError && rlsError.message.includes("row-level security")) {
      console.warn("⚠️ RLS pode estar bloqueando operações:", rlsError.message);
    } else {
      console.log("✅ RLS configurado corretamente");
    }

    // Resumo
    console.log("\n📊 RESUMO DO TESTE:");
    console.log(`✅ Tabelas encontradas: ${tabelasEncontradas.length}/${tabelasEsperadas.length}`);
    if (tabelasFaltando.length > 0) {
      console.log(`❌ Tabelas faltando: ${tabelasFaltando.join(", ")}`);
    }

    return {
      sucesso: tabelasFaltando.length === 0,
      tabelasEncontradas,
      tabelasFaltando,
      totalEsperado: tabelasEsperadas.length,
      totalEncontrado: tabelasEncontradas.length,
    };
  } catch (error: any) {
    console.error("❌ Erro inesperado:", error);
    return {
      sucesso: false,
      erro: error.message || "Erro desconhecido",
      detalhes: error,
    };
  }
}

// Para usar no console do navegador:
// 1. Abra o console (F12)
// 2. Importe e execute:
//    import { testarConexaoSupabase } from './utils/testarConexaoSupabase';
//    testarConexaoSupabase();


