import { toast } from "sonner"
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react"

export const notify = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description: description || "Operação concluída com êxito",
      icon: CheckCircle2,
      duration: 3000,
    })
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description: description || "Verifique e tente novamente",
      icon: XCircle,
      duration: 4000,
    })
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description: description || "Revise os dados antes de confirmar",
      icon: AlertTriangle,
      duration: 3500,
    })
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description: description || "Operação iniciada, aguarde...",
      icon: Info,
      duration: 3000,
    })
  },
}
