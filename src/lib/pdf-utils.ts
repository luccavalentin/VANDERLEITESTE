import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

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

export const gerarPDFRelatorio = async (config: {
  titulo: string;
  dados: any[];
  colunas: string[];
  graficos?: Array<{ elemento: HTMLElement | string; titulo?: string }>;
} | string, dados?: any[], colunas?: string[], graficos?: Array<{ elemento: HTMLElement | string; titulo?: string }>) => {
  const doc = new jsPDF();
  
  // Suporte para formato antigo e novo
  const titulo = typeof config === 'string' ? config : config.titulo;
  const dadosArray = typeof config === 'string' ? (dados || []) : config.dados;
  const colunasArray = typeof config === 'string' ? (colunas || []) : config.colunas;
  const graficosArray = typeof config === 'string' ? (graficos || []) : (config.graficos || []);
  
  let currentY = 20;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  
  // Título
  doc.setFontSize(16);
  doc.text(titulo, pageWidth / 2, currentY, { align: 'center' });
  currentY += 15;
  
  // Dados
  if (dadosArray.length === 0) {
    doc.setFontSize(12);
    doc.text('Nenhum dado disponível', pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;
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
        startY: currentY,
        head: [colunasArray],
        body: dadosFormatados,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] },
        margin: { left: margin, right: margin },
      });
      
      currentY = (doc as any).lastAutoTable.finalY + 15;
    } else {
      // Formato de tabela normal
      // Função auxiliar para normalizar chaves (remove acentos, converte para minúsculas)
      const normalizarChave = (str: string) => {
        return str
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
      };
      
      // Criar mapeamento entre nomes de colunas e chaves dos objetos
      const mapearChave = (colunaNome: string, item: any): any => {
        // Primeiro, tentar exatamente como está
        if (item[colunaNome] !== undefined) {
          return item[colunaNome];
        }
        
        // Tentar normalizado
        const chaveNormalizada = normalizarChave(colunaNome);
        if (item[chaveNormalizada] !== undefined) {
          return item[chaveNormalizada];
        }
        
        // Tentar todas as chaves do objeto para encontrar correspondência
        const chavesObjeto = Object.keys(item);
        const chaveEncontrada = chavesObjeto.find(chave => 
          normalizarChave(chave) === chaveNormalizada ||
          normalizarChave(chave) === normalizarChave(colunaNome)
        );
        
        if (chaveEncontrada) {
          return item[chaveEncontrada];
        }
        
        // Se não encontrar, retornar undefined
        return undefined;
      };
      
      const dadosFormatados = dadosArray.map(item => colunasArray.map(col => {
        const valor = mapearChave(col, item);
        
        if (valor === undefined || valor === null) {
          return '-';
        }
        
        if (typeof valor === 'number' && (col.toLowerCase().includes('valor') || col.toLowerCase().includes('preço') || col.toLowerCase().includes('preco'))) {
          return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
        }
        if (valor instanceof Date || (typeof valor === 'string' && valor.match(/\d{4}-\d{2}-\d{2}/))) {
          return new Date(valor).toLocaleDateString('pt-BR');
        }
        return String(valor || '-');
      }));
      
      autoTable(doc, {
        startY: currentY,
        head: [colunasArray],
        body: dadosFormatados,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] },
        margin: { left: margin, right: margin },
      });
      
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }
  }
  
  // Adicionar gráficos
  if (graficosArray.length > 0) {
    for (const grafico of graficosArray) {
      try {
        // Verificar se precisa criar nova página
        if (currentY > pageHeight - 80) {
          doc.addPage();
          currentY = 20;
        }
        
        let elemento: HTMLElement | null = null;
        
        if (typeof grafico.elemento === 'string') {
          // Se for um seletor, buscar o elemento
          elemento = document.querySelector(grafico.elemento) as HTMLElement;
        } else {
          elemento = grafico.elemento;
        }
        
        if (elemento && elemento.offsetWidth > 0 && elemento.offsetHeight > 0) {
          // Título do gráfico
          if (grafico.titulo) {
            doc.setFontSize(14);
            doc.text(grafico.titulo, margin, currentY);
            currentY += 10;
          }
          
          // Aguardar um pouco para garantir que o gráfico esteja totalmente renderizado
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Capturar gráfico como imagem com melhor qualidade
          const canvas = await html2canvas(elemento, {
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true,
            allowTaint: false,
            onclone: (clonedDoc: Document, element: HTMLElement | null) => {
              // Garantir que os SVGs sejam visíveis no clone
              try {
                // Forçar renderização de SVGs
                const svgs = clonedDoc.querySelectorAll('svg');
                svgs.forEach((svg: Element) => {
                  const svgEl = svg as HTMLElement;
                  svgEl.style.visibility = 'visible';
                  svgEl.style.display = 'block';
                  svgEl.style.opacity = '1';
                  svgEl.style.position = 'relative';
                  svgEl.style.zIndex = '1';
                });
                
                // Garantir que o elemento clonado seja visível
                if (element) {
                  const el = element as HTMLElement;
                  el.style.visibility = 'visible';
                  el.style.display = 'block';
                  el.style.opacity = '1';
                  el.style.backgroundColor = '#ffffff';
                }
                
                // Garantir que os elementos filhos também sejam visíveis
                const allElements = clonedDoc.querySelectorAll('*');
                allElements.forEach((el: Element) => {
                  const htmlEl = el as HTMLElement;
                  if (htmlEl.style) {
                    if (htmlEl.style.visibility === 'hidden') {
                      htmlEl.style.visibility = 'visible';
                    }
                    if (htmlEl.style.display === 'none') {
                      htmlEl.style.display = 'block';
                    }
                  }
                });
              } catch (error) {
                console.warn('Erro ao processar clone do gráfico:', error);
              }
            }
          });
          
          if (canvas && canvas.width > 0 && canvas.height > 0) {
            const imgData = canvas.toDataURL('image/png', 1.0);
            const imgWidth = maxWidth;
            const imgHeight = Math.min((canvas.height * imgWidth) / canvas.width, pageHeight - currentY - 40);
            
            // Verificar se precisa criar nova página para o gráfico
            if (currentY + imgHeight > pageHeight - 30) {
              doc.addPage();
              currentY = 20;
              if (grafico.titulo) {
                doc.setFontSize(14);
                doc.text(grafico.titulo, margin, currentY);
                currentY += 10;
              }
              // Recalcular altura na nova página
              const newImgHeight = Math.min((canvas.height * imgWidth) / canvas.width, pageHeight - currentY - 40);
              if (newImgHeight > 0) {
                doc.addImage(imgData, 'PNG', margin, currentY, imgWidth, newImgHeight);
                currentY += newImgHeight + 15;
              }
            } else {
              // Adicionar imagem ao PDF
              if (imgHeight > 0) {
                doc.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
                currentY += imgHeight + 15;
              }
            }
          }
        }
      } catch (error) {
        console.error('Erro ao capturar gráfico:', error);
        // Continuar mesmo se um gráfico falhar
      }
    }
  }
  
  // Rodapé
  doc.setFontSize(8);
  const finalPageHeight = doc.internal.pageSize.height;
  doc.text('Gerenciador Empresarial - Sistema Vanderlei', pageWidth / 2, finalPageHeight - 10, { align: 'center' });
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, pageWidth / 2, finalPageHeight - 5, { align: 'center' });
  
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

