import { federation } from '@module-federation/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    base: mode === 'production' ? process.env.BASE_URL : '/',
    build: {
      modulePreload: false
    },
    plugins: [
      react(),
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
    ]
  }
})
