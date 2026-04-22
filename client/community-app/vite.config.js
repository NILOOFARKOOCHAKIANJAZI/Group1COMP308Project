import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'community-mf',
      filename: 'remoteEntry.js',
      exposes: {
        './CommunityApp': './src/App.jsx',
      },
      shared: [
        'react',
        'react-dom',
        '@apollo/client',
        'graphql'
      ],
    }),
  ],
  server: {
    port: 3003,
    strictPort: true,
  },
  preview: {
    port: 3003,
    strictPort: true,
  },
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
})