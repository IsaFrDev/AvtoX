import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      injectRegister: 'auto',
      registerType: 'autoUpdate',
      manifest: {
        name: 'Savdogar',
        short_name: 'Savdogar',
        description: 'Sayohat agentliklari platformasi',
        theme_color: '#020617',
        icons: [
          {
            src: '/favicon.jpeg',
            sizes: '192x192',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
