import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "GradeMaster",
        short_name: "GradeMaster",
        description: "Расчет GPA и прогнозирование оценок",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "Logo-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "Logo-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "Logo-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
