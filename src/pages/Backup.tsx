import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Download, Calendar, CheckCircle2, AlertCircle, Loader2, Cloud, HardDrive, Mail } from "lucide-react";
import { 
  gerarBackupManual, 
  getLastBackupDate, 
  verificarNecessidadeBackup,
  baixarBackupOnline,
  verificarBackupOnline,
  obterInfoBackupOnline
} from "@/lib/backup-service";
import { getEmailDestino } from "@/lib/email-backup-service";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function Backup() {
  const [gerando, setGerando] = useState(false);
  const [baixando, setBaixando] = useState(false);
  const [ultimoBackup, setUltimoBackup] = useState<Date | null>(null);
  const [necessitaBackup, setNecessitaBackup] = useState(false);
  const [backupOnline, setBackupOnline] = useState(false);
  const [infoBackupOnline, setInfoBackupOnline] = useState<{ created_at: string; size: number; updated_at: string } | null>(null);
  const [carregandoInfo, setCarregandoInfo] = useState(true);

  useEffect(() => {
    atualizarInfoBackup();
    verificarBackupOnlineExistente();
  }, []);

  const atualizarInfoBackup = () => {
    const lastBackup = getLastBackupDate();
    setUltimoBackup(lastBackup);
    setNecessitaBackup(verificarNecessidadeBackup());
  };

  const verificarBackupOnlineExistente = async () => {
    setCarregandoInfo(true);
    try {
      const existe = await verificarBackupOnline();
      setBackupOnline(existe);
      
      if (existe) {
        const info = await obterInfoBackupOnline();
        setInfoBackupOnline(info);
      }
    } catch (error) {
      console.error("Erro ao verificar backup online:", error);
    } finally {
      setCarregandoInfo(false);
    }
  };

  const handleGerarBackup = async () => {
    setGerando(true);
    try {
      const sucesso = await gerarBackupManual();
      if (sucesso) {
        atualizarInfoBackup();
        await verificarBackupOnlineExistente();
        toast.success("Backup gerado e salvo online com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao gerar backup:", error);
      toast.error("Erro ao gerar backup. Tente novamente.");
    } finally {
      setGerando(false);
    }
  };

  const handleBaixarBackup = async () => {
    setBaixando(true);
    try {
      const sucesso = await baixarBackupOnline();
      if (!sucesso) {
        toast.error("Não foi possível baixar o backup. Verifique se existe um backup online.");
      }
    } catch (error) {
      console.error("Erro ao baixar backup:", error);
      toast.error("Erro ao baixar backup. Tente novamente.");
    } finally {
      setBaixando(false);
    }
  };

  const formatarTamanho = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Backup do Sistema</h1>
          <p className="text-muted-foreground">
            Backups automáticos online - salvos no Supabase Storage
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Status do Backup Online
            </CardTitle>
            <CardDescription>
              Informações sobre o backup armazenado online
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Backup Online:</span>
              {carregandoInfo ? (
                <Badge variant="outline">
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Verificando...
                </Badge>
              ) : backupOnline ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Disponível
                </Badge>
              ) : (
                <Badge variant="destructive">Não encontrado</Badge>
              )}
            </div>

            {infoBackupOnline && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Última Atualização:</span>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(parseISO(infoBackupOnline.updated_at || infoBackupOnline.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tamanho:</span>
                  <Badge variant="outline">{formatarTamanho(infoBackupOnline.size)}</Badge>
                </div>
              </>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Último Backup Local:</span>
              {ultimoBackup ? (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(ultimoBackup, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </Badge>
              ) : (
                <Badge variant="secondary">Nunca realizado</Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              {necessitaBackup ? (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Backup necessário
                </Badge>
              ) : (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Atualizado
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Frequência:</span>
              <Badge variant="outline">Diariamente (24h)</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Email de Destino:</span>
              <Badge variant="outline" className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {getEmailDestino()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Ações de Backup
            </CardTitle>
            <CardDescription>
              Gerar novo backup ou baixar backup existente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                O backup incluirá todas as tabelas do sistema:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Clientes, Leads e Processos</li>
                <li>Tarefas e Anotações</li>
                <li>Transações Financeiras</li>
                <li>Imóveis e Contratos</li>
                <li>Gado e Transportadora</li>
                <li>Financiamentos e Investimentos</li>
                <li>Orçamentos e Recibos</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleGerarBackup}
                disabled={gerando}
                className="w-full"
                size="lg"
              >
                {gerando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando e salvando online...
                  </>
                ) : (
                  <>
                    <Cloud className="mr-2 h-4 w-4" />
                    Gerar Backup Online
                  </>
                )}
              </Button>

              <Button
                onClick={handleBaixarBackup}
                disabled={baixando || !backupOnline}
                variant="outline"
                className="w-full"
                size="lg"
              >
                {baixando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Baixando...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Baixar Backup Online
                  </>
                )}
              </Button>
            </div>

            {!backupOnline && !carregandoInfo && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  Nenhum backup online encontrado. Gere um novo backup para começar.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações sobre o Backup Online</CardTitle>
          <CardDescription>
            Como funciona o sistema de backup automático online
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Backup Automático Online
            </h4>
            <p className="text-sm text-muted-foreground">
              O sistema verifica automaticamente a necessidade de backup a cada vez que você
              abre o sistema. Se passaram 24 horas ou mais desde o último backup, um novo backup
              será gerado automaticamente, salvo online no Supabase Storage e enviado por email
              para <strong>luccasantana88@gmail.com</strong>.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Vantagens:</strong> Os backups são armazenados na nuvem, seguros e acessíveis
              de qualquer lugar. O backup é enviado automaticamente por email como anexo. O backup
              antigo é substituído automaticamente pelo novo.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Database className="h-4 w-4" />
              Backup Manual
            </h4>
            <p className="text-sm text-muted-foreground">
              Você pode gerar um backup manual a qualquer momento usando o botão "Gerar Backup Online".
              O arquivo será automaticamente salvo no Supabase Storage, substituirá o backup anterior
              e será enviado por email para <strong>luccasantana88@gmail.com</strong>.
            </p>
            <p className="text-sm text-muted-foreground">
              Para baixar o backup para seu computador, use o botão "Baixar Backup Online".
              O backup também será enviado automaticamente por email como anexo.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Formato do Backup</h4>
            <p className="text-sm text-muted-foreground">
              O backup é gerado em formato Excel (.xlsx) com múltiplas abas, uma para cada
              tabela do sistema. Cada aba contém todos os registros da respectiva tabela.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Armazenamento Online
            </h4>
            <p className="text-sm text-muted-foreground">
              Os backups são armazenados no <strong>Supabase Storage</strong> em um bucket chamado
              <strong> "backups-sistema"</strong>. O arquivo é salvo com o nome 
              <strong> "BACKUP_SISTEMA_VANDERLEI.xlsx"</strong>.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Importante:</strong> Certifique-se de que o bucket "backups-sistema" existe
              no seu projeto Supabase. Se não existir, você precisa criá-lo manualmente no painel
              do Supabase (Storage → Buckets → New Bucket).
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Substituição Automática</h4>
            <p className="text-sm text-muted-foreground">
              O sistema mantém apenas um backup online por vez. Quando um novo backup é gerado,
              o backup anterior é automaticamente substituído. Isso garante que você sempre tenha
              o backup mais recente disponível online.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Dica:</strong> Se você quiser manter backups antigos, baixe o backup antes
              de gerar um novo, ou configure o Supabase para manter versões anteriores dos arquivos.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Envio Automático por Email
            </h4>
            <p className="text-sm text-muted-foreground">
              O backup é enviado automaticamente por email toda vez que é gerado (automático ou manual).
              O email é enviado para <strong>luccasantana88@gmail.com</strong> com o arquivo Excel
              como anexo.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Configuração:</strong> Para habilitar o envio por email, configure a API Key
              do Resend no arquivo `.env.local`. Veja <strong>GUIA_CONFIGURACAO_EMAIL.md</strong> para
              mais detalhes.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Importante:</strong> O backup ainda é salvo no Supabase Storage mesmo se o
              email não puder ser enviado. O sistema não falha se o email não puder ser enviado.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Configuração do Supabase Storage</h4>
            <p className="text-sm text-muted-foreground">
              Para que o sistema funcione corretamente, você precisa:
            </p>
            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1 ml-4">
              <li>Acessar o painel do Supabase</li>
              <li>Ir em Storage → Buckets</li>
              <li>Criar um novo bucket chamado <strong>"backups-sistema"</strong></li>
              <li>Configurar o bucket como privado (não público)</li>
              <li>Configurar as políticas RLS (Row Level Security) se necessário</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

