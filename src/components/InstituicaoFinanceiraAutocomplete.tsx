import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, X, Building2, CreditCard, TrendingUp, Users } from "lucide-react";
import { INSTITUICOES_FINANCEIRAS, InstituicaoFinanceira } from "@/lib/instituicoes-financeiras";
import * as LucideIcons from "lucide-react";

interface InstituicaoFinanceiraAutocompleteProps {
  value: string;
  onChange: (instituicao: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

const getIconComponent = (iconName: string) => {
  const IconComponent = (LucideIcons as any)[iconName] || Building2;
  return IconComponent;
};

export function InstituicaoFinanceiraAutocomplete({
  value,
  onChange,
  label = "Banco/Instituição",
  required = false,
  placeholder = "Digite o nome da instituição...",
}: InstituicaoFinanceiraAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Buscar a instituição selecionada
  const instituicaoSelecionada = INSTITUICOES_FINANCEIRAS.find(inst => inst.nome === value);

  // Filtrar instituições baseado no termo de busca
  const instituicoesFiltradas = INSTITUICOES_FINANCEIRAS.filter(inst =>
    inst.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.codigo.includes(searchTerm)
  );

  // Atualizar o campo de busca quando a instituição selecionada mudar
  useEffect(() => {
    if (instituicaoSelecionada) {
      setSearchTerm(instituicaoSelecionada.nome);
    } else if (!value) {
      setSearchTerm("");
    }
  }, [value, instituicaoSelecionada]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        // Restaurar o nome da instituição selecionada se houver
        if (instituicaoSelecionada && searchTerm !== instituicaoSelecionada.nome) {
          setSearchTerm(instituicaoSelecionada.nome);
        } else if (!value) {
          setSearchTerm("");
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchTerm, instituicaoSelecionada, value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsOpen(term.length > 0);
    
    // Se o usuário apagar tudo, limpar a seleção
    if (term.length === 0) {
      onChange("");
    }
  };

  const handleSelectInstituicao = (instituicao: InstituicaoFinanceira) => {
    onChange(instituicao.nome);
    setSearchTerm(instituicao.nome);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchTerm("");
    onChange("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'fintech':
        return CreditCard;
      case 'corretora':
        return TrendingUp;
      case 'cooperativa':
        return Users;
      default:
        return Building2;
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor="instituicao-autocomplete">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            id="instituicao-autocomplete"
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => {
              if (searchTerm.length > 0) {
                setIsOpen(true);
              }
            }}
            className="pl-10 pr-10"
            required={required}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Dropdown de sugestões */}
        {isOpen && searchTerm.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {instituicoesFiltradas.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                👉 Nenhuma instituição encontrada.
              </div>
            ) : (
              <ul className="py-1">
                {instituicoesFiltradas.map((instituicao) => {
                  const IconComponent = getIconComponent(instituicao.icone);
                  const TipoIcon = getTipoIcon(instituicao.tipo);
                  return (
                    <li
                      key={instituicao.codigo}
                      onClick={() => handleSelectInstituicao(instituicao)}
                      className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors flex items-center gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5 text-primary" />
                        <TipoIcon className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="font-medium">{instituicao.nome}</span>
                        <span className="text-xs text-muted-foreground">
                          Código: {instituicao.codigo} • {instituicao.tipo}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


