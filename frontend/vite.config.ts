import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0', // 允许外部访问
        proxy: {
            '/api': {
                target: 'http://backend:8080', // Docker 环境下开发模式代理（虽然我们主要用 Nginx，但本地开发也需要）
                changeOrigin: true,
            }
        }
    }
})
