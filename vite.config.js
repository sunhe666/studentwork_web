import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  server: {
   
   proxy: {
      '/banner': {
        target: 'http://sunhe.site',
            // target: 'http://sunhe.site',
        changeOrigin: true,
      },
      '/content': {
        target: 'http://sunhe.site',
        changeOrigin: true,
      },
      '/category': {
        target: 'http://sunhe.site',
        changeOrigin: true,
      },
      '/announcement': {
        target: 'http://sunhe.site',
        changeOrigin: true,
      },
       '/comment': {
        target: 'http://sunhe.site',
        changeOrigin: true,
      },
      '/user': {
        target: 'http://sunhe.site',
        changeOrigin: true,
      },
      '/thesis': {
        target: 'http://sunhe.site',
        changeOrigin: true,
      },
        '/ai': {
        target: 'http://sunhe.site',
        changeOrigin: true,
      },
        '/cooperation': {
        target: 'http://sunhe.site',
        changeOrigin: true,
      },
    '/recruitment': {
        target: 'http://sunhe.site',
        changeOrigin: true,
      },
      '/api/proxy': {
        target: 'https://sunhe197428.oss-cn-beijing.aliyuncs.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/proxy/, ''),
          // 配置CORS响应头
          configure: (proxy, options) => {
            proxy.on('proxyRes', (proxyRes, req, res) => {
              res.setHeader('Access-Control-Allow-Origin', 'https://www.sunhe.site');
              res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            });
          }
      }
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
