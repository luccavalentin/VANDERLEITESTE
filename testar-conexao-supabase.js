// Script de teste rápido de conexão com Supabase
// Execute: node testar-conexao-supabase.js

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
config({ path: resolve(__dirname, '.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testando conexão com Supabase...\n');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ ERRO: Variáveis de ambiente não configuradas!');
  console.error('Verifique se o arquivo .env.local existe e contém:');
  console.error('  VITE_SUPABASE_URL=...');
  console.error('  VITE_SUPABASE_ANON_KEY=...');
  process.exit(1);
}

console.log('✅ Variáveis de ambiente carregadas');
console.log(`   URL: ${SUPABASE_URL}`);
console.log(`   Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...\n`);

// Criar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Testar conexão com uma query simples
async function testarConexao() {
  try {
    console.log('🔄 Testando conexão com o banco de dados...\n');
    
    // Lista de tabelas para testar
    const tabelas = [
      'tarefas',
      'clientes',
      'leads',
      'processos',
      'orcamentos_recibos',
      'imoveis',
      'transacoes',
      'gado',
      'caminhoes',
      'motoristas',
      'fretes',
      'financiamentos',
      'investimentos',
      'anotacoes',
      'followups',
      'contratos_locacao'
    ];

    let sucesso = 0;
    let falhas = 0;

    for (const tabela of tabelas) {
      try {
        const { data, error } = await supabase
          .from(tabela)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ ${tabela}: ${error.message}`);
          falhas++;
        } else {
          console.log(`✅ ${tabela}: OK`);
          sucesso++;
        }
      } catch (err) {
        console.log(`❌ ${tabela}: ${err.message}`);
        falhas++;
      }
    }

    console.log('\n📊 Resumo:');
    console.log(`   ✅ Sucesso: ${sucesso}/${tabelas.length}`);
    console.log(`   ❌ Falhas: ${falhas}/${tabelas.length}`);

    if (sucesso === tabelas.length) {
      console.log('\n🎉 Todas as tabelas estão acessíveis!');
      console.log('✅ Conexão com Supabase estabelecida com sucesso!');
    } else if (sucesso > 0) {
      console.log('\n⚠️ Algumas tabelas não estão acessíveis.');
      console.log('Verifique se todas as tabelas foram criadas no Supabase.');
    } else {
      console.log('\n❌ Nenhuma tabela está acessível.');
      console.log('Verifique se as credenciais estão corretas.');
    }

  } catch (error) {
    console.error('\n❌ ERRO ao testar conexão:');
    console.error(error.message);
    process.exit(1);
  }
}

testarConexao();

