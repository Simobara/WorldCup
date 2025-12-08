// vite.config.js o vite.config.ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // <<< Porta di sviluppo
    strictPort: true, // Fallisce se 3000 è occupata (utile per non confondersi)
    proxy: {
      "/api": {
        target: "http://localhost:5000", // Il tuo server backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 3000, // <<< Porta per `npm run preview` (build servita localmente)
    strictPort: true,
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
  },
});
