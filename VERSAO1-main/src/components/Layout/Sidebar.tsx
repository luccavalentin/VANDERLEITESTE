"use client"

import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Phone,
  Scale,
  FileText,
  Home,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Beef,
  Truck,
  CreditCard,
  LineChart,
  BarChart3,
  StickyNote,
  ChevronDown,
  ChevronRight,
  Building2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Logo } from "@/components/Logo"

interface SidebarProps {
  currentPage: string
  onNavigate: (page: string) => void
  isOpen: boolean
  onClose: () => void
}

interface MenuItem {
  id: string
  label: string
  icon: any
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tarefas", label: "Gestão de Tarefas", icon: CheckSquare },
  {
    id: "escritorio",
    label: "Escritório",
    icon: Building2,
    children: [
      { id: "clientes", label: "Clientes", icon: Users },
      { id: "leads", label: "Leads", icon: Phone },
      { id: "processos", label: "Processos", icon: Scale },
      { id: "orcamentos-recibos", label: "Orçamentos e Recibos", icon: FileText },
    ],
  },
  {
    id: "imoveis",
    label: "Imóveis",
    icon: Home,
    children: [{ id: "gestao-imoveis", label: "Gestão de Imóveis", icon: Home }],
  },
  {
    id: "caixa",
    label: "Meu Fluxo de Caixa",
    icon: DollarSign,
    children: [
      { id: "entrada-caixa", label: "Entrada", icon: TrendingUp },
      { id: "saida-caixa", label: "Saída", icon: TrendingDown },
      { id: "dashboard-caixa", label: "Dashboard", icon: PieChart },
    ],
  },
  {
    id: "gado-menu",
    label: "Gado",
    icon: Beef,
    children: [{ id: "gado", label: "Gestão de Gado", icon: Beef }],
  },
  {
    id: "transportadora-menu",
    label: "VEDD (Transportadora)",
    icon: Truck,
    children: [{ id: "transportadora", label: "Gestão da Transportadora", icon: Truck }],
  },
  {
    id: "financiamentos-menu",
    label: "Financiamentos e Empréstimos",
    icon: CreditCard,
    children: [{ id: "financiamentos", label: "Contratos de Crédito", icon: CreditCard }],
  },
  {
    id: "investimentos-menu",
    label: "Investimentos",
    icon: LineChart,
    children: [{ id: "investimentos", label: "Investimentos", icon: LineChart }],
  },
  {
    id: "relatorios-menu",
    label: "Relatórios",
    icon: BarChart3,
    children: [{ id: "relatorios", label: "Relatórios", icon: BarChart3 }],
  },
  { id: "anotacoes", label: "Bloco de Anotações", icon: StickyNote },
]

export const Sidebar = ({ currentPage, onNavigate, isOpen, onClose }: SidebarProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.id)
    const isActive = currentPage === item.id
    const hasActiveChild = item.children?.some((child) => child.id === currentPage)

    if (hasChildren) {
      return (
        <div key={item.id} className="space-y-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2 transition-all duration-200",
              level > 0 && "ml-4",
              hasActiveChild && "bg-accent border-l-4 border-primary",
            )}
            onClick={() => toggleExpand(item.id)}
          >
            <item.icon className="h-5 w-5" />
            <span className="flex-1 text-left">{item.label}</span>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          {isExpanded && (
            <div className="space-y-1 animate-fade-in">
              {item.children.map((child) => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Button
        key={item.id}
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 transition-all duration-200",
          level > 0 && "ml-4",
          isActive
            ? "bg-accent border-l-4 border-primary font-semibold shadow-sm translate-x-0.5"
            : "hover:bg-accent hover:border-l-4 hover:border-primary hover:shadow-sm hover:translate-x-0.5",
        )}
        onClick={() => onNavigate(item.id)}
      >
        <item.icon className="h-5 w-5" />
        <span>{item.label}</span>
      </Button>
    )
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />}

      <div
        className={cn(
          "fixed md:sticky top-0 left-0 w-64 h-screen bg-sidebar-background border-r border-sidebar-border flex flex-col z-50 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="p-4 border-b border-sidebar-border">
          <Logo variant="full" />
        </div>
        <ScrollArea className="flex-1 p-4">
          <nav className="space-y-2">{menuItems.map((item) => renderMenuItem(item))}</nav>
        </ScrollArea>
      </div>
    </>
  )
}
