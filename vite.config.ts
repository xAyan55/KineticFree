import path from "path"
import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
// @ts-ignore
import { handleAuthMiddleware } from "./server/auth.js"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  Object.assign(process.env, env)

  return {
    plugins: [
      react(),
      {
        name: "api-auth-server",
        configureServer(server) {
          server.middlewares.use(handleAuthMiddleware)
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "next/link": path.resolve(__dirname, "./src/components/ui/link.tsx"),
      },
    },
  }
})
