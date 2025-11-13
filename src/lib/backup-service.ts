import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { enviarBackupPorEmail } from './email-backup-service';

// Tipos das tabelas do sistema
type TabelaNome = 
  | 'anotacoes'
  | 'caminhoes'
  | 'clientes'
  | 'financiamentos'
  | 'fretes'
  | 'gado'
  | 'imoveis'
  | 'investimentos'
  | 'leads'
  | 'motoristas'
  | 'orcamentos_recibos'
  | 'processos'
  | 'tarefas'
  | 'transacoes';

// Configuração de nomes das tabelas para exibição
const nomeTabelas: Record<TabelaNome, string> = {
  anotacoes: 'Anotações',
  caminhoes: 'Caminhões',
  clientes: 'Clientes',
  financiamentos: 'Financiamentos',
  fretes: 'Fretes',
  gado: 'Gado',
  imoveis: 'Imóveis',
  investimentos: 'Investimentos',
  leads: 'Leads',
  motoristas: 'Motoristas',
  orcamentos_recibos: 'Orçamentos e Recibos',
  processos: 'Processos',
  tarefas: 'Tarefas',
  transacoes: 'Transações',
};

// Configuração do bucket de storage
const BACKUP_BUCKET = 'backups-sistema';
const BACKUP_FILENAME = 'BACKUP_SISTEMA_VANDERLEI.xlsx';

// Chave para armazenar data do último backup
const LAST_BACKUP_KEY = 'last_backup_date';
const BACKUP_INTERVAL_DAYS = 1; // 1 dia (24 horas)

/**
 * Busca todos os dados de uma tabela
 */
