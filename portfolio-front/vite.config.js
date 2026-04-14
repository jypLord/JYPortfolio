import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/autoInvest": {
        target: "https://api.jyportfolio.site",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
