import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router'],
          'forms-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'icons-vendor': ['react-icons'],
          'export-pdf': ['jspdf', 'jspdf-autotable'],
          'export-xlsx': ['xlsx'],
        },
      },
    },
  },
})
