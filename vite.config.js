import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  base: '/',
  build: {
    // T65: 包体预算检查
    chunkSizeWarningLimit: 500, // 警告阈值 500KB
    rollupOptions: {
      output: {
        entryFileNames: 'assets/entry-[hash].js',
        chunkFileNames: 'assets/chunk-[hash].js',
        // T65: 手动分包策略
        manualChunks: {
          // Vue 核心库
          'vue-vendor': ['vue'],
          // Markdown 渲染
          'markdown': ['marked'],
          // 代码高亮（已在 hljs-wrapper.js 中优化）
          // 'highlight': ['highlight.js'], // 不需要，已优化
        },
      },
    },
  },
  server: {
    port: 3001,
  },
});
