import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import fs from 'fs'

const apkPlugin = (): Plugin => ({
  name: 'apk-mime-middleware',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = req.url?.split('?')[0]
      if (url === '/rishabh-tech.apk' || url === '/dashboard/rishabh-tech.apk') {
        const filePath = path.resolve(__dirname, 'public/rishabh-tech.apk')
        if (fs.existsSync(filePath)) {
          res.setHeader('Content-Type', 'application/vnd.android.package-archive')
          res.setHeader('Content-Disposition', 'attachment; filename="rishabh-tech.apk"')
          fs.createReadStream(filePath).pipe(res)
          return
        }
      }
      next()
    })
  },
})

// Middleware to redirect root / to /dashboard/ in local dev
const devRedirectPlugin = (): Plugin => ({
  name: 'dev-redirect-plugin',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const originalUrl = req.url || '/'
      const pathname = originalUrl.split('?')[0]
      const search = originalUrl.includes('?') ? originalUrl.slice(originalUrl.indexOf('?')) : ''

      // If accessing root or non-dashboard public paths directly in local dev
      if (pathname === '/' || pathname === '') {
        res.writeHead(302, { Location: `/dashboard/${search}` })
        res.end()
        return
      }

      // If user typed e.g. /students or /ipolist instead of /dashboard/students
      const isInternal = pathname.startsWith('/@') || 
                         pathname.startsWith('/src') || 
                         pathname.startsWith('/node_modules') || 
                         pathname.startsWith('/images') || 
                         pathname.startsWith('/dashboard') ||
                         pathname.includes('.')

      if (!isInternal) {
        res.writeHead(302, { Location: `/dashboard${pathname}${search}` })
        res.end()
        return
      }

      next()
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  base: '/dashboard/',
  plugins: [react(), apkPlugin(), devRedirectPlugin()],
  server: {
    port: 5173,
    host: true,
    open: '/dashboard/',
  },
  optimizeDeps: {
    entries: ['index.html'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
})
