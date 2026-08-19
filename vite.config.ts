import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) return 'vendor-charts'
          if (id.includes('@react-oauth') || id.includes('jwt-decode')) return 'vendor-auth'
          if (id.includes('react-dom') || id.includes('react-router')) return 'vendor-react'
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Précache tous les assets du build
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
        // Cache stratégie réseau-first pour les appels API
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api-daoukro\.akdev\.ci\/api/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 h
              },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
      // Génère automatiquement manifest.webmanifest
      manifest: {
        name: 'Daoukro Pro',
        short_name: 'Daoukro Pro',
        description:
          'Déposez votre fiche artisan, hébergement, bien immobilier ou annonce — visible dans l\'app Daoukro Digital après validation.',
        theme_color: '#145217',
        background_color: '#fafaf7',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'fr',
        categories: ['business', 'productivity'],
        icons: [
          {
            src: '/icon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        screenshots: [],
      },
      // Injecte automatiquement le lien vers le manifest dans index.html
      injectRegister: 'auto',
      devOptions: {
        enabled: true, // permet de tester le SW en dev
      },
    }),
  ],
})
