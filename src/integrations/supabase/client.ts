import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Configuração do Supabase
// Prioridade: Variáveis de ambiente > Credenciais de produção (fallback)
const SUPABASE_URL = 
  import.meta.env.VITE_SUPABASE_URL || 
  "https://tahanrdxbzaenpxcrsry.supabase.co";

const SUPABASE_ANON_KEY = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFhcmR4YnphZW5weGNyc3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5OTQ4OTcsImV4cCI6MjA3ODU3MDg5N30.VccKkjMG7YoDsmX6gQCicG2Tmlgkn3ieLn4McAG6fCI";

// Validação das variáveis
const usandoVariaveisAmbiente = !!(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

if (!usandoVariaveisAmbiente) {
  if (import.meta.env.DEV) {
    console.warn(
      "⚠️ Supabase: Usando credenciais de produção como fallback.",
      "Para usar credenciais diferentes, crie um arquivo .env.local com:",
      "\n  VITE_SUPABASE_URL=sua_url_aqui",
      "\n  VITE_SUPABASE_ANON_KEY=sua_chave_aqui"
    );
  }
  
  if (import.meta.env.PROD) {
    console.info(
      "ℹ️ Supabase: Usando credenciais de produção configuradas no código.",
      "Para usar variáveis de ambiente, configure no Vercel:",
      "\n  VITE_SUPABASE_URL",
      "\n  VITE_SUPABASE_ANON_KEY"
    );
  }
}

// Criar cliente Supabase
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
