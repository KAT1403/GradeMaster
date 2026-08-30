import { useEffect } from "react";
import { useUIStore } from "../shared/store/uiStore";

const THEME_COLORS = {
  light: "#fbfcff",
  dark: "#020617",
} as const;

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const theme = useUIStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    if (meta) meta.content = THEME_COLORS[theme];
  }, [theme]);

  return <>{children}</>;
};
