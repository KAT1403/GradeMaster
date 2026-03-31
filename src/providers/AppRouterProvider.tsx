import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";

type Props = { children: ReactNode };

export default function AppRouterProvider({ children }: Props) {
  return <BrowserRouter>{children}</BrowserRouter>;
}