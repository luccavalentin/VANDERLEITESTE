"use client"

import * as React from "react"
import { Input } from "./input"
import { mascaraCPF, mascaraCNPJ, mascaraTelefone, mascaraCEP } from "@/lib/validations"

interface MaskedInputProps extends React.ComponentProps<typeof Input> {
  mask?: "cpf" | "cnpj" | "telefone" | "cep"
  onValueChange?: (value: string) => void
}

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, value, onChange, onValueChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let maskedValue = e.target.value

      if (mask === "cpf") {
        maskedValue = mascaraCPF(e.target.value)
      } else if (mask === "cnpj") {
        maskedValue = mascaraCNPJ(e.target.value)
      } else if (mask === "telefone") {
        maskedValue = mascaraTelefone(e.target.value)
      } else if (mask === "cep") {
        maskedValue = mascaraCEP(e.target.value)
      }

      e.target.value = maskedValue

      if (onChange) {
        onChange(e)
      }

      if (onValueChange) {
        onValueChange(maskedValue)
      }
    }

    return <Input ref={ref} value={value} onChange={handleChange} {...props} />
  },
)

MaskedInput.displayName = "MaskedInput"

export { MaskedInput }
