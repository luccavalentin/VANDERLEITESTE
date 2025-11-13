export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      anotacoes: {
        Row: {
          categoria: string
          conteudo: string
          created_at: string | null
          data: string | null
          id: string
          titulo: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          categoria: string
          conteudo: string
          created_at?: string | null
          data?: string | null
          id?: string
          titulo: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          categoria?: string
          conteudo?: string
          created_at?: string | null
          data?: string | null
          id?: string
          titulo?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      caminhoes: {
        Row: {
          ano: number | null
          created_at: string | null
          data_ultima_revisao: string | null
          id: string
          modelo: string
          placa: string
          quilometragem: number | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ano?: number | null
          created_at?: string | null
          data_ultima_revisao?: string | null
          id?: string
          modelo: string
          placa: string
          quilometragem?: number | null
          status: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ano?: number | null
          created_at?: string | null
          data_ultima_revisao?: string | null
          id?: string
          modelo?: string
          placa?: string
          quilometragem?: number | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      clientes: {
        Row: {
          cep: string
          cidade: string
          complemento: string | null
          cpf_cnpj: string | null
          created_at: string | null
          email: string | null
          endereco: string
          estado: string
          id: string
          nome: string
          numero: string | null
          status: string
          telefone: string
          tipo: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cep: string
          cidade: string
          complemento?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco: string
          estado: string
          id?: string
          nome: string
          numero?: string | null
          status: string
          telefone: string
          tipo: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cep?: string
          cidade?: string
          complemento?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string
          estado?: string
          id?: string
          nome?: string
          numero?: string | null
          status?: string
          telefone?: string
          tipo?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      financiamentos: {
        Row: {
          banco: string
          created_at: string | null
          data_inicio: string
          data_termino: string | null
          id: string
          iof: number | null
          numero_parcelas: number
          seguro: number | null
          taxa_juros: number
          tipo: string
          updated_at: string | null
          user_id: string | null
          valor_parcela: number
          valor_total: number
        }
        Insert: {
          banco: string
          created_at?: string | null
          data_inicio: string
          data_termino?: string | null
          id?: string
          iof?: number | null
          numero_parcelas: number
          seguro?: number | null
          taxa_juros: number
          tipo: string
          updated_at?: string | null
          user_id?: string | null
          valor_parcela: number
          valor_total: number
        }
        Update: {
          banco?: string
          created_at?: string | null
          data_inicio?: string
          data_termino?: string | null
          id?: string
          iof?: number | null
          numero_parcelas?: number
          seguro?: number | null
          taxa_juros?: number
          tipo?: string
          updated_at?: string | null
          user_id?: string | null
          valor_parcela?: number
          valor_total?: number
        }
        Relationships: []
      }
      fretes: {
        Row: {
          cliente: string
          created_at: string | null
          data: string
          despesas: number | null
          destino: string
          id: string
          observacoes: string | null
          origem: string
          updated_at: string | null
          user_id: string | null
          valor_frete: number
        }
        Insert: {
          cliente: string
          created_at?: string | null
          data: string
          despesas?: number | null
          destino: string
          id?: string
          observacoes?: string | null
          origem: string
          updated_at?: string | null
          user_id?: string | null
          valor_frete: number
        }
        Update: {
          cliente?: string
          created_at?: string | null
          data?: string
          despesas?: number | null
          destino?: string
          id?: string
          observacoes?: string | null
          origem?: string
          updated_at?: string | null
          user_id?: string | null
          valor_frete?: number
        }
        Relationships: []
      }
      gado: {
        Row: {
          categoria: string
          created_at: string | null
          eventos: Json | null
          historico_peso: Json | null
          historico_saude: Json | null
          id: string
          idade_meses: number | null
          identificacao: string
          observacoes: string | null
          origem: string | null
          peso_atual: number | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          categoria: string
          created_at?: string | null
          eventos?: Json | null
          historico_peso?: Json | null
          historico_saude?: Json | null
          id?: string
          idade_meses?: number | null
          identificacao: string
          observacoes?: string | null
          origem?: string | null
          peso_atual?: number | null
          status: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          categoria?: string
          created_at?: string | null
          eventos?: Json | null
          historico_peso?: Json | null
          historico_saude?: Json | null
          id?: string
          idade_meses?: number | null
          identificacao?: string
          observacoes?: string | null
          origem?: string | null
          peso_atual?: number | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      imoveis: {
        Row: {
          cep: string
          cidade: string
          complemento: string | null
          created_at: string | null
          data_pagamento: string | null
          documento_pago: boolean | null
          endereco: string
          estado: string
          id: string
          matricula: string | null
          numero: string
          proprietario: string | null
          status: string
          updated_at: string | null
          user_id: string | null
          valor: number
        }
        Insert: {
          cep: string
          cidade: string
          complemento?: string | null
          created_at?: string | null
          data_pagamento?: string | null
          documento_pago?: boolean | null
          endereco: string
          estado: string
          id?: string
          matricula?: string | null
          numero: string
          proprietario?: string | null
          status: string
          updated_at?: string | null
          user_id?: string | null
          valor: number
        }
        Update: {
          cep?: string
          cidade?: string
          complemento?: string | null
          created_at?: string | null
          data_pagamento?: string | null
          documento_pago?: boolean | null
          endereco?: string
          estado?: string
          id?: string
          matricula?: string | null
          numero?: string
          proprietario?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
          valor?: number
        }
        Relationships: []
      }
      investimentos: {
        Row: {
          created_at: string | null
          data_aplicacao: string
          data_vencimento: string | null
          id: string
          instituicao: string
          observacoes: string | null
          prazo_dias: number | null
          rentabilidade: number
          tipo: string
          updated_at: string | null
          user_id: string | null
          valor_aplicado: number
        }
        Insert: {
          created_at?: string | null
          data_aplicacao: string
          data_vencimento?: string | null
          id?: string
          instituicao: string
          observacoes?: string | null
          prazo_dias?: number | null
          rentabilidade: number
          tipo: string
          updated_at?: string | null
          user_id?: string | null
          valor_aplicado: number
        }
        Update: {
          created_at?: string | null
          data_aplicacao?: string
          data_vencimento?: string | null
          id?: string
          instituicao?: string
          observacoes?: string | null
          prazo_dias?: number | null
          rentabilidade?: number
          tipo?: string
          updated_at?: string | null
          user_id?: string | null
          valor_aplicado?: number
        }
        Relationships: []
      }
      leads: {
        Row: {
          contato: string
          created_at: string | null
          historico_interacoes: Json | null
          id: string
          nome: string
          observacoes: string | null
          origem: string
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          contato: string
          created_at?: string | null
          historico_interacoes?: Json | null
          id?: string
          nome: string
          observacoes?: string | null
          origem: string
          status: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          contato?: string
          created_at?: string | null
          historico_interacoes?: Json | null
          id?: string
          nome?: string
          observacoes?: string | null
          origem?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      motoristas: {
        Row: {
          caminhao_id: string | null
          cnh: string
          created_at: string | null
          id: string
          nome: string
          telefone: string
          updated_at: string | null
          user_id: string | null
          validade_cnh: string
        }
        Insert: {
          caminhao_id?: string | null
          cnh: string
          created_at?: string | null
          id?: string
          nome: string
          telefone: string
          updated_at?: string | null
          user_id?: string | null
          validade_cnh: string
        }
        Update: {
          caminhao_id?: string | null
          cnh?: string
          created_at?: string | null
          id?: string
          nome?: string
          telefone?: string
          updated_at?: string | null
          user_id?: string | null
          validade_cnh?: string
        }
        Relationships: [
          {
            foreignKeyName: "motoristas_caminhao_id_fkey"
            columns: ["caminhao_id"]
            isOneToOne: false
            referencedRelation: "caminhoes"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos_recibos: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          data_emissao: string
          data_vencimento: string | null
          id: string
          itens: Json
          numero: string
          observacoes: string | null
          processo_id: string | null
          status: string
          tipo: string
          updated_at: string | null
          user_id: string | null
          valor_total: number
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          data_emissao: string
          data_vencimento?: string | null
          id?: string
          itens: Json
          numero: string
          observacoes?: string | null
          processo_id?: string | null
          status: string
          tipo: string
          updated_at?: string | null
          user_id?: string | null
          valor_total: number
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          data_emissao?: string
          data_vencimento?: string | null
          id?: string
          itens?: Json
          numero?: string
          observacoes?: string | null
          processo_id?: string | null
          status?: string
          tipo?: string
          updated_at?: string | null
          user_id?: string | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_recibos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_recibos_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
        ]
      }
      processos: {
        Row: {
          andamento_atual: string | null
          cliente_id: string | null
          created_at: string | null
          data_inicial: string
          historico_andamentos: Json | null
          id: string
          numero_processo: string
          observacoes: string | null
          proximos_passos: string | null
          responsavel: string | null
          status: string
          tipo: string
          updated_at: string | null
          user_id: string | null
          valor_causa: number | null
        }
        Insert: {
          andamento_atual?: string | null
          cliente_id?: string | null
          created_at?: string | null
          data_inicial: string
          historico_andamentos?: Json | null
          id?: string
          numero_processo: string
          observacoes?: string | null
          proximos_passos?: string | null
          responsavel?: string | null
          status: string
          tipo: string
          updated_at?: string | null
          user_id?: string | null
          valor_causa?: number | null
        }
        Update: {
          andamento_atual?: string | null
          cliente_id?: string | null
          created_at?: string | null
          data_inicial?: string
          historico_andamentos?: Json | null
          id?: string
          numero_processo?: string
          observacoes?: string | null
          proximos_passos?: string | null
          responsavel?: string | null
          status?: string
          tipo?: string
          updated_at?: string | null
          user_id?: string | null
          valor_causa?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "processos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefas: {
        Row: {
          created_at: string | null
          data_vencimento: string
          descricao: string | null
          id: string
          observacoes: string | null
          prioridade: string
          responsavel: string | null
          status: string
          titulo: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data_vencimento: string
          descricao?: string | null
          id?: string
          observacoes?: string | null
          prioridade: string
          responsavel?: string | null
          status: string
          titulo: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data_vencimento?: string
          descricao?: string | null
          id?: string
          observacoes?: string | null
          prioridade?: string
          responsavel?: string | null
          status?: string
          titulo?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      transacoes: {
        Row: {
          area: string | null
          categoria: string
          created_at: string | null
          data: string
          descricao: string
          id: string
          observacoes: string | null
          tipo: string
          updated_at: string | null
          user_id: string | null
          valor: number
        }
        Insert: {
          area?: string | null
          categoria: string
          created_at?: string | null
          data: string
          descricao: string
          id?: string
          observacoes?: string | null
          tipo: string
          updated_at?: string | null
          user_id?: string | null
          valor: number
        }
        Update: {
          area?: string | null
          categoria?: string
          created_at?: string | null
          data?: string
          descricao?: string
          id?: string
          observacoes?: string | null
          tipo?: string
          updated_at?: string | null
          user_id?: string | null
          valor?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
