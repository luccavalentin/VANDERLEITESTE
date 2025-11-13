import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BotaoVoltar } from "@/components/BotaoVoltar";
import { Download, FileSpreadsheet, Filter, Search } from "lucide-react";
import { format, parse, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { gerarPDFRelatorio } from "@/lib/pdf-utils";
import { gerarExcelRelatorio } from "@/lib/excel-utils";

type EntidadeTipo = 
  | 'tarefas'
  | 'clientes'
  | 'leads'
  | 'processos'
  | 'transacoes'
  | 'imoveis'
  | 'contratos_locacao'
  | 'gado'
  | 'caminhoes'
  | 'motoristas'
  | 'fretes'
  | 'financiamentos'
  | 'investimentos'
  | 'anotacoes'
  | 'followups'
  | 'orcamentos_recibos';

interface Filtros {
  entidade: EntidadeTipo;
  dataInicial: string;
  dataFinal: string;
  status?: string;
  tipo?: string;
  categoria?: string;
  busca?: string;
  [key: string]: any;
}

const ENTIDADES: Array<{ value: EntidadeTipo; label: string; camposData: string[] }> = [
  { value: 'tarefas', label: 'Tarefas', camposData: ['data_vencimento', 'created_at'] },
  { value: 'clientes', label: 'Clientes', camposData: ['created_at'] },
  { value: 'leads', label: 'Leads', camposData: ['data_inicio', 'data_fim', 'created_at'] },
  { value: 'processos', label: 'Processos', camposData: ['data_inicial', 'created_at'] },
  { value: 'transacoes', label: 'Transações', camposData: ['data'] },
  { value: 'imoveis', label: 'Imóveis', camposData: ['created_at'] },
  { value: 'contratos_locacao', label: 'Contratos de Locação', camposData: ['data_inicio', 'data_fim', 'created_at'] },
  { value: 'gado', label: 'Gado', camposData: ['created_at'] },
  { value: 'caminhoes', label: 'Caminhões', camposData: ['created_at'] },
  { value: 'motoristas', label: 'Motoristas', camposData: ['created_at'] },
  { value: 'fretes', label: 'Fretes', camposData: ['data_saida', 'data_chegada', 'created_at'] },
  { value: 'financiamentos', label: 'Financiamentos', camposData: ['data_inicio', 'created_at'] },
  { value: 'investimentos', label: 'Investimentos', camposData: ['data_aplicacao', 'data_vencimento', 'created_at'] },
  { value: 'anotacoes', label: 'Anotações', camposData: ['data', 'created_at'] },
  { value: 'followups', label: 'Follow-ups', camposData: ['data_hora', 'lembrete_data', 'created_at'] },
  { value: 'orcamentos_recibos', label: 'Orçamentos e Recibos', camposData: ['data_emissao', 'data_vencimento', 'created_at'] },
];

export default function Relatorios() {
  const [filtros, setFiltros] = useState<Filtros>({
    entidade: 'tarefas',
    dataInicial: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
    dataFinal: format(new Date(), 'yyyy-MM-dd'),
  });

  const [campoDataSelecionado, setCampoDataSelecionado] = useState<string>('data_vencimento');

  // Buscar dados da entidade selecionada
  const { data: dadosEntidade, isLoading } = useQuery({
    queryKey: ['relatorios', filtros.entidade],
    queryFn: async () => {
      // Usar 'as any' para entidades que não estão no types.ts (followups, contratos_locacao)
      const { data, error } = await (supabase.from as any)(filtros.entidade)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!filtros.entidade,
  });

  // Obter campos de data disponíveis para a entidade
  const camposDataDisponiveis = useMemo(() => {
    const entidade = ENTIDADES.find(e => e.value === filtros.entidade);
    return entidade?.camposData || [];
  }, [filtros.entidade]);

  // Atualizar campo de data selecionado quando a entidade mudar
  useEffect(() => {
    if (camposDataDisponiveis.length > 0) {
      if (!campoDataSelecionado || !camposDataDisponiveis.includes(campoDataSelecionado)) {
        setCampoDataSelecionado(camposDataDisponiveis[0]);
      }
    }
  }, [camposDataDisponiveis, campoDataSelecionado]);

  // Aplicar filtros aos dados
  const dadosFiltrados = useMemo(() => {
    if (!dadosEntidade) return [];

    let filtrado = [...dadosEntidade];

    // Filtro por data
    if (campoDataSelecionado && filtros.dataInicial && filtros.dataFinal) {
      try {
        const dataInicial = startOfDay(parse(filtros.dataInicial, 'yyyy-MM-dd', new Date()));
        const dataFinal = endOfDay(parse(filtros.dataFinal, 'yyyy-MM-dd', new Date()));

        filtrado = filtrado.filter((item: any) => {
          const dataItem = item[campoDataSelecionado];
          if (!dataItem) return false; // Excluir itens sem data quando o filtro de data estiver ativo
          
          try {
            // Tratar diferentes formatos de data
            let data: Date;
            if (typeof dataItem === 'string') {
              // Se for string, tentar parsear
              data = new Date(dataItem);
            } else if (dataItem instanceof Date) {
              data = dataItem;
            } else {
              return false;
            }
            
            if (isNaN(data.getTime())) return false; // Excluir se a data for inválida
            return data >= dataInicial && data <= dataFinal;
          } catch {
            return false; // Excluir se houver erro ao parsear a data
          }
        });
      } catch (error) {
        console.warn('Erro ao filtrar por data:', error);
      }
    }

    // Filtro por status
    if (filtros.status && filtros.status !== 'todos') {
      filtrado = filtrado.filter((item: any) => item.status === filtros.status);
    }

    // Filtro por tipo
    if (filtros.tipo && filtros.tipo !== 'todos') {
      filtrado = filtrado.filter((item: any) => item.tipo === filtros.tipo);
    }

    // Filtro por categoria
    if (filtros.categoria && filtros.categoria !== 'todos') {
      filtrado = filtrado.filter((item: any) => item.categoria === filtros.categoria);
    }

    // Filtro por busca (texto)
    if (filtros.busca) {
      const buscaLower = filtros.busca.toLowerCase();
      filtrado = filtrado.filter((item: any) => {
        return Object.values(item).some((valor: any) => {
          if (typeof valor === 'string') {
            return valor.toLowerCase().includes(buscaLower);
          }
          return false;
        });
      });
    }

    return filtrado;
  }, [dadosEntidade, filtros, campoDataSelecionado]);

  // Obter valores únicos para filtros
  const valoresStatus = useMemo(() => {
    if (!dadosEntidade) return [];
    const statusSet = new Set(dadosEntidade.map((item: any) => item.status).filter(Boolean));
    return Array.from(statusSet);
  }, [dadosEntidade]);

  const valoresTipo = useMemo(() => {
    if (!dadosEntidade) return [];
    const tipoSet = new Set(dadosEntidade.map((item: any) => item.tipo).filter(Boolean));
    return Array.from(tipoSet);
  }, [dadosEntidade]);

  const valoresCategoria = useMemo(() => {
    if (!dadosEntidade) return [];
    const categoriaSet = new Set(dadosEntidade.map((item: any) => item.categoria).filter(Boolean));
    return Array.from(categoriaSet);
  }, [dadosEntidade]);

  // Obter colunas da entidade
  const colunas = useMemo(() => {
    if (!dadosEntidade || dadosEntidade.length === 0) return [];
    return Object.keys(dadosEntidade[0]).filter(col => 
      col !== 'id' && 
      col !== 'user_id' && 
      !col.includes('password') &&
      !col.includes('token')
    );
  }, [dadosEntidade]);

  // Formatar valor para exibição
  const formatarValor = (valor: any, coluna: string): string => {
    if (valor === null || valor === undefined || valor === '') return '-';
    
    // Formatar datas e timestamps
    if (coluna.includes('data') || coluna.includes('created_at') || coluna.includes('updated_at') || 
        coluna.includes('data_hora') || coluna.includes('lembrete_data') || coluna.includes('data_emissao') ||
        coluna.includes('data_vencimento') || coluna.includes('data_inicio') || coluna.includes('data_fim') ||
        coluna.includes('data_inicial') || coluna.includes('data_saida') || coluna.includes('data_chegada') ||
        coluna.includes('data_aplicacao') || coluna.includes('data_vencimento')) {
      try {
        if (valor) {
          const data = new Date(valor);
          if (!isNaN(data.getTime())) {
            // Se incluir hora (timestamp), mostrar data e hora
            if (coluna.includes('data_hora') || coluna.includes('created_at') || coluna.includes('updated_at')) {
              return format(data, 'dd/MM/yyyy HH:mm', { locale: ptBR });
            }
            return format(data, 'dd/MM/yyyy', { locale: ptBR });
          }
        }
      } catch {
        // Continuar para outros formatos
      }
    }
    
    // Formatar valores monetários
    if (coluna.includes('valor') || coluna.includes('preco') || coluna.includes('total') || 
        coluna.includes('saldo') || coluna.includes('aluguel') || coluna.includes('contrato') || 
        coluna.includes('aplicacao') || coluna.includes('principal') || coluna.includes('juros') || 
        coluna.includes('parcela') || coluna.includes('valor_contrato') || coluna.includes('valor_causa') ||
        coluna.includes('valor_total') || coluna.includes('valor_unitario') || coluna.includes('valor_aplicado')) {
      if (typeof valor === 'number') {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
      }
      if (typeof valor === 'string' && !isNaN(Number(valor)) && valor.trim() !== '') {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
      }
    }
    
    // Formatar booleanos
    if (typeof valor === 'boolean') {
      return valor ? 'Sim' : 'Não';
    }
    
    // Formatar arrays
    if (Array.isArray(valor)) {
      if (valor.length === 0) return '-';
      return valor.map(v => String(v)).join(', ');
    }
    
    // Formatar objetos JSON (mas não objetos complexos)
    if (typeof valor === 'object' && valor !== null) {
      try {
        const str = JSON.stringify(valor);
        if (str.length > 100) {
          return str.substring(0, 100) + '...';
        }
        return str;
      } catch {
        return '[Objeto]';
      }
    }
    
    return String(valor);
  };

  // Exportar para PDF
  const handleExportarPDF = async () => {
    try {
      const entidadeLabel = ENTIDADES.find(e => e.value === filtros.entidade)?.label || filtros.entidade;
      const periodo = campoDataSelecionado 
        ? `${format(parse(filtros.dataInicial, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy', { locale: ptBR })} a ${format(parse(filtros.dataFinal, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy', { locale: ptBR })}`
        : 'Todos os registros';
      
      const dadosFormatados = dadosFiltrados.map((item: any) => {
        const obj: any = {};
        colunas.forEach(col => {
          obj[col] = formatarValor(item[col], col);
        });
        return obj;
      });

      await gerarPDFRelatorio({
        titulo: `Relatório de ${entidadeLabel} - ${periodo}`,
        dados: dadosFormatados,
        colunas: colunas.map(col => col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())),
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao exportar PDF. Verifique o console para mais detalhes.');
    }
  };

  // Exportar para Excel
  const handleExportarExcel = () => {
    try {
      const entidadeLabel = ENTIDADES.find(e => e.value === filtros.entidade)?.label || filtros.entidade;
      const periodo = campoDataSelecionado 
        ? `${format(parse(filtros.dataInicial, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy', { locale: ptBR })} a ${format(parse(filtros.dataFinal, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy', { locale: ptBR })}`
        : 'Todos os registros';
      
      const dadosFormatados = dadosFiltrados.map((item: any) => {
        const obj: any = {};
        colunas.forEach(col => {
          obj[col] = formatarValor(item[col], col);
        });
        return obj;
      });

      gerarExcelRelatorio({
        titulo: `Relatório de ${entidadeLabel} - ${periodo}`,
        dados: dadosFormatados,
        colunas: colunas.map(col => col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())),
      });
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      alert('Erro ao exportar Excel. Verifique o console para mais detalhes.');
    }
  };

  // Obter badge para status
  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'ativo': 'bg-green-500',
      'inativo': 'bg-gray-500',
      'pendente': 'bg-yellow-500',
      'em_andamento': 'bg-blue-500',
      'concluida': 'bg-green-500',
      'concluido': 'bg-green-500',
      'cancelada': 'bg-red-500',
      'cancelado': 'bg-red-500',
      'novo': 'bg-blue-500',
      'contatado': 'bg-yellow-500',
      'interessado': 'bg-purple-500',
      'convertido': 'bg-green-500',
      'perdido': 'bg-red-500',
      'aprovado': 'bg-green-500',
      'recusado': 'bg-red-500',
    };
    return statusColors[status] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6 animate-fade-in p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <BotaoVoltar />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Relatórios</h1>
            <p className="text-sm text-muted-foreground">Filtre e exporte dados de qualquer cadastro do sistema</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportarPDF}
            disabled={dadosFiltrados.length === 0 || isLoading}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportarExcel}
            disabled={dadosFiltrados.length === 0 || isLoading}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-4 sm:p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Seleção de Entidade */}
            <div className="space-y-2">
              <Label htmlFor="entidade">Entidade</Label>
              <Select
                value={filtros.entidade}
                onValueChange={(value) => {
                  setFiltros({ ...filtros, entidade: value as EntidadeTipo, status: undefined, tipo: undefined, categoria: undefined });
                  setCampoDataSelecionado('');
                }}
              >
                <SelectTrigger id="entidade">
                  <SelectValue placeholder="Selecione uma entidade" />
                </SelectTrigger>
                <SelectContent>
                  {ENTIDADES.map(entidade => (
                    <SelectItem key={entidade.value} value={entidade.value}>
                      {entidade.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Campo de Data */}
            {camposDataDisponiveis.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="campoData">Campo de Data</Label>
                <Select
                  value={campoDataSelecionado}
                  onValueChange={setCampoDataSelecionado}
                >
                  <SelectTrigger id="campoData">
                    <SelectValue placeholder="Selecione o campo de data" />
                  </SelectTrigger>
                  <SelectContent>
                    {camposDataDisponiveis.map(campo => (
                      <SelectItem key={campo} value={campo}>
                        {campo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Data Inicial */}
            <div className="space-y-2">
              <Label htmlFor="dataInicial">Data Inicial</Label>
              <Input
                id="dataInicial"
                type="date"
                value={filtros.dataInicial}
                onChange={(e) => setFiltros({ ...filtros, dataInicial: e.target.value })}
              />
            </div>

            {/* Data Final */}
            <div className="space-y-2">
              <Label htmlFor="dataFinal">Data Final</Label>
              <Input
                id="dataFinal"
                type="date"
                value={filtros.dataFinal}
                onChange={(e) => setFiltros({ ...filtros, dataFinal: e.target.value })}
              />
            </div>

            {/* Filtro por Status */}
            {valoresStatus.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={filtros.status || 'todos'}
                  onValueChange={(value) => setFiltros({ ...filtros, status: value === 'todos' ? undefined : value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    {valoresStatus.map(status => (
                      <SelectItem key={String(status)} value={String(status)}>
                        {String(status).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Filtro por Tipo */}
            {valoresTipo.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={filtros.tipo || 'todos'}
                  onValueChange={(value) => setFiltros({ ...filtros, tipo: value === 'todos' ? undefined : value })}
                >
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    {valoresTipo.map(tipo => (
                      <SelectItem key={String(tipo)} value={String(tipo)}>
                        {String(tipo).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Filtro por Categoria */}
            {valoresCategoria.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select
                  value={filtros.categoria || 'todos'}
                  onValueChange={(value) => setFiltros({ ...filtros, categoria: value === 'todos' ? undefined : value })}
                >
                  <SelectTrigger id="categoria">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as categorias</SelectItem>
                    {valoresCategoria.map(categoria => (
                      <SelectItem key={String(categoria)} value={String(categoria)}>
                        {String(categoria).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Busca por Texto */}
            <div className="space-y-2">
              <Label htmlFor="busca">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="busca"
                  type="text"
                  placeholder="Buscar em todos os campos..."
                  value={filtros.busca || ''}
                  onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Botão Limpar Filtros */}
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setFiltros({
                  entidade: filtros.entidade,
                  dataInicial: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
                  dataFinal: format(new Date(), 'yyyy-MM-dd'),
                });
                setCampoDataSelecionado(camposDataDisponiveis[0] || '');
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <Card className="p-4 sm:p-6">
        <CardHeader>
          <CardTitle>
            Resultados ({dadosFiltrados.length} {dadosFiltrados.length === 1 ? 'registro' : 'registros'})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Carregando dados...</p>
            </div>
          ) : dadosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-2">Nenhum registro encontrado</p>
              <p className="text-sm text-muted-foreground">Ajuste os filtros para ver mais resultados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {colunas.map(col => (
                      <TableHead key={col} className="whitespace-nowrap text-xs sm:text-sm font-semibold">
                        {col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dadosFiltrados.map((item: any, index: number) => (
                    <TableRow key={item.id || index} className="hover:bg-muted/50 transition-colors">
                      {colunas.map(col => {
                        const valor = item[col];
                        return (
                          <TableCell key={col} className="text-xs sm:text-sm py-2">
                            {col === 'status' && valor ? (
                              <Badge className={getStatusBadge(String(valor))}>
                                {String(valor).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>
                            ) : col === 'tipo' && valor ? (
                              <Badge variant="outline" className="border-primary/20">
                                {String(valor).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>
                            ) : col === 'prioridade' && valor ? (
                              <Badge className={
                                valor === 'alta' ? 'bg-red-500 hover:bg-red-600' :
                                valor === 'media' ? 'bg-yellow-500 hover:bg-yellow-600' :
                                'bg-green-500 hover:bg-green-600'
                              }>
                                {String(valor).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>
                            ) : (
                              <span className="break-words max-w-[200px] sm:max-w-none block">
                                {formatarValor(valor, col)}
                              </span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
