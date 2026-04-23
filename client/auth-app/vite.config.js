import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// set the config for the auth service with PORT 3001 and the shared dependencies for the micro frontends
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'auth-mf',
      filename: 'remoteEntry.js',
      exposes: {
        './AuthApp': './src/App.jsx',
      },
      shared: ['react', 'react-dom', '@apollo/client', 'graphql'],
    }),
  ],
  server: {
    port: 3001,
    strictPort: true,
  },
  preview: {
    port: 3001,
    strictPort: true,
  },
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
})