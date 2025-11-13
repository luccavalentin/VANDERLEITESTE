// Serviço para enviar backup por email
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Email de destino configurado
const EMAIL_DESTINO = 'luccasantana88@gmail.com';

/**
 * Envia backup por email usando Edge Function do Supabase
 */
export async function enviarBackupPorEmail(backupBuffer: ArrayBuffer, nomeArquivo: string): Promise<boolean> {
  try {
    toast.info('Enviando backup por email...');

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      console.warn('Supabase URL não configurada. Não é possível enviar email.');
      return false;
    }

    // Converte ArrayBuffer para base64 para enviar via API
    // Usa método mais eficiente para arquivos grandes
    const bytes = new Uint8Array(backupBuffer);
    let binary = '';
    const chunkSize = 8192; // Processa em chunks para evitar problemas com arquivos grandes
    
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    
    const base64 = btoa(binary);

    // Tenta usar a Edge Function do Supabase
    try {
      const { data, error } = await supabase.functions.invoke('backup-email', {
        body: {
          email: EMAIL_DESTINO,
          filename: nomeArquivo,
          fileContent: base64,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });

      if (!error && data) {
        console.log('Email enviado com sucesso via Edge Function');
        return true;
      } else {
        console.error('Erro ao chamar Edge Function:', error);
      }
    } catch (edgeFunctionError) {
      console.warn('Edge Function não disponível:', edgeFunctionError);
    }

    // Método alternativo: usar Resend API diretamente (requer API key)
    // NOTA: Por segurança, recomenda-se usar Edge Function
    const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Sistema Vanderlei <backup@sistema-vanderlei.com>',
            to: EMAIL_DESTINO,
            subject: `Backup Automático - Sistema Vanderlei - ${new Date().toLocaleDateString('pt-BR')}`,
            html: `
              <html>
                <body style="font-family: Arial, sans-serif;">
                  <h2>Backup Automático do Sistema Vanderlei</h2>
                  <p>Data/Hora do Backup: <strong>${new Date().toLocaleString('pt-BR')}</strong></p>
                  <p>O backup foi gerado automaticamente e está anexo neste email.</p>
                  <p>Para acessar o backup online, acesse o sistema Vanderlei.</p>
                  <hr>
                  <p><small>Sistema Vanderlei - Backup Automático Diário</small></p>
                </body>
              </html>
            `,
            attachments: [
              {
                filename: nomeArquivo,
                content: base64,
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              },
            ],
          }),
        });

        if (response.ok) {
          console.log('Email enviado com sucesso via Resend');
          return true;
        } else {
          const errorText = await response.text();
          console.error('Erro ao enviar email via Resend:', errorText);
        }
      } catch (resendError) {
        console.error('Erro ao enviar email via Resend:', resendError);
      }
    } else {
      console.warn('Resend API Key não configurada. Configure VITE_RESEND_API_KEY para enviar emails.');
    }

    // Se nenhum método funcionou, retorna false mas não falha o backup
    console.warn('Não foi possível enviar email. O backup foi salvo no storage.');
    return false;
  } catch (error) {
    console.error('Erro ao enviar backup por email:', error);
    // Não falha o backup se o email não puder ser enviado
    return false;
  }
}

/**
 * Obtém o email de destino configurado
 */
export function getEmailDestino(): string {
  return EMAIL_DESTINO;
}

