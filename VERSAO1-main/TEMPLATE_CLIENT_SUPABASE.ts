/**
 * TEMPLATE DO CLIENTE SUPABASE
 *
 * INSTRUÇÕES:
 * 1. Copie este arquivo para: src/integrations/supabase/client.ts
 * 2. Substitua SUA_PROJECT_URL_AQUI pela sua Project URL do Supabase
 * 3. Substitua SUA_ANON_KEY_AQUI pela sua anon public key do Supabase
 * 4. Salve o arquivo
 *
 * ONDE ENCONTRAR AS CREDENCIAIS:
 * 1. Acesse https://supabase.com
 * 2. Selecione seu projeto
 * 3. Vá em Project Settings > API
 * 4. Copie a Project URL e a anon public key
 */

import { createClient } from "@supabase/supabase-js";
// import type { Database } from './types'; // Descomente após gerar os tipos

// ⚠️ SUBSTITUA AQUI PELAS SUAS CREDENCIAIS DO SUPABASE
const SUPABASE_URL = "SUA_PROJECT_URL_AQUI";
const SUPABASE_ANON_KEY = "SUA_ANON_KEY_AQUI";

// Exemplo:
// const SUPABASE_URL = "https://abcdefghijklmnop.supabase.co";
// const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYyOTI5MjkyNSwiZXhwIjoxOTQ0ODQ5MjI1fQ.abcdefghijklmnopqrstuvwxyz1234567890";

// Criar o cliente Supabase
// Se você já gerou os tipos, descomente a linha abaixo e use: createClient<Database>
// export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Como usar:
// import { supabase } from '@/integrations/supabase/client';
//
// // Buscar dados
// const { data, error } = await supabase
//   .from('tarefas')
//   .select('*');
//
// // Criar dados
// const { data, error } = await supabase
//   .from('tarefas')
//   .insert([{ titulo: 'Nova tarefa', ... }]);
//
// // Atualizar dados
// const { data, error } = await supabase
//   .from('tarefas')
//   .update({ titulo: 'Tarefa atualizada' })
//   .eq('id', 'uuid-aqui');
//
// // Deletar dados
// const { data, error } = await supabase
//   .from('tarefas')
//   .delete()
//   .eq('id', 'uuid-aqui');
