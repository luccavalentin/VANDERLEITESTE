import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Configuração do Supabase
// Configure as variáveis de ambiente no arquivo .env.local
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Validação das variáveis
const usandoVariaveisAmbiente = !!(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

if (!usandoVariaveisAmbiente) {
  if (import.meta.env.DEV) {
    console.warn(
      "⚠️ Supabase não configurado.",
      "Para conectar ao banco de dados, crie um arquivo .env.local com:",
      "\n  VITE_SUPABASE_URL=sua_url_aqui",
      "\n  VITE_SUPABASE_ANON_KEY=sua_chave_aqui",
      "\n\nVeja GUIA_CONEXAO_SUPABASE.md para mais detalhes."
    );
  }
  
  if (import.meta.env.PROD) {
    console.error(
      "❌ ERRO: Variáveis de ambiente do Supabase não configuradas!",
      "Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.local"
    );
  }
}

// Criar cliente apenas se as credenciais estiverem configuradas
// Caso contrário, retornar um cliente vazio que falhará nas requisições
export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient<Database>(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        auth: {
          storage: typeof window !== "undefined" ? window.localStorage : undefined,
          persistSession: true,
          autoRefreshToken: true,
        },
      }
    )
  : createClient<Database>(
      "https://placeholder.supabase.co",
      "placeholder-key",
      {
        auth: {
          storage: typeof window !== "undefined" ? window.localStorage : undefined,
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
