import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// set the config for the analytics admin service with PORT 3004 and the shared dependencies for the micro frontends
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'analyticsAdminApp',
      filename: 'remoteEntry.js',
      exposes: {
        './AnalyticsAdminApp': './src/App.jsx',
      },
      shared: ['react', 'react-dom', '@apollo/client', 'graphql'],
    }),
  ],
  server: {
    port: 3004,
    strictPort: true,
  },
  preview: {
    port: 3004,
    strictPort: true,
  },
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
})