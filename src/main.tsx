import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./app/globals.scss";
import "./shared/i18n/i18n";
import App from "./app/App.tsx";

document.addEventListener(
  "touchstart",
  (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  },
  { passive: false }
);

document.addEventListener("gesturestart", (e) => {
  e.preventDefault();
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
