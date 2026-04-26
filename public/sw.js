const CACHE_NAME = 'azrael-v1-cache';
const SCAMMER_NODES = [
  'scam-node-01.com',
  'scam-node-02.com',
  'malicious-actor.net',
  'scammer-22-neutralized.org'
];

self.addEventListener('install', (event) => {
  console.log('AZRAEL // SERVICE_WORKER_INSTALLED // THE_HAMMER_IS_READY');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('AZRAEL // SERVICE_WORKER_ACTIVATED // THE_VOID_IS_VIGILANT');
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // THE HAMMER: Intercept and Drop Scammer Nodes
  if (SCAMMER_NODES.some(node => url.hostname.includes(node))) {
    console.warn(`AZRAEL // SCAMMER_NODE_DETECTED // INTERCEPTING_AND_DROPPING: ${url.hostname}`);
    event.respondWith(new Response('AZRAEL // ACCESS_DENIED // SCAMMER_NODE_NEUTRALIZED', {
      status: 403,
      statusText: 'Forbidden'
    }));
    return;
  }

  // Standard caching strategy (Network First)
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
