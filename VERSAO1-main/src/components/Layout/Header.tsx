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
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">{title}</h1>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>
    </header>
  );
};
