import AppRouterProvider from "../providers/AppRouterProvider";
import { ThemeProvider } from "../providers/ThemeProvider";
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
  return (
    <ThemeProvider>
      <AppRouterProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
        <Analytics />
        <SpeedInsights />
      </AppRouterProvider>
    </ThemeProvider>
  );
}

export default App;