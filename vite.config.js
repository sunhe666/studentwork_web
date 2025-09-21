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
        target: 'https://bishe.asia',
        changeOrigin: true,
        secure: true,
      },
      '/content': {
        target: 'https://bishe.asia',
        changeOrigin: true,
        secure: true,
      },
      '/category': {
        target: 'https://bishe.asia',
        changeOrigin: true,
        secure: true,
      },
      '/announcement': {
        target: 'https://bishe.asia',
        changeOrigin: true,
        secure: true,
      },
       '/comment': {
        target: 'https://bishe.asia',
        changeOrigin: true,
        secure: true,
      },
      '/user': {
        target: 'https://bishe.asia',
        changeOrigin: true,
        secure: true,
      },
      '/thesis': {
        target: 'https://bishe.asia',
        changeOrigin: true,
        secure: true,
      },
        '/ai': {
        target: 'https://bishe.asia',
        changeOrigin: true,
        secure: true,
      },
        '/cooperation': {
        target: 'https://bishe.asia',
        changeOrigin: true,
        secure: true,
      },
    '/recruitment': {
        target: 'https://bishe.asia',
        changeOrigin: true,
        secure: true,
      },
      '/api/proxy': {
        target: 'https://sunhe197428.oss-cn-beijing.aliyuncs.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/proxy/, ''),
          // 配置CORS响应头
          configure: (proxy, options) => {
            proxy.on('proxyRes', (proxyRes, req, res) => {
              res.setHeader('Access-Control-Allow-Origin', 'https://bishe.asia');
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
