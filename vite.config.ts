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
    base: BASE_PATH,
    build: {
      outDir: OUT_DIR
    },
    plugins: [
      react(),
      tailwindcss(),
      federation({
        name: 'remote',
        filename: 'remoteEntry.js',
        publicPath: mode === 'production' ? `${BASE_URL}/` : undefined,
        manifest: true,
        exposes: {
          '.': './src/mf-entry.ts'
        },
        shared: {
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