async function buscarDadosTabela(nomeTabela: TabelaNome): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from(nomeTabela)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Erro ao buscar dados da tabela ${nomeTabela}:`, error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error(`Erro ao buscar dados da tabela ${nomeTabela}:`, error);
    return [];
  }
}

/**
 * Formata dados para Excel, convertendo objetos JSON e datas
 */
function formatarDadosParaExcel(dados: any[]): any[] {
  return dados.map(item => {
    const itemFormatado: any = {};
    
    Object.keys(item).forEach(key => {
      const valor = item[key];
      
      // Se for um objeto JSON, converte para string
      if (valor !== null && typeof valor === 'object' && !Array.isArray(valor) && !(valor instanceof Date)) {
        itemFormatado[key] = JSON.stringify(valor);
      }
      // Se for array, converte para string
      else if (Array.isArray(valor)) {
        itemFormatado[key] = JSON.stringify(valor);
      }
      // Se for boolean, converte para texto
      else if (typeof valor === 'boolean') {
        itemFormatado[key] = valor ? 'Sim' : 'Não';
      }
      // Se for data, formata
      else if (valor && typeof valor === 'string' && valor.match(/^\d{4}-\d{2}-\d{2}/)) {
        try {
          const data = new Date(valor);
          itemFormatado[key] = data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        } catch {
          itemFormatado[key] = valor;
        }
      }
      // Caso contrário, mantém o valor original
      else {
        itemFormatado[key] = valor ?? '';
      }
    });
    
    return itemFormatado;
  });
}

/**
 * Garante que o bucket de backups existe no Supabase Storage
 */
async function garantirBucketExiste(): Promise<boolean> {
  try {
    // Verifica se o bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Erro ao listar buckets:', listError);
      return false;
    }
    
    // Verifica se o bucket já existe
    const bucketExiste = buckets?.some(b => b.name === BACKUP_BUCKET);
    
    if (!bucketExiste) {
      // Tenta criar o bucket (pode falhar se não tiver permissões)
      const { error: createError } = await supabase.storage.createBucket(BACKUP_BUCKET, {
        public: false,
        fileSizeLimit: 104857600, // 100MB
        allowedMimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      });
      
      if (createError) {
        console.error('Erro ao criar bucket. Você precisa criar manualmente no Supabase:', createError);
        toast.error('Bucket de backup não encontrado. Crie o bucket "backups-sistema" no Supabase Storage.');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao verificar bucket:', error);
    return false;
  }
}

/**
 * Remove backup antigo do storage (opcional, pois o upsert já substitui)
 */
async function removerBackupAntigo(): Promise<void> {
  try {
    // Tenta remover o arquivo antigo, mas não é crítico se falhar
    // pois o upsert: true já substitui o arquivo
    const { error } = await supabase.storage
      .from(BACKUP_BUCKET)
      .remove([BACKUP_FILENAME]);
    
    // Ignora erros de arquivo não encontrado
    if (error && !error.message.includes('not found') && !error.message.includes('Not found')) {
      console.warn('Aviso ao remover backup antigo:', error);
    }
  } catch (error) {
    // Não é crítico, continua mesmo se falhar
    // O upsert: true já garante que o arquivo será substituído
  }
}

/**
 * Gera arquivo Excel com todos os dados do sistema e faz upload para o Supabase Storage
 */
export async function gerarBackupExcel(): Promise<boolean> {
  try {
    toast.info('Iniciando backup automático do sistema...');
    
    // Garante que o bucket existe
    const bucketOk = await garantirBucketExiste();
    if (!bucketOk) {
      return false;
    }
    
    const workbook = XLSX.utils.book_new();
    
    // Adiciona planilha de informações
    const infoData = [
      ['BACKUP DO SISTEMA VANDERLEI'],
      ['Data/Hora do Backup:', new Date().toLocaleString('pt-BR')],
      [''],
      ['Este arquivo contém todos os dados do sistema.'],
      ['Cada aba representa uma tabela do banco de dados.'],
      ['Backup gerado automaticamente e armazenado online.'],
    ];
    
    const infoSheet = XLSX.utils.aoa_to_sheet(infoData);
    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Informações');
    
    // Busca dados de todas as tabelas
    const tabelas: TabelaNome[] = [
      'anotacoes',
      'caminhoes',
      'clientes',
      'financiamentos',
      'fretes',
      'gado',
      'imoveis',
      'investimentos',
      'leads',
      'motoristas',
      'orcamentos_recibos',
      'processos',
      'tarefas',
      'transacoes',
    ];
    
    let totalRegistros = 0;
    
    for (const tabela of tabelas) {
      const dados = await buscarDadosTabela(tabela);
      
      if (dados.length > 0) {
        const dadosFormatados = formatarDadosParaExcel(dados);
        const worksheet = XLSX.utils.json_to_sheet(dadosFormatados);
        
        // Ajusta largura das colunas
        const colWidths = Object.keys(dadosFormatados[0] || {}).map(key => ({
          wch: Math.max(key.length, 15),
        }));
        worksheet['!cols'] = colWidths;
        
        XLSX.utils.book_append_sheet(workbook, worksheet, nomeTabelas[tabela]);
        totalRegistros += dados.length;
      } else {
        // Cria planilha vazia mesmo sem dados
        const worksheet = XLSX.utils.aoa_to_sheet([['Nenhum registro encontrado']]);
        XLSX.utils.book_append_sheet(workbook, worksheet, nomeTabelas[tabela]);
      }
    }
    
    // Adiciona planilha de resumo
    const resumoData = [
      ['RESUMO DO BACKUP'],
      ['Data/Hora:', new Date().toLocaleString('pt-BR')],
      ['Total de Tabelas:', tabelas.length],
      ['Total de Registros:', totalRegistros],
      [''],
      ['Tabelas Exportadas:'],
      ...tabelas.map(t => [nomeTabelas[t], 'Exportado']),
    ];
    
    const resumoSheet = XLSX.utils.aoa_to_sheet(resumoData);
    XLSX.utils.book_append_sheet(workbook, resumoSheet, 'Resumo');
    
    // Converte para buffer binário
    const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    
    // Remove backup antigo
    await removerBackupAntigo();
    
    // Faz upload para o Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(BACKUP_BUCKET)
      .upload(BACKUP_FILENAME, excelBuffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        upsert: true, // Substitui se já existir
      });
    
    if (uploadError) {
      console.error('Erro ao fazer upload do backup:', uploadError);
      toast.error('Erro ao salvar backup online. Verifique as configurações do Supabase Storage.');
      return false;
    }
    
    // Salva data do último backup
    localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
    
    // Envia backup por email automaticamente
    try {
      // Converte array para ArrayBuffer
      const arrayBuffer = new Uint8Array(excelBuffer).buffer;
      const emailEnviado = await enviarBackupPorEmail(arrayBuffer, BACKUP_FILENAME);
      
      if (emailEnviado) {
        toast.success(`Backup automático realizado e enviado por email! Total: ${totalRegistros} registros.`);
      } else {
        toast.success(`Backup automático realizado com sucesso! Total: ${totalRegistros} registros salvos online. Email não configurado.`);
      }
    } catch (emailError) {
      console.warn('Erro ao enviar email, mas backup foi salvo:', emailError);
      toast.success(`Backup automático realizado com sucesso! Total: ${totalRegistros} registros salvos online.`);
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao gerar backup:', error);
    toast.error('Erro ao gerar backup. Verifique o console para mais detalhes.');
    return false;
  }
}

/**
 * Verifica se é necessário gerar um novo backup (verifica se passaram 24 horas)
 */
export function verificarNecessidadeBackup(): boolean {
  const lastBackupDate = localStorage.getItem(LAST_BACKUP_KEY);
  
  if (!lastBackupDate) {
    return true; // Nunca foi feito backup
  }
  
  const lastBackup = new Date(lastBackupDate);
  const agora = new Date();
  const diferencaHoras = Math.floor((agora.getTime() - lastBackup.getTime()) / (1000 * 60 * 60));
  
  // Verifica se passaram 24 horas (1 dia)
  return diferencaHoras >= 24;
}

/**
 * Retorna a data do último backup
 */
export function getLastBackupDate(): Date | null {
  const lastBackupDate = localStorage.getItem(LAST_BACKUP_KEY);
  if (!lastBackupDate) {
    return null;
  }
  return new Date(lastBackupDate);
}

/**
 * Força a geração de um novo backup (manual)
 */
export async function gerarBackupManual(): Promise<boolean> {
  return await gerarBackupExcel();
}

/**
 * Baixa o backup do Supabase Storage
 */
export async function baixarBackupOnline(): Promise<boolean> {
  try {
    toast.info('Baixando backup do servidor...');
    
    const { data, error } = await supabase.storage
      .from(BACKUP_BUCKET)
      .download(BACKUP_FILENAME);
    
    if (error) {
      console.error('Erro ao baixar backup:', error);
      toast.error('Erro ao baixar backup. O arquivo pode não existir ainda.');
      return false;
    }
    
    if (!data) {
      toast.error('Backup não encontrado no servidor.');
      return false;
    }
    
    // Cria URL do objeto e faz download
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = BACKUP_FILENAME;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Backup baixado com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao baixar backup:', error);
    toast.error('Erro ao baixar backup. Tente novamente.');
    return false;
  }
}

/**
 * Verifica se existe backup online
 */
export async function verificarBackupOnline(): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage
      .from(BACKUP_BUCKET)
      .list('', {
        limit: 100,
        offset: 0,
      });
    
    if (error) {
      return false;
    }
    
    return data ? data.some(f => f.name === BACKUP_FILENAME) : false;
  } catch (error) {
    return false;
  }
}

/**
 * Obtém informações do backup online (data de criação, tamanho)
 */
export async function obterInfoBackupOnline(): Promise<{ created_at: string; size: number; updated_at: string } | null> {
  try {
    const { data, error } = await supabase.storage
      .from(BACKUP_BUCKET)
      .list('', {
        limit: 100,
        offset: 0,
      });
    
    if (error || !data || data.length === 0) {
      return null;
    }
    
    const file = data.find(f => f.name === BACKUP_FILENAME);
    if (!file) {
      return null;
    }
    
    // O Supabase Storage retorna o tamanho em diferentes lugares dependendo da API
    const size = (file as any).metadata?.size || 
                 (file as any).metadata?.fileSize || 
                 (file as any).size || 
                 0;
    
    return {
      created_at: file.created_at || file.updated_at || '',
      updated_at: file.updated_at || file.created_at || '',
      size: typeof size === 'number' ? size : 0,
    };
  } catch (error) {
    console.error('Erro ao obter info do backup:', error);
    return null;
  }
}

