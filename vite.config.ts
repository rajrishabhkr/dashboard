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

// https://vite.dev/config/
export default defineConfig({
  base: '/dashboard/',
  plugins: [react(), apkPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/styles/variables.scss" as *;
          @use "@/styles/mixins.scss" as *;
        `,
      },
    },
  },
})