import { useState, Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Sidebar } from "@/components/Layout/Sidebar";
import { Header } from "@/components/Layout/Header";
import { TarefasAlerta } from "@/components/TarefasAlerta";
import { verificarNecessidadeBackup, gerarBackupExcel } from "@/lib/backup-service";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
      refetchOnMount: false,
    },
  },
});

// Lazy load pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Tarefas = lazy(() => import("./pages/Tarefas"));
const Clientes = lazy(() => import("./pages/Clientes"));
const Leads = lazy(() => import("./pages/Leads"));
const Processos = lazy(() => import("./pages/Processos"));
const MapeamentoEstrategico = lazy(() => import("./pages/MapeamentoEstrategico"));
const OrcamentosRecibos = lazy(() => import("./pages/OrcamentosRecibos"));
const FollowUpCliente = lazy(() => import("./pages/FollowUpCliente"));
const GestaoImoveis = lazy(() => import("./pages/GestaoImoveis"));
const ImoveisLocacao = lazy(() => import("./pages/ImoveisLocacao"));
const EntradaCaixa = lazy(() => import("./pages/EntradaCaixa"));
const SaidaCaixa = lazy(() => import("./pages/SaidaCaixa"));
const DashboardCaixa = lazy(() => import("./pages/DashboardCaixa"));
const Gado = lazy(() => import("./pages/Gado"));
const Transportadora = lazy(() => import("./pages/Transportadora"));
const Financiamentos = lazy(() => import("./pages/Financiamentos"));
const Investimentos = lazy(() => import("./pages/Investimentos"));
const Relatorios = lazy(() => import("./pages/Relatorios"));
const Anotacoes = lazy(() => import("./pages/Anotacoes"));
const TesteConexao = lazy(() => import("./pages/TesteConexao"));
const Backup = lazy(() => import("./pages/Backup"));

const App = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      setCurrentPage(event.detail);
    };

    window.addEventListener('navigate', handleNavigate as EventListener);
    return () => {
      window.removeEventListener('navigate', handleNavigate as EventListener);
    };
  }, []);

  // Verifica necessidade de backup automático ao carregar
  useEffect(() => {
    const verificarBackup = async () => {
      // Aguarda um pouco para não interferir no carregamento inicial
      setTimeout(async () => {
        if (verificarNecessidadeBackup()) {
          console.log('Backup automático necessário. Gerando backup...');
          await gerarBackupExcel();
        }
      }, 3000); // Aguarda 3 segundos após carregar
    };

    verificarBackup();
  }, []);

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      dashboard: "Dashboard",
      tarefas: "Gestão de Tarefas",
      clientes: "Clientes",
      leads: "Leads",
      processos: "Processos",
      "mapeamento-estrategico": "Mapeamento Estratégico",
      "follow-up-cliente": "Follow-up de Cliente",
      "orcamentos-recibos": "Orçamentos e Recibos",
      "imoveis-locacao": "Imóveis de Locação",
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
      "teste-conexao": "Teste de Conexão",
      backup: "Backup do Sistema",
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
      case "mapeamento-estrategico":
        return <MapeamentoEstrategico />;
      case "orcamentos-recibos":
        return <OrcamentosRecibos />;
      case "follow-up-cliente":
        return <FollowUpCliente />;
      case "imoveis-locacao":
        return <ImoveisLocacao />;
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
      case "teste-conexao":
        return <TesteConexao />;
      case "backup":
        return <Backup />;
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
              <main className="flex-1 overflow-y-auto bg-background p-2 sm:p-4 md:p-6 relative">
                <TarefasAlerta />
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center h-full">
                      <p className="text-sm sm:text-lg text-muted-foreground">Carregando...</p>
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

