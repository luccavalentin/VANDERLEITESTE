import { Scale } from "lucide-react"

interface LogoProps {
  variant?: "full" | "icon"
  className?: string
}

export function Logo({ variant = "full", className = "" }: LogoProps) {
  if (variant === "icon") {
    return (
      <div className={`relative w-10 h-10 ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] to-[#10B981] rounded-lg flex items-center justify-center">
          <div className="flex items-center justify-center relative">
            <Scale className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] to-[#10B981] rounded-lg flex items-center justify-center shadow-lg">
          <div className="flex items-center justify-center relative">
            <Scale className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-foreground leading-tight">Gerenciador Empresarial</span>
      </div>
    </div>
  )
}

