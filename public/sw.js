const CACHE_NAME = 'faith-news-v1';
const ASSETS = [
    '/news-portal/',
    '/news-portal/index.html',
    '/news-portal/manifest.webmanifest',
    '/news-portal/favicon.ico'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
