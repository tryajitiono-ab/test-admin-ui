import { federation } from '@module-federation/vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const PORT_STRING = process.env.PORT || '5173'
const PORT = Number(PORT_STRING)
process.env.VITE_PORT = PORT_STRING

const BASE_PATH = process.env.BASE_PATH || '/'
// const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.')

  return {
    base: BASE_PATH,
    plugins: [
      react(),
      tailwindcss(),
      federation({
        name: 'remote',
        filename: 'remoteEntry.js',
        manifest: true,
        exposes: {
          '.': './src/module.tsx'
        },
        ...(mode === 'development' && {
          shared: {
            '@tanstack/react-query': { singleton: true }
          }
        })
      })
    ],
    server: {
      port: PORT,
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
