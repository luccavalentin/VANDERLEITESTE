import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin } from "lucide-react";
import { formatarCEP, buscarEnderecoPorCEP } from "@/lib/validacoes";
import { notify } from "@/lib/toast-custom";

interface CEPInputProps {
  value: string;
  onChange: (cep: string) => void;
  onEnderecoEncontrado?: (endereco: {
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
  }) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function CEPInput({
  value,
  onChange,
  onEnderecoEncontrado,
  label = "CEP",
  placeholder = "00000-000",
  disabled = false,
}: CEPInputProps) {
  const [buscando, setBuscando] = useState(false);
  const [cepFormatado, setCepFormatado] = useState(value);

  useEffect(() => {
    setCepFormatado(formatarCEP(value));
  }, [value]);

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    onChange(cep);
  };

  const handleBuscarCEP = async () => {
    const cepLimpo = value.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      notify.warning("CEP inválido", "Digite um CEP com 8 dígitos");
      return;
    }

    setBuscando(true);
    try {
      const endereco = await buscarEnderecoPorCEP(cepLimpo);
      
      if (!endereco) {
        notify.error("Erro ao buscar CEP", "Não foi possível buscar o endereço");
        return;
      }

      if (endereco.erro) {
        notify.error("CEP não encontrado", "O CEP informado não foi encontrado");
        return;
      }

      if (onEnderecoEncontrado) {
        onEnderecoEncontrado(endereco);
      }

      notify.success("Endereço encontrado!", "Os dados foram preenchidos automaticamente");
    } catch (error) {
      notify.error("Erro ao buscar CEP", "Tente novamente mais tarde");
    } finally {
      setBuscando(false);
    }
  };

  // Busca automática quando o CEP tiver 8 dígitos
  useEffect(() => {
    const cepLimpo = value.replace(/\D/g, '');
    if (cepLimpo.length === 8 && !buscando) {
      const buscar = async () => {
        setBuscando(true);
        try {
          const endereco = await buscarEnderecoPorCEP(cepLimpo);
          
          if (!endereco) {
            return;
          }

          if (endereco.erro) {
            return;
          }

          if (onEnderecoEncontrado) {
            onEnderecoEncontrado(endereco);
          }

          notify.success("Endereço encontrado!", "Os dados foram preenchidos automaticamente");
        } catch (error) {
          // Silencioso - não mostra erro para busca automática
        } finally {
          setBuscando(false);
        }
      };
      buscar();
    }
  }, [value]);

  return (
    <div className="space-y-2">
      {label && <Label htmlFor="cep-input">{label}</Label>}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          id="cep-input"
          type="text"
          placeholder={placeholder}
          value={cepFormatado}
          onChange={handleCEPChange}
          maxLength={9}
          disabled={disabled || buscando}
          className="pl-10 pr-10"
        />
        {buscando && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Digite o CEP e o endereço será preenchido automaticamente
      </p>
    </div>
  );
}

