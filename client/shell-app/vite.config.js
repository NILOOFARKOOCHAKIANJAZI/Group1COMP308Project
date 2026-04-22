import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      federation({
        name: "shellApp",
        remotes: {
          authApp: env.VITE_AUTH_REMOTE,
          issueApp: env.VITE_ISSUE_REMOTE,
          communityApp: env.VITE_COMMUNITY_REMOTE,
          analyticsAdminApp: env.VITE_ANALYTICS_REMOTE,
        },
        shared: [
          "react",
          "react-dom",
          "@apollo/client",
          "graphql",
        ],
      }),
    ],
    server: {
      port: 3000,
      strictPort: true,
    },
    preview: {
      port: 3000,
      strictPort: true,
    },
    build: {
      modulePreload: false,
      target: "esnext",
      minify: false,
      cssCodeSplit: false,
    },
  };
});