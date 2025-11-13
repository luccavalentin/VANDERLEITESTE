import * as XLSX from 'xlsx';
import { toast } from 'sonner';

/**
 * Gera arquivo Excel de Orçamento/Recibo
 */
export const gerarExcelOrcamentoRecibo = (dados: {
  tipo: 'orcamento' | 'recibo';
  numero: string;
  cliente?: string;
  itens: Array<{ descricao: string; quantidade: number; valorUnitario: number }>;
  valorTotal: number;
  dataEmissao: string;
  dataVencimento?: string;
  observacoes?: string;
}) => {
  try {
    const workbook = XLSX.utils.book_new();

    // Planilha de informações
    const infoData = [
      [dados.tipo === 'orcamento' ? 'ORÇAMENTO' : 'RECIBO'],
      [],
      ['Nº:', dados.numero],
      ['Data de Emissão:', new Date(dados.dataEmissao).toLocaleDateString('pt-BR')],
      dados.dataVencimento ? ['Data de Vencimento:', new Date(dados.dataVencimento).toLocaleDateString('pt-BR')] : [],
      dados.cliente ? ['Cliente:', dados.cliente] : [],
      [],
      ['ITENS'],
    ];

    const infoSheet = XLSX.utils.aoa_to_sheet(infoData);
    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Informações');

    // Planilha de itens
    const itensData = [
      ['Descrição', 'Quantidade', 'Valor Unitário', 'Total'],
      ...dados.itens.map(item => [
        item.descricao,
        item.quantidade,
        item.valorUnitario,
        item.quantidade * item.valorUnitario,
      ]),
      [],
      ['TOTAL:', '', '', dados.valorTotal],
    ];

    const itensSheet = XLSX.utils.aoa_to_sheet(itensData);
    
    // Ajusta largura das colunas
    itensSheet['!cols'] = [
      { wch: 40 }, // Descrição
      { wch: 12 }, // Quantidade
      { wch: 15 }, // Valor Unitário
      { wch: 15 }, // Total
    ];

    XLSX.utils.book_append_sheet(workbook, itensSheet, 'Itens');

    // Adiciona observações se houver
    if (dados.observacoes) {
      const obsData = [
        ['OBSERVAÇÕES'],
        [dados.observacoes],
      ];
      const obsSheet = XLSX.utils.aoa_to_sheet(obsData);
      XLSX.utils.book_append_sheet(workbook, obsSheet, 'Observações');
    }

    // Gera nome do arquivo
    const nomeArquivo = `${dados.tipo}-${dados.numero}.xlsx`;
    XLSX.writeFile(workbook, nomeArquivo);

    toast.success('Excel gerado com sucesso!');
  } catch (error) {
    console.error('Erro ao gerar Excel:', error);
    toast.error('Erro ao gerar Excel. Verifique o console para mais detalhes.');
  }
};

/**
 * Gera arquivo Excel de Relatório
 */
