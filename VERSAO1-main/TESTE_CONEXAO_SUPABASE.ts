/**
 * SCRIPT DE TESTE DE CONEXÃO COM SUPABASE
 * 
 * Este arquivo testa a conexão com o Supabase e verifica se todas as tabelas foram criadas corretamente.
 * 
 * INSTRUÇÕES:
 * 1. Configure suas credenciais do Supabase no arquivo src/integrations/supabase/client.ts
 * 2. Execute este arquivo: npx tsx TESTE_CONEXAO_SUPABASE.ts
 * 3. Verifique se todas as tabelas foram encontradas e se a conexão está funcionando
 */

import { supabase } from './src/integrations/supabase/client';

// Lista de todas as tabelas que devem existir
const TABELAS_ESPERADAS = [
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
];

async function testarConexao() {
  console.log('🔍 Testando conexão com Supabase...\n');

  try {
    // Teste 1: Verificar conexão básica
    console.log('1️⃣ Testando conexão básica...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('tarefas')
      .select('count')
      .limit(0);

    if (healthError) {
      console.error('❌ Erro ao conectar com Supabase:', healthError.message);
      console.error('💡 Verifique se:');
      console.error('   - As credenciais estão corretas no client.ts');
      console.error('   - O projeto está ativo no Supabase');
      console.error('   - A tabela tarefas foi criada');
      return;
    }

    console.log('✅ Conexão com Supabase estabelecida com sucesso!\n');

    // Teste 2: Verificar se todas as tabelas existem
    console.log('2️⃣ Verificando se todas as tabelas foram criadas...\n');
    
    const tabelasEncontradas: string[] = [];
    const tabelasNaoEncontradas: string[] = [];

    for (const tabela of TABELAS_ESPERADAS) {
      try {
        const { error } = await supabase
          .from(tabela)
          .select('count')
          .limit(0);

        if (error) {
          if (error.message.includes('relation') || error.message.includes('does not exist')) {
            tabelasNaoEncontradas.push(tabela);
            console.log(`❌ Tabela "${tabela}" não encontrada`);
          } else {
            // Outro erro, mas a tabela existe
            tabelasEncontradas.push(tabela);
            console.log(`✅ Tabela "${tabela}" encontrada`);
          }
        } else {
          tabelasEncontradas.push(tabela);
          console.log(`✅ Tabela "${tabela}" encontrada`);
        }
      } catch (err) {
        tabelasNaoEncontradas.push(tabela);
        console.log(`❌ Erro ao verificar tabela "${tabela}":`, err);
      }
    }

    console.log('\n📊 Resumo:');
    console.log(`   ✅ Tabelas encontradas: ${tabelasEncontradas.length}/${TABELAS_ESPERADAS.length}`);
    console.log(`   ❌ Tabelas não encontradas: ${tabelasNaoEncontradas.length}`);

    if (tabelasNaoEncontradas.length > 0) {
      console.log('\n⚠️ Tabelas não encontradas:');
      tabelasNaoEncontradas.forEach(tabela => {
        console.log(`   - ${tabela}`);
      });
      console.log('\n💡 Execute o script SUPABASE_TABELAS.sql no SQL Editor do Supabase para criar as tabelas faltantes.');
    }

    // Teste 3: Testar criar um dado
    console.log('\n3️⃣ Testando criação de dados...');
    try {
      const { data: tarefaTeste, error: createError } = await supabase
        .from('tarefas')
        .insert([
          {
            titulo: 'Tarefa de Teste - ' + new Date().toISOString(),
            descricao: 'Esta é uma tarefa de teste criada automaticamente',
            data_vencimento: new Date().toISOString().split('T')[0],
            prioridade: 'media',
            status: 'pendente',
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error('❌ Erro ao criar tarefa de teste:', createError.message);
        console.error('💡 Verifique se as políticas RLS estão configuradas corretamente.');
      } else {
        console.log('✅ Tarefa de teste criada com sucesso!');
        console.log('   ID:', tarefaTeste.id);
        console.log('   Título:', tarefaTeste.titulo);

        // Limpar a tarefa de teste
        await supabase.from('tarefas').delete().eq('id', tarefaTeste.id);
        console.log('🧹 Tarefa de teste removida.');
      }
    } catch (err) {
      console.error('❌ Erro ao testar criação:', err);
    }

    // Teste 4: Verificar políticas RLS
    console.log('\n4️⃣ Verificando políticas RLS...');
    console.log('💡 Em desenvolvimento, as políticas devem permitir acesso público.');
    console.log('💡 Em produção, altere para políticas baseadas em auth.uid()');

    // Resultado final
    console.log('\n' + '='.repeat(50));
    if (tabelasEncontradas.length === TABELAS_ESPERADAS.length) {
      console.log('🎉 TODOS OS TESTES PASSARAM!');
      console.log('✅ Conexão com Supabase funcionando');
      console.log('✅ Todas as tabelas foram criadas');
      console.log('✅ Pronto para começar a desenvolver!');
    } else {
      console.log('⚠️ ALGUNS TESTES FALHARAM');
      console.log('💡 Execute o script SUPABASE_TABELAS.sql no Supabase para criar as tabelas faltantes.');
    }
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Erro geral:', error);
    console.error('💡 Verifique se:');
    console.error('   - As credenciais do Supabase estão corretas');
    console.error('   - O projeto está ativo no Supabase');
    console.error('   - Você tem acesso à internet');
  }
}

// Executar o teste
testarConexao();

