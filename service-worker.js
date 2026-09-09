/* ==========================================================================
   صحّتي — Service Worker
   استراتيجية: precache لهيكل التطبيق (App Shell) + Network-first مع
   fallback للكاش عند انقطاع الاتصال، لضمان عمل التطبيق أوفلاين.
   ========================================================================== */

const CACHE_NAME = 'sehati-cache-v1';

const APP_SHELL = [
  './',
  'welcome.html',
  'login.html',
  'signup.html',
  'index.html',
  'workouts.html',
  'health.html',
  'progress.html',
  'profile.html',
  'exercises-info.html',
  'nutrition-info.html',
  'manifest.json',
  'js/auth.js',
  'js/app.js',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

/* التثبيت: تخزين كل ملفات هيكل التطبيق مسبقًا */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

/* التفعيل: حذف أي نسخ كاش قديمة من إصدارات سابقة */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* الجلب: شبكة أولًا لتحديث المحتوى، مع الرجوع للكاش عند عدم توفر إنترنت */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || caches.match('index.html'))
      )
  );
});
