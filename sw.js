// 二子知识站 Service Worker - T46: 缓存策略优化
const VERSION = 'v2';
const CACHE_NAME = `erzi-knowledge-${VERSION}`;
const STATIC_CACHE = `erzi-static-${VERSION}`;
const DYNAMIC_CACHE = `erzi-dynamic-${VERSION}`;

// 核心静态资源（安装时预缓存）
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/data/index.json', // 轻量元数据（~100KB）
  '/icon-192.png',
  '/icon-512.png'
];

// 离线降级页面 HTML
const OFFLINE_PAGE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>离线中 - 二子的知识库</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, "PingFang SC", sans-serif;
      background: linear-gradient(135deg, #eff6ff 0%, #fafaf9 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .container {
      text-align: center;
      max-width: 400px;
    }
    .icon { font-size: 4rem; margin-bottom: 24px; }
    h1 { font-size: 1.5rem; color: #1c1917; margin-bottom: 12px; }
    p { color: #78716c; line-height: 1.6; margin-bottom: 24px; }
    .btn {
      display: inline-block;
      padding: 12px 24px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      text-decoration: none;
    }
    .btn:hover { background: #2563eb; }
    .hint { margin-top: 24px; font-size: 0.875rem; color: #a8a29e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📡</div>
    <h1>当前处于离线状态</h1>
    <p>二子的知识库需要网络连接才能加载新内容。<br>请检查网络连接后重试。</p>
    <button class="btn" onclick="location.reload()">重新加载</button>
    <p class="hint">如果之前访问过某些文章，它们可能仍可离线浏览。</p>
  </div>
</body>
</html>`;

// 安装事件：预缓存核心资源
self.addEventListener('install', (event) => {
  console.log('[SW] 安装中...', VERSION);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] 预缓存核心资源');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[SW] 预缓存失败:', error);
      })
  );
});

// 激活事件：清理旧缓存 + 通知客户端更新
self.addEventListener('activate', (event) => {
  console.log('[SW] 激活中...', VERSION);
  event.waitUntil(
    caches.keys().then((keys) => {
      const deletePromises = keys
        .filter((key) => !key.endsWith(VERSION))
        .map((key) => {
          console.log('[SW] 删除旧缓存:', key);
          return caches.delete(key);
        });
      
      return Promise.all(deletePromises);
    })
    .then(() => self.clients.claim())
    .then(() => {
      // 通知所有客户端有新版本
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SW_UPDATED', version: VERSION });
        });
      });
    })
  );
});

// 请求拦截
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 只缓存同源请求
  if (url.origin !== location.origin) {
    return;
  }

  // 导航请求（HTML 页面）
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // 静态资源：缓存优先
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // 数据文件：网络优先，离线回缓存
  if (isDataFile(url.pathname)) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    return;
  }

  // 其他请求：网络优先
  event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

// 处理导航请求
async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      // 缓存 index.html
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
      return response;
    }
  } catch (error) {
    console.log('[SW] 导航请求失败，尝试返回缓存');
  }

  // 尝试返回缓存的 index.html
  const cached = await caches.match('/index.html');
  if (cached) {
    return cached;
  }

  // 返回离线降级页面
  return new Response(OFFLINE_PAGE, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

// 判断是否为静态资源
function isStaticAsset(pathname) {
  return pathname.startsWith('/assets/') ||
         pathname.startsWith('/icon-') ||
         pathname === '/manifest.json' ||
         pathname === '/og-image.svg' ||
         pathname === '/robots.txt' ||
         pathname === '/sitemap.xml' ||
         pathname === '/feed.xml';
}

// 判断是否为数据文件
function isDataFile(pathname) {
  return pathname.startsWith('/data/');
}

// 缓存优先策略
async function cacheFirst(request, cacheName = STATIC_CACHE) {
  const cached = await caches.match(request);
  if (cached) {
    // 后台更新缓存
    fetchAndCache(request, cacheName);
    return cached;
  }

  return fetchAndCache(request, cacheName);
}

// 网络优先策略
async function networkFirst(request, cacheName = DYNAMIC_CACHE) {
  try {
    return await fetchAndCache(request, cacheName);
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      console.log('[SW] 从缓存返回:', request.url);
      return cached;
    }

    // 如果是导航请求，返回离线页面
    if (request.mode === 'navigate') {
      return new Response(OFFLINE_PAGE, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    console.error('[SW] 离线且无缓存:', request.url);
    return new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 获取并缓存
async function fetchAndCache(request, cacheName) {
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

// 消息处理
self.addEventListener('message', (event) => {
  const { type } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CLEAR_CACHE':
      caches.keys().then((keys) => {
        keys.forEach((key) => caches.delete(key));
        console.log('[SW] 所有缓存已清除');
      });
      break;

    case 'GET_VERSION':
      event.ports[0]?.postMessage({ version: VERSION });
      break;
  }
});

// 后台同步（可选，用于未来功能）
self.addEventListener('sync', (event) => {
  console.log('[SW] 后台同步:', event.tag);
});
