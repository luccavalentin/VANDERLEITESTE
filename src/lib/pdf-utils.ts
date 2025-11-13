import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const gerarPDFOrcamentoRecibo = (dados: {
  tipo: 'orcamento' | 'recibo';
  numero: string;
  cliente?: string;
  itens: Array<{ descricao: string; quantidade: number; valorUnitario: number }>;
  valorTotal: number;
  dataEmissao: string;
  dataVencimento?: string;
  observacoes?: string;
}) => {
  const doc = new jsPDF();
  
  // Cabeçalho
  doc.setFontSize(20);
  doc.text(dados.tipo === 'orcamento' ? 'ORÇAMENTO' : 'RECIBO', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Nº: ${dados.numero}`, 20, 35);
  doc.text(`Data de Emissão: ${new Date(dados.dataEmissao).toLocaleDateString('pt-BR')}`, 20, 42);
  
  if (dados.dataVencimento) {
    doc.text(`Data de Vencimento: ${new Date(dados.dataVencimento).toLocaleDateString('pt-BR')}`, 20, 49);
  }
  
  if (dados.cliente) {
    doc.text(`Cliente: ${dados.cliente}`, 20, 56);
  }
  
  // Tabela de itens
  const itensData = dados.itens.map(item => [
    item.descricao,
    item.quantidade.toString(),
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valorUnitario),
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantidade * item.valorUnitario)
  ]);
  
  autoTable(doc, {
    startY: 65,
    head: [['Descrição', 'Qtd', 'Valor Unit.', 'Total']],
    body: itensData,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42] },
  });
  
  // Total
  const finalY = (doc as any).lastAutoTable.finalY || 100;
  doc.setFontSize(14);
  doc.text(
    `TOTAL: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dados.valorTotal)}`,
    20,
    finalY + 15
  );
  
  if (dados.observacoes) {
    doc.setFontSize(10);
    doc.text(`Observações: ${dados.observacoes}`, 20, finalY + 25, { maxWidth: 170 });
  }
  
  // Rodapé
  doc.setFontSize(8);
  doc.text('Gerenciador Empresarial - Sistema Vanderlei', 105, 280, { align: 'center' });
  
  doc.save(`${dados.tipo}-${dados.numero}.pdf`);
};

export const gerarPDFRelatorio = (config: {
  titulo: string;
  dados: any[];
  colunas: string[];
} | string, dados?: any[], colunas?: string[]) => {
  const doc = new jsPDF();
  
  // Suporte para formato antigo e novo
  const titulo = typeof config === 'string' ? config : config.titulo;
  const dadosArray = typeof config === 'string' ? (dados || []) : config.dados;
  const colunasArray = typeof config === 'string' ? (colunas || []) : config.colunas;
  
  doc.setFontSize(16);
  doc.text(titulo, 105, 20, { align: 'center' });
  
  if (dadosArray.length === 0) {
    doc.setFontSize(12);
    doc.text('Nenhum dado disponível', 105, 40, { align: 'center' });
  } else {
    // Se dados são objetos com label/valor
    if (dadosArray[0]?.label && dadosArray[0]?.valor !== undefined) {
      const dadosFormatados = dadosArray.map(item => [
        String(item.label || '-'),
        typeof item.valor === 'number' 
          ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)
          : String(item.valor || '-')
      ]);
      
      autoTable(doc, {
        startY: 30,
        head: [colunasArray],
        body: dadosFormatados,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] },
      });
    } else {
      // Formato de tabela normal
      const dadosFormatados = dadosArray.map(item => colunasArray.map(col => {
        const valor = item[col];
        if (typeof valor === 'number' && (col.toLowerCase().includes('valor') || col.toLowerCase().includes('preço'))) {
          return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
        }
        if (valor instanceof Date || (typeof valor === 'string' && valor.match(/\d{4}-\d{2}-\d{2}/))) {
          return new Date(valor).toLocaleDateString('pt-BR');
        }
        return String(valor || '-');
      }));
      
      autoTable(doc, {
        startY: 30,
        head: [colunasArray],
        body: dadosFormatados,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] },
      });
    }
  }
  
  // Rodapé
  doc.setFontSize(8);
  const pageHeight = doc.internal.pageSize.height;
  doc.text('Gerenciador Empresarial - Sistema Vanderlei', 105, pageHeight - 10, { align: 'center' });
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 105, pageHeight - 5, { align: 'center' });
  
  doc.save(`relatorio-${titulo.toLowerCase().replace(/\s/g, '-')}-${Date.now()}.pdf`);
};

export const gerarPDFTabelaAmortizacao = (dados: {
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
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text('TABELA DE AMORTIZAÇÃO', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Banco: ${dados.banco}`, 20, 35);
  doc.text(`Valor Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dados.valorTotal)}`, 20, 42);
  doc.text(`Taxa de Juros: ${dados.taxaJuros}%`, 20, 49);
  doc.text(`Número de Parcelas: ${dados.numeroParcelas}`, 20, 56);
  doc.text(`Valor da Parcela: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dados.valorParcela)}`, 20, 63);
  
  const parcelasData = dados.parcelas.map(p => [
    p.numero.toString(),
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.saldoInicial),
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.juros),
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.amortizacao),
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.saldoFinal)
  ]);
  
  autoTable(doc, {
    startY: 70,
    head: [['Parcela', 'Saldo Inicial', 'Juros', 'Amortização', 'Saldo Final']],
    body: parcelasData,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42] },
  });
  
  doc.save(`tabela-amortizacao-${dados.banco}.pdf`);
};

