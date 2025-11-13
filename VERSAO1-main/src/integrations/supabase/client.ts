import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Usar variáveis de ambiente para produção
// Em desenvolvimento, use arquivo .env.local
// Em produção, configure nas variáveis de ambiente da plataforma (Vercel, Netlify, etc.)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://susggaswgutjyyolauoe.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1c2dnYXN3Z3V0anl5b2xhdW9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MTgwNjUsImV4cCI6MjA3ODQ5NDA2NX0.VYZm-0hKnFJ1Om7fTWuvJtULVQS7fYuWq19QWmI-acY";

// Validação das variáveis (apenas em produção)
if (import.meta.env.PROD && (!SUPABASE_URL || !SUPABASE_ANON_KEY)) {
  console.error(
    '⚠️ Variáveis de ambiente do Supabase não configuradas!',
    'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY'
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});
