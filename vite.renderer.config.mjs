import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  root: './',
  base: './', // Important for Electron
  build: {
    outDir: path.resolve(__dirname, '.vite/renderer/main_window'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html')
    },
    sourcemap: process.env.NODE_ENV === 'development',
    // Ensure assets are properly handled
    assetsDir: 'assets',
    cssCodeSplit: false
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer')
    }
  },
  optimizeDeps: {
    exclude: ['electron']
  },
  server: {
    port: 5173,
    strictPort: true
  }
})