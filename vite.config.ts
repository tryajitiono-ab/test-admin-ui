import { devProxyPlugin } from '@accelbyte/sdk-extend-app-ui/plugins'
import { federation } from '@module-federation/vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.')

  return {
    base: mode === 'production' ? process.env.BASE_URL : '/',
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
      }),
      devProxyPlugin({ baseUrl: env.VITE_AGS_URL, redirectURI: env.VITE_AGS_REDIRECT_URI })
    ]
  }
})
