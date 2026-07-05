const CACHE_NAME = 'sharkawey-admin-v1';
const urlsToCache = ['/'];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache)));
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(names =>
        Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    ));
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});

self.addEventListener('push', e => {
    const data = e.data ? e.data.json() : { title: 'طلب جديد!', body: 'لديك طلب جديد需要 المراجعة' };
    e.waitUntil(self.registration.showNotification(data.title, {
        body: data.body,
        icon: '🛒',
        badge: '🛒',
        vibrate: [200, 100, 200],
        tag: 'new-order',
        requireInteraction: true,
        actions: [
            { action: 'open', title: 'عرض الطلب' },
            { action: 'dismiss', title: 'تجاهل' }
        ]
    }));
});

self.addEventListener('notificationclick', e => {
    e.notification.close();
    if (e.action === 'open' || !e.action) {
        e.waitUntil(clients.matchAll({ type: 'window' }).then(clientList => {
            for (const client of clientList) {
                if (client.url.includes('admin') && 'focus' in client) return client.focus();
            }
            return clients.openWindow('/admin-panel/');
        }));
    }
});
