import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Add a dev-time proxy to Hugging Face so the browser avoids CORS.
// Reads VITE_HF_TOKEN from your .env.local.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const hfToken = env.VITE_HF_TOKEN;

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: hfToken
        ? {
            "/api/ai": {
              target: "https://api-inference.huggingface.co",
              changeOrigin: true,
              secure: true,
              rewrite: (path) => path.replace(/^\/api\/ai/, "/v1/chat/completions"),
              configure: (proxy) => {
                proxy.on("proxyReq", (proxyReq) => {
                  proxyReq.setHeader("Authorization", `Bearer ${hfToken}`);
                  proxyReq.setHeader("Content-Type", "application/json");
                });
              },
            },
          }
        : undefined,
    },
  };
});
