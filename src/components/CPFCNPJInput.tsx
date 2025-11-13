import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { validarCPF, validarCNPJ, formatarCPF, formatarCNPJ } from "@/lib/validacoes";

interface CPFCNPJInputProps {
  value: string;
  onChange: (valor: string) => void;
  tipo?: "cpf" | "cnpj" | "auto"; // auto detecta automaticamente
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  mostrarValidacao?: boolean; // Mostra ícone de validação
}

export function CPFCNPJInput({
  value,
  onChange,
  tipo = "auto",
  label = "CPF/CNPJ",
  placeholder = "000.000.000-00 ou 00.000.000/0000-00",
  disabled = false,
  mostrarValidacao = true,
}: CPFCNPJInputProps) {
  const [valorFormatado, setValorFormatado] = useState(value);
  const [valido, setValido] = useState<boolean | null>(null);
  const [tipoDetectado, setTipoDetectado] = useState<"cpf" | "cnpj" | null>(null);

  useEffect(() => {
    const valorLimpo = value.replace(/\D/g, '');
    
    if (valorLimpo.length === 0) {
      setValorFormatado('');
      setValido(null);
      setTipoDetectado(null);
      return;
    }

    // Detecta tipo automaticamente se for "auto"
    let tipoAtual = tipo;
    if (tipo === "auto") {
      if (valorLimpo.length <= 11) {
        tipoAtual = "cpf";
        setTipoDetectado("cpf");
      } else {
        tipoAtual = "cnpj";
        setTipoDetectado("cnpj");
      }
    } else {
      setTipoDetectado(tipo);
    }

    // Formata o valor
    if (tipoAtual === "cpf") {
      setValorFormatado(formatarCPF(value));
      if (valorLimpo.length === 11) {
        const isValid = validarCPF(value);
        setValido(isValid);
      } else {
        setValido(null);
      }
    } else {
      setValorFormatado(formatarCNPJ(value));
      if (valorLimpo.length === 14) {
        const isValid = validarCNPJ(value);
        setValido(isValid);
      } else {
        setValido(null);
      }
    }
  }, [value, tipo, mostrarValidacao]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, '');
    onChange(valor);
  };

  return (
    <div className="space-y-2">
      {label && <Label htmlFor="cpf-cnpj-input">{label}</Label>}
      <div className="relative">
        <Input
          id="cpf-cnpj-input"
          type="text"
          placeholder={placeholder}
          value={valorFormatado}
          onChange={handleChange}
          maxLength={tipo === "cnpj" ? 18 : tipo === "cpf" ? 14 : 18}
          disabled={disabled}
          className={`pr-10 ${
            valido === false ? "border-red-500 focus:border-red-500" : 
            valido === true ? "border-green-500 focus:border-green-500" : ""
          }`}
        />
        {mostrarValidacao && valido !== null && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {valido ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        )}
      </div>
      {tipoDetectado && (
        <p className="text-xs text-muted-foreground">
          Tipo detectado: <span className="font-semibold">{tipoDetectado.toUpperCase()}</span>
        </p>
      )}
      {valido === false && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {tipoDetectado === "cpf" ? "CPF inválido" : "CNPJ inválido"}
        </p>
      )}
      {valido === true && (
        <p className="text-xs text-green-500 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          {tipoDetectado === "cpf" ? "CPF válido" : "CNPJ válido"}
        </p>
      )}
    </div>
  );
}

