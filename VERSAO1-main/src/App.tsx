import { useState, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Sidebar } from "@/components/Layout/Sidebar";
import { Header } from "@/components/Layout/Header";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

// Lazy load pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Tarefas = lazy(() => import("./pages/Tarefas"));
const Clientes = lazy(() => import("./pages/Clientes"));
const Leads = lazy(() => import("./pages/Leads"));
const Processos = lazy(() => import("./pages/Processos"));
const OrcamentosRecibos = lazy(() => import("./pages/OrcamentosRecibos"));
const GestaoImoveis = lazy(() => import("./pages/GestaoImoveis"));
const EntradaCaixa = lazy(() => import("./pages/EntradaCaixa"));
const SaidaCaixa = lazy(() => import("./pages/SaidaCaixa"));
const DashboardCaixa = lazy(() => import("./pages/DashboardCaixa"));
const Gado = lazy(() => import("./pages/Gado"));
const Transportadora = lazy(() => import("./pages/Transportadora"));
const Financiamentos = lazy(() => import("./pages/Financiamentos"));
const Investimentos = lazy(() => import("./pages/Investimentos"));
const Relatorios = lazy(() => import("./pages/Relatorios"));
const Anotacoes = lazy(() => import("./pages/Anotacoes"));
const Placeholder = lazy(() => import("./pages/Placeholder"));

const App = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      dashboard: "Dashboard",
      tarefas: "Gestão de Tarefas",
      clientes: "Clientes",
      leads: "Leads",
      processos: "Processos",
      "orcamentos-recibos": "Orçamentos e Recibos",
      "gestao-imoveis": "Gestão de Imóveis",
      "entrada-caixa": "Entrada de Caixa",
      "saida-caixa": "Saída de Caixa",
      "dashboard-caixa": "Dashboard de Caixa",
      gado: "Gestão de Gado",
      transportadora: "Transportadora",
      financiamentos: "Financiamentos e Empréstimos",
      investimentos: "Investimentos",
      relatorios: "Relatórios",
      anotacoes: "Bloco de Anotações",
    };
    return titles[currentPage] || "Gerenciador Empresarial";
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "tarefas":
        return <Tarefas />;
      case "clientes":
        return <Clientes />;
      case "leads":
        return <Leads />;
      case "processos":
        return <Processos />;
      case "orcamentos-recibos":
        return <OrcamentosRecibos />;
      case "gestao-imoveis":
        return <GestaoImoveis />;
      case "entrada-caixa":
        return <EntradaCaixa />;
      case "saida-caixa":
        return <SaidaCaixa />;
      case "dashboard-caixa":
        return <DashboardCaixa />;
      case "gado":
        return <Gado />;
      case "transportadora":
        return <Transportadora />;
      case "financiamentos":
        return <Financiamentos />;
      case "investimentos":
        return <Investimentos />;
      case "relatorios":
        return <Relatorios />;
      case "anotacoes":
        return <Anotacoes />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="flex h-screen w-full overflow-hidden">
            <Sidebar
              currentPage={currentPage}
              onNavigate={(page) => {
                setCurrentPage(page);
                setSidebarOpen(false);
              }}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header
                title={getPageTitle()}
                onMenuClick={() => setSidebarOpen(true)}
              />
              <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center h-full">
                      <p className="text-lg text-muted-foreground">Carregando...</p>
                    </div>
                  }
                >
                  {renderPage()}
                </Suspense>
              </main>
            </div>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
