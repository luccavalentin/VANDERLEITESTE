import { Moon, Sun, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export const Header = ({ title, onMenuClick }: HeaderProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 h-14 sm:h-16 border-b border-border bg-background px-3 sm:px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-base sm:text-xl md:text-2xl font-bold text-foreground truncate">{title}</h1>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
        ) : (
          <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </Button>
    </header>
  );
};

