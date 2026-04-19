import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'analytics-admin-mf',
      filename: 'remoteEntry.js',
      exposes: {
        './AnalyticsAdminApp': './src/App.jsx',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  server: {
    port: 3003,
  },
  build: {
   modulePreload: false,
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
  },
})