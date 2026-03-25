import { federation } from '@module-federation/vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const PORT_STRING = process.env.PORT || '5173'
const PORT = Number(PORT_STRING)
process.env.VITE_PORT = PORT_STRING

const BASE_PATH = process.env.BASE_PATH || '/'
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`
const OUT_DIR = process.env.OUT_DIR || 'dist'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.')

  return {
    base: mode === 'production' ? `${BASE_URL}/` : BASE_PATH,
    build: {
      outDir: OUT_DIR,
      rollupOptions: {
        output: {
          // Mega cache busting.
          // entryFileNames: entry => {
          //   console.info('entry', entry.name)
          //   return `assets/[name]-[hash]-${Date.now()}.js`
          // },
          // chunkFileNames: entry => {
          //   if (entry.name === 'mf-entry') {
          //     return `assets/[name]-[hash].js`
          //   }
          //   console.info('chunk', entry.name)
          //   return `assets/[name]-[hash]-${Date.now()}.js`
          // },
          // assetFileNames: entry => {
          //   console.info('asset', entry.names)
          //   return `assets/[name]-[hash]-${Date.now()}.[ext]`
          // }
          entryFileNames: `assets/[name]-[hash].js`,
          chunkFileNames: `assets/[name]-[hash].js`,
          assetFileNames: `assets/[name]-[hash].[ext]`
        }
      }
    },
    plugins: [
      react(),
      tailwindcss(),
      federation({
        name: 'remote',
        filename: 'remoteEntry.js',
        manifest: true,
        exposes: {
          '.': './src/mf-entry.ts'
        },
        shared: {
          react: {},
          'react-dom': {},
          '@tanstack/react-query': {}
        }
      })
    ],
    server: {
      port: mode === 'development' ? PORT : undefined,
      proxy: {
        '/proxy': {
          target: env.VITE_AGS_URL,
          changeOrigin: true,
          rewrite(path) {
            return path.replace('/proxy', '')
          }
        }
      }
    }
  }
})
