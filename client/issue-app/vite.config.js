import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

// set the config for the issue service with PORT 3002 and the shared dependencies for the micro frontends
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "issueApp",
      filename: "remoteEntry.js",
      exposes: {
        "./IssueApp": "./src/bootstrap.jsx",
      },
      shared: [
        "react",
        "react-dom",
        "react-router-dom",
        "@apollo/client",
        "graphql",
      ],
    }),
  ],
  server: {
    port: 3002,
    strictPort: true,
  },
  preview: {
    port: 3002,
    strictPort: true,
  },
  build: {
    modulePreload: false,
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
  },
});