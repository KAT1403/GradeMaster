import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./app/globals.scss";
import "./shared/i18n/i18n";
import App from "./app/App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
