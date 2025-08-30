import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa'; // <-- Import the plugin

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    // Add the PWA plugin here
    VitePWA({
      registerType: 'autoUpdate', // Automatically update the service worker
      devOptions: {
        enabled: true // Enable PWA in development mode
      },
      manifest: {
        name: 'My Access Hub',
        short_name: 'AccessHub',
        description: 'Your application description',
        theme_color: '#ffffff',
        icons: [
          {
            src: '\Myaccesslogobgr.png', // <-- Your 192x192 icon in the 'public' folder
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '\myaccessRBG.png', // <-- Your 512x512 icon in the 'public' folder
            sizes: '512x512',
            type: 'image/png'
          },
          
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));