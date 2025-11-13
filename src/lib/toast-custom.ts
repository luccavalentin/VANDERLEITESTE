import { toast } from "sonner";

export const notify = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description: description || "A operação foi concluída com êxito.",
      duration: 3000,
    });
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description: description || "Não foi possível concluir a ação. Verifique e tente novamente.",
      duration: 5000,
    });
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description: description || "Revise os dados antes de confirmar.",
      duration: 4000,
    });
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description: description || "A operação foi iniciada, aguarde...",
      duration: 3000,
    });
  },
};

