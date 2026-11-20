import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // listen on IPv4 and IPv6 so both http://localhost and http://127.0.0.1 work
  // /api goes to the LBC server (server/, `npm run server`), which talks to PostgreSQL
  server: { host: true, proxy: { '/api': 'http://localhost:8787' } },
  preview: { host: true, proxy: { '/api': 'http://localhost:8787' } },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three'
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion')) return 'motion'
          if (id.includes('node_modules/react')) return 'react'
        },
      },
    },
  },
})
