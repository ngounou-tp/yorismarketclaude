/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { SUPABASE_PROJECT_URL } from "./src/lib/supabaseDefaults.js";

const HTML_SUPABASE_PLACEHOLDER = "__YORIX_SUPABASE_ORIGIN__";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const supabaseUrl = (env.VITE_SUPABASE_URL || SUPABASE_PROJECT_URL || "").trim();

  return {
    plugins: [
      react(),
      {
        name: "html-env-supabase-preconnect",
        transformIndexHtml(html) {
          if (!supabaseUrl) return html;
          return html.replaceAll(HTML_SUPABASE_PLACEHOLDER, supabaseUrl);
        },
      },
    ],
    build: {
      target: "es2020",
      chunkSizeWarningLimit: 680,
      cssCodeSplit: true,
      reportCompressedSize: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) return "react";
            if (id.includes("node_modules/@supabase")) return "supabase";
            if (id.includes("node_modules/i18next") || id.includes("node_modules/react-i18next")) return "i18n";
            if (id.includes("node_modules/react-router")) return "router";
          },
        },
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      include: ["src/**/__tests__/**/*.test.js"],
    },
  };
});
