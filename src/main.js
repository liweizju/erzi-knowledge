import { createApp } from 'vue';
import App from './App.vue';
import './style.css';

// 处理部署后旧页面引用失效 chunk 的场景
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  const KEY = 'erzi-vite-preload-reloaded';
  if (!sessionStorage.getItem(KEY)) {
    sessionStorage.setItem(KEY, '1');
    window.location.reload();
  }
});

createApp(App).mount('#app');
