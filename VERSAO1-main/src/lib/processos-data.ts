export const areasDireito = {
  "civil": "Direito Civil",
  "familia": "Direito de Família",
  "imobiliario": "Direito Imobiliário",
  "trabalho": "Direito do Trabalho",
  "empresarial": "Direito Empresarial / Comercial",
  "penal": "Direito Penal",
  "administrativo": "Direito Administrativo / Público",
  "tributario": "Direito Tributário",
  "previdenciario": "Direito Previdenciário",
};

export const tiposAcao: Record<string, string[]> = {
  civil: [
    "Ação de Cobrança",
    "Ação de Indenização por Danos Morais",
    "Ação de Indenização por Danos Materiais",
    "Ação de Execução de Título Extrajudicial",
    "Ação de Consignação em Pagamento",
    "Ação Declaratória",
    "Ação Anulatória",
    "Ação de Usucapião",
    "Ação de Reintegração de Posse",
    "Ação de Manutenção de Posse",
    "Ação de Busca e Apreensão",
    "Ação Revisional de Contrato",
    "Ação de Rescisão Contratual",
    "Ação de Cumprimento de Contrato",
  ],
  familia: [
    "Ação de Divórcio",
    "Ação de Separação Judicial",
    "Ação de Guarda e Responsabilidade",
    "Ação de Regulamentação de Visitas",
    "Ação de Alimentos",
    "Ação de Exoneração de Alimentos",
    "Ação de Investigação de Paternidade",
    "Adoção",
    "Interdição / Curatela",
  ],
  imobiliario: [
    "Ação de Despejo",
    "Ação Renovatória de Locação",
    "Ação Revisional de Aluguel",
    "Ação de Nunciação de Obra Nova",
  ],
  trabalho: [
    "Reclamação Trabalhista",
    "Ação de Reconhecimento de Vínculo Empregatício",
    "Ação de Cobrança de Verbas Rescisórias",
    "Ação de Danos Morais Trabalhistas",
    "Ação de Equiparação Salarial",
  ],
  empresarial: [
    "Ação de Falência",
    "Ação de Recuperação Judicial",
    "Ação de Dissolução de Sociedade",
    "Ação de Execução Fiscal",
    "Ação Monitória",
    "Ação de Prestação de Contas",
  ],
  penal: [
    "Ação Penal Pública",
    "Ação Penal Privada",
    "Queixa-Crime",
    "Habeas Corpus",
    "Revisão Criminal",
  ],
  administrativo: [
    "Mandado de Segurança",
    "Ação Popular",
    "Ação Civil Pública",
    "Ação de Improbidade Administrativa",
    "Ação contra o Estado",
  ],
  tributario: [
    "Ação Anulatória de Débito Fiscal",
    "Ação Declaratória de Inexistência de Relação Jurídico-Tributária",
    "Ação de Repetição de Indébito",
    "Mandado de Segurança Tributário",
  ],
  previdenciario: [
    "Ação de Concessão de Benefício",
    "Ação Revisional de Benefício",
    "Ação de Restabelecimento de Benefício",
    "Ação contra o INSS",
  ],
};

export const statusProcesso = [
  "em_andamento",
  "encerrado",
  "suspenso",
  "arquivado",
  "extinto",
];

export const faseProcessual = [
  "distribuido",
  "aguardando_citacao",
  "citado",
  "em_contestacao",
  "em_instrucao",
  "concluso_decisao",
  "sentenciado",
  "em_recurso",
  "aguardando_transito",
];

export const resultadoCausa = [
  "causa_ganha",
  "causa_perdida",
  "causa_parcialmente_procedente",
  "causa_indeferida",
  "causa_extinta_sem_julgamento",
  "causa_arquivada",
  "causa_suspensa",
  "causa_em_andamento",
  "causa_acordo_homologado",
  "causa_transitada_julgado",
  "causa_anulada",
  "causa_improcedente",
  "causa_procedente",
  "causa_remessa_necessaria",
  "causa_grau_recurso",
];

export const formatarStatus = (status: string) => {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const recorrencias = [
  { value: "semanal", label: "Semanal" },
  { value: "quinzenal", label: "Quinzenal" },
  { value: "mensal", label: "Mensal" },
  { value: "anual", label: "Anual" },
];
