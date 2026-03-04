import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
import tailwindcss from '@tailwindcss/vite';

const PORT_STRING = process.env.PORT || '3001';
const PORT = Number(PORT_STRING);
process.env.VITE_PORT = PORT_STRING;

const BASE_PATH = process.env.BASE_PATH || '/';
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}/`;

// https://vite.dev/config/
export default defineConfig({
  base: BASE_PATH,
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'remote',
      filename: 'remoteEntry.js',
      publicPath: `${BASE_URL}/remoteEntry.js`,
      manifest: true,
      dts: true,
      exposes: {
        '.': './src/module.tsx'
      }
    })
  ]
});
