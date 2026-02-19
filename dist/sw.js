// 二子知识站 Service Worker - T42: PWA 离线支持
const CACHE_NAME = 'erzi-knowledge-v1';
const STATIC_CACHE = 'erzi-static-v1';
const DYNAMIC_CACHE = 'erzi-dynamic-v1';

// 静态资源（安装时缓存）
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// 安装事件：缓存静态资源
self.addEventListener('install', (event) => {
  console.log('[SW] 安装中...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] 缓存静态资源');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活事件：清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[SW] 激活中...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => {
            console.log('[SW] 删除旧缓存:', key);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// 请求拦截：缓存优先 + 网络回退
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 只缓存同源请求
  if (url.origin !== location.origin) {
    return;
  }

  // 策略1: 静态资源 - 缓存优先
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 策略2: 数据文件 - 网络优先，失败回缓存
  if (isDataFile(url.pathname)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 策略3: 其他请求 - 网络优先
  event.respondWith(networkFirst(request));
});

// 判断是否为静态资源
function isStaticAsset(pathname) {
  return pathname.startsWith('/assets/') || 
         pathname === '/manifest.json' ||
         pathname === '/og-image.svg' ||
         pathname === '/robots.txt';
}

// 判断是否为数据文件
function isDataFile(pathname) {
  return pathname.startsWith('/data/');
}

// 缓存优先策略
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] 网络请求失败:', error);
    return new Response('离线状态', { status: 503 });
  }
}

// 网络优先策略
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      // 缓存数据文件到动态缓存
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // 网络失败，尝试从缓存读取
    const cached = await caches.match(request);
    if (cached) {
      console.log('[SW] 从缓存返回:', request.url);
      return cached;
    }
    
    console.error('[SW] 离线且无缓存:', request.url);
    return new Response('离线状态，且无缓存数据', { status: 503 });
  }
}

// 监听消息：手动清理缓存
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data === 'clearCache') {
    caches.keys().then((keys) => {
      keys.forEach((key) => caches.delete(key));
    });
  }
});
