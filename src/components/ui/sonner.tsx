import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg rounded-xl",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toast]:bg-[#16A34A] group-[.toast]:text-white group-[.toast]:border-none",
          error: "group-[.toast]:bg-[#DC2626] group-[.toast]:text-white group-[.toast]:border-none group-[.toast]:animate-shake",
          warning: "group-[.toast]:bg-[#FACC15] group-[.toast]:text-gray-900 group-[.toast]:border-none",
          info: "group-[.toast]:bg-[#2563EB] group-[.toast]:text-white group-[.toast]:border-none",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };

