/**
 * Script rápido para testar a conexão com o Supabase
 * Execute: node testar-conexao.js
 */

import { createClient } from '@supabase/supabase-js';

// ⚠️ Configure suas credenciais do Supabase aqui ou use variáveis de ambiente
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sua_chave_anonima_aqui';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testarConexao() {
  console.log('🔍 Testando conexão com Supabase...\n');
  console.log(`URL: ${SUPABASE_URL}\n`);

  const tabelas = [
    'tarefas',
    'clientes',
    'leads',
    'processos',
    'orcamentos_recibos',
    'imoveis',
    'contratos_locacao',
    'transacoes',
    'gado',
    'caminhoes',
    'motoristas',
    'fretes',
    'financiamentos',
    'investimentos',
    'anotacoes',
    'followups',
  ];

  console.log('📊 Verificando tabelas...\n');

  let sucesso = 0;
  let falhas = 0;

  for (const tabela of tabelas) {
    try {
      const { data, error } = await supabase
        .from(tabela)
        .select('count')
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

  console.log(`\n📈 Resultado:`);
  console.log(`✅ Tabelas acessíveis: ${sucesso}/${tabelas.length}`);
  console.log(`❌ Tabelas com erro: ${falhas}/${tabelas.length}`);

  if (falhas === 0) {
    console.log('\n🎉 Conexão estabelecida com sucesso!');
    console.log('✅ Todas as tabelas estão acessíveis!');
  } else {
    console.log('\n⚠️ Algumas tabelas não estão acessíveis.');
    console.log('Verifique se todas as tabelas foram criadas no Supabase.');
  }
}

testarConexao().catch(console.error);

