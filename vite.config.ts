import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    outDir: 'dist',  // Must match vercel.json
    sourcemap: true,
  },
  base: '/',  // Standard for Vercel
  optimizeDeps: {
    exclude: ['libsodium-wrappers']
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
})
