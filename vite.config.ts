import { federation } from '@module-federation/vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import cookie from 'cookie'
import httpProxy from 'http-proxy'
import type { IncomingMessage } from 'node:http'
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
      {
        name: 'dynamic-proxy',
        configureServer(server) {
          const proxy = httpProxy.createProxyServer({
            changeOrigin: true,
            // For localhost, we need at least TWO dots in the domain name in order to take advantage of subdomain cookie.
            cookieDomainRewrite: 'localhost'
          })

          server.httpServer?.on('close', () => proxy.close())

          // The '/api' prefix is automatically stripped from req.url by the middleware mount point.
          server.middlewares.use('/proxy', (req, res) => {
            const { target, referer } = getTargetAndReferer(req, env)
            req.headers.referer = referer

            proxy.web(req, res, { target }, err => {
              if (err) {
                console.error('Proxy error:', err)
                res.writeHead(502)
                res.end('Bad gateway')
              }
            })
          })
        }
      }
    ]
  }
})

function getTargetAndReferer(req: IncomingMessage, env: Record<string, string>) {
  let target = env.VITE_AGS_URL
  let referer = env.VITE_AGS_REDIRECT_URI

  try {
    const cookieHeader = req.headers.cookie
    if (cookieHeader) {
      const parsedCookie = cookie.parse(cookieHeader as string)
      const accessToken = parsedCookie.access_token

      // When we have access token, we want to ensure we have the right Referer header.
      if (!accessToken) return { target, referer }

      const [, tokenPayload] = accessToken.split('.')
      const { namespace } = JSON.parse(Buffer.from(tokenPayload, 'base64').toString())

      referer = `http://${namespace}.${new URL(env.VITE_AGS_REDIRECT_URI!).host}`
      target = env.VITE_AGS_URL
    }
  } catch (err) {
    console.error('Failed to parse JWT for proxy target:', err)
  }

  return { target, referer }
}
