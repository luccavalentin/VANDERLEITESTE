/**
 * Utilitários para validação de CPF, CNPJ e CEP
 */

/**
 * Valida CPF
 * @param cpf - CPF a ser validado (com ou sem formatação)
 * @returns true se válido, false caso contrário
 */
export function validarCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cpfLimpo = cpf.replace(/\D/g, '');

  // Verifica se tem 11 dígitos
  if (cpfLimpo.length !== 11) return false;

  // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

  // Validação dos dígitos verificadores
  let soma = 0;
  let resto: number;

  // Valida primeiro dígito
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;

  // Valida segundo dígito
  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;

  return true;
}

/**
 * Valida CNPJ
 * @param cnpj - CNPJ a ser validado (com ou sem formatação)
 * @returns true se válido, false caso contrário
 */
export function validarCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  const cnpjLimpo = cnpj.replace(/\D/g, '');

  // Verifica se tem 14 dígitos
  if (cnpjLimpo.length !== 14) return false;

  // Verifica se todos os dígitos são iguais (ex: 11.111.111/1111-11)
  if (/^(\d)\1{13}$/.test(cnpjLimpo)) return false;

  // Validação dos dígitos verificadores
  let tamanho = cnpjLimpo.length - 2;
  let numeros = cnpjLimpo.substring(0, tamanho);
  const digitos = cnpjLimpo.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  // Valida primeiro dígito
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  // Valida segundo dígito
  tamanho = tamanho + 1;
  numeros = cnpjLimpo.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;

  return true;
}

/**
 * Formata CPF (000.000.000-00)
 */
export function formatarCPF(cpf: string): string {
  const cpfLimpo = cpf.replace(/\D/g, '');
  if (cpfLimpo.length !== 11) return cpf;
  return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata CNPJ (00.000.000/0000-00)
 */
export function formatarCNPJ(cnpj: string): string {
  const cnpjLimpo = cnpj.replace(/\D/g, '');
  if (cnpjLimpo.length !== 14) return cnpj;
  return cnpjLimpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Formata CEP (00000-000)
 */
export function formatarCEP(cep: string): string {
  const cepLimpo = cep.replace(/\D/g, '');
  if (cepLimpo.length !== 8) return cep;
  return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
}

/**
 * Busca endereço pelo CEP usando ViaCEP
 */
export async function buscarEnderecoPorCEP(cep: string): Promise<{
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
} | null> {
  const cepLimpo = cep.replace(/\D/g, '');
  
  if (cepLimpo.length !== 8) {
    return null;
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const data = await response.json();

    if (data.erro) {
      return { erro: true } as any;
    }

    return {
      logradouro: data.logradouro || '',
      complemento: data.complemento || '',
      bairro: data.bairro || '',
      localidade: data.localidade || '',
      uf: data.uf || '',
    };
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
}


