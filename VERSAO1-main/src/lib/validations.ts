// Validações e formatações

export const validarCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]/g, "")

  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false

  let soma = 0
  for (let i = 0; i < 9; i++) {
    soma += Number.parseInt(cpf.charAt(i)) * (10 - i)
  }
  let resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== Number.parseInt(cpf.charAt(9))) return false

  soma = 0
  for (let i = 0; i < 10; i++) {
    soma += Number.parseInt(cpf.charAt(i)) * (11 - i)
  }
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== Number.parseInt(cpf.charAt(10))) return false

  return true
}

export const validarCNPJ = (cnpj: string): boolean => {
  cnpj = cnpj.replace(/[^\d]/g, "")

  if (cnpj.length !== 14) return false
  if (/^(\d)\1{13}$/.test(cnpj)) return false

  let tamanho = cnpj.length - 2
  let numeros = cnpj.substring(0, tamanho)
  const digitos = cnpj.substring(tamanho)
  let soma = 0
  let pos = tamanho - 7

  for (let i = tamanho; i >= 1; i--) {
    soma += Number.parseInt(numeros.charAt(tamanho - i)) * pos--
    if (pos < 2) pos = 9
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado !== Number.parseInt(digitos.charAt(0))) return false

  tamanho = tamanho + 1
  numeros = cnpj.substring(0, tamanho)
  soma = 0
  pos = tamanho - 7

  for (let i = tamanho; i >= 1; i--) {
    soma += Number.parseInt(numeros.charAt(tamanho - i)) * pos--
    if (pos < 2) pos = 9
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado !== Number.parseInt(digitos.charAt(1))) return false

  return true
}

export const validarEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export const formatarCPF = (cpf: string): string => {
  cpf = cpf.replace(/[^\d]/g, "")
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

export const formatarCNPJ = (cnpj: string): string => {
  cnpj = cnpj.replace(/[^\d]/g, "")
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
}

export const formatarTelefone = (telefone: string): string => {
  telefone = telefone.replace(/[^\d]/g, "")
  if (telefone.length === 11) {
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  } else if (telefone.length === 10) {
    return telefone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
  }
  return telefone
}

export const formatarCEP = (cep: string): string => {
  cep = cep.replace(/[^\d]/g, "")
  return cep.replace(/(\d{5})(\d{3})/, "$1-$2")
}

export const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor)
}

// Máscara de input para CPF
export const mascaraCPF = (value: string): string => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1")
    .substring(0, 14) // Limit to CPF format length
}

// Máscara de input para CNPJ
export const mascaraCNPJ = (value: string): string => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1")
    .substring(0, 18) // Limit to CNPJ format length
}

// Máscara de input para Telefone
export const mascaraTelefone = (value: string): string => {
  const cleaned = value.replace(/\D/g, "")

  // Handle both mobile (11 digits) and landline (10 digits)
  if (cleaned.length <= 10) {
    return cleaned
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1")
  } else {
    return cleaned
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1")
      .substring(0, 15) // Limit to phone format length
  }
}

// Máscara de input para CEP
export const mascaraCEP = (value: string): string => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{3})\d+?$/, "$1")
    .substring(0, 9) // Limit to CEP format length
}

export const buscarCEP = async (
  cep: string,
): Promise<{
  logradouro: string
  localidade: string
  uf: string
  erro?: boolean
} | null> => {
  try {
    const cepLimpo = cep.replace(/[^\d]/g, "")
    if (cepLimpo.length !== 8) return null

    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
    const data = await response.json()

    if (data.erro) return null

    return {
      logradouro: data.logradouro || "",
      localidade: data.localidade || "",
      uf: data.uf || "",
    }
  } catch (error) {
    console.error("Erro ao buscar CEP:", error)
    return null
  }
}
