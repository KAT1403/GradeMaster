import { useEffect } from "react";
import { useUIStore } from "../shared/store/uiStore";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const theme = useUIStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return <>{children}</>;
};