export const gerarExcelRelatorio = (config: {
  titulo: string;
  dados: any[];
  colunas: string[];
} | string, dados?: any[], colunas?: string[]) => {
  try {
    const titulo = typeof config === 'string' ? config : config.titulo;
    const dadosArray = typeof config === 'string' ? (dados || []) : config.dados;
    const colunasArray = typeof config === 'string' ? (colunas || []) : config.colunas;

    const workbook = XLSX.utils.book_new();

    if (dadosArray.length === 0) {
      const emptyData = [
        [titulo],
        [],
        ['Nenhum dado disponível'],
      ];
      const emptySheet = XLSX.utils.aoa_to_sheet(emptyData);
      XLSX.utils.book_append_sheet(workbook, emptySheet, 'Relatório');
    } else {
      // Se dados são objetos com label/valor
      if (dadosArray[0]?.label && dadosArray[0]?.valor !== undefined) {
        const dadosFormatados = [
          colunasArray,
          ...dadosArray.map(item => [
            String(item.label || '-'),
            typeof item.valor === 'number'
              ? item.valor
              : String(item.valor || '-'),
          ]),
        ];

        const sheet = XLSX.utils.aoa_to_sheet(dadosFormatados);
        
        // Ajusta largura das colunas
        sheet['!cols'] = [
          { wch: Math.max(...dadosFormatados.map(row => String(row[0]).length), 20) },
          { wch: Math.max(...dadosFormatados.map(row => String(row[1]).length), 15) },
        ];

        XLSX.utils.book_append_sheet(workbook, sheet, 'Relatório');
      } else {
        // Formato de tabela normal
        const dadosFormatados = [
          colunasArray,
          ...dadosArray.map(item => colunasArray.map(col => {
            const valor = item[col];
            // Mantém números como números para Excel
            if (typeof valor === 'number') {
              return valor;
            }
            // Mantém datas como strings formatadas
            if (valor instanceof Date || (typeof valor === 'string' && valor.match(/\d{4}-\d{2}-\d{2}/))) {
              return new Date(valor).toLocaleDateString('pt-BR');
            }
            return String(valor || '-');
          })),
        ];

        const sheet = XLSX.utils.aoa_to_sheet(dadosFormatados);
        
        // Ajusta largura das colunas automaticamente
        const colWidths = colunasArray.map((_, colIndex) => {
          const maxWidth = Math.max(
            ...dadosFormatados.map(row => {
              const cellValue = row[colIndex];
              return String(cellValue || '').length;
            }),
            colunasArray[colIndex].length
          );
          return { wch: Math.max(maxWidth, 12) };
        });
        sheet['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(workbook, sheet, 'Relatório');
      }
    }

    // Gera nome do arquivo
    const nomeArquivo = `relatorio-${titulo.toLowerCase().replace(/\s/g, '-')}-${Date.now()}.xlsx`;
    XLSX.writeFile(workbook, nomeArquivo);

    toast.success('Excel gerado com sucesso!');
  } catch (error) {
    console.error('Erro ao gerar Excel:', error);
    toast.error('Erro ao gerar Excel. Verifique o console para mais detalhes.');
  }
};

/**
 * Gera arquivo Excel de Tabela de Amortização
 */
export const gerarExcelTabelaAmortizacao = (dados: {
  banco: string;
  valorTotal: number;
  taxaJuros: number;
  numeroParcelas: number;
  valorParcela: number;
  dataInicio: string;
  parcelas: Array<{
    numero: number;
    saldoInicial: number;
    juros: number;
    amortizacao: number;
    saldoFinal: number;
  }>;
}) => {
  try {
    const workbook = XLSX.utils.book_new();

    // Planilha de informações
    const infoData = [
      ['TABELA DE AMORTIZAÇÃO'],
      [],
      ['Banco:', dados.banco],
      ['Valor Total:', dados.valorTotal],
      ['Taxa de Juros:', `${dados.taxaJuros}%`],
      ['Número de Parcelas:', dados.numeroParcelas],
      ['Valor da Parcela:', dados.valorParcela],
      ['Data de Início:', new Date(dados.dataInicio).toLocaleDateString('pt-BR')],
      [],
      ['PARCELAS'],
    ];

    const infoSheet = XLSX.utils.aoa_to_sheet(infoData);
    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Informações');

    // Planilha de parcelas
    const parcelasData = [
      ['Parcela', 'Saldo Inicial', 'Juros', 'Amortização', 'Saldo Final'],
      ...dados.parcelas.map(p => [
        p.numero,
        p.saldoInicial,
        p.juros,
        p.amortizacao,
        p.saldoFinal,
      ]),
    ];

    const parcelasSheet = XLSX.utils.aoa_to_sheet(parcelasData);
    
    // Ajusta largura das colunas
    parcelasSheet['!cols'] = [
      { wch: 10 }, // Parcela
      { wch: 15 }, // Saldo Inicial
      { wch: 15 }, // Juros
      { wch: 15 }, // Amortização
      { wch: 15 }, // Saldo Final
    ];

    XLSX.utils.book_append_sheet(workbook, parcelasSheet, 'Parcelas');

    // Gera nome do arquivo
    const nomeArquivo = `tabela-amortizacao-${dados.banco}.xlsx`;
    XLSX.writeFile(workbook, nomeArquivo);

    toast.success('Excel gerado com sucesso!');
  } catch (error) {
    console.error('Erro ao gerar Excel:', error);
    toast.error('Erro ao gerar Excel. Verifique o console para mais detalhes.');
  }
};

