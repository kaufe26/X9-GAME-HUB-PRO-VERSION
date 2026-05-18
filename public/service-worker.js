importScripts('https://unpkg.com/dexie@3.2.4/dist/dexie.min.js');
importScripts('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');

const db = new Dexie('x9_game_hub_db');
db.version(1).stores({
  games: '++id, name, importDate, engineType'
});

const RUNTIME_PREFIX = '/game-runtime/';
let activeZip = null;
let activeGameId = null;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('message', async (event) => {
  if (event.data.type === 'SET_ACTIVE_GAME') {
    const gameId = event.data.gameId;
    activeGameId = gameId;
    
    try {
      const game = await db.games.get(gameId);
      if (game) {
        activeZip = await JSZip.loadAsync(game.zipData);
        console.log('[SW] Game loaded:', game.name);
      }
    } catch (err) {
      console.error('[SW] Failed to load game ZIP:', err);
    }
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (url.pathname.startsWith(RUNTIME_PREFIX)) {
    event.respondWith(handleGameRequest(url.pathname, event.request));
  }
});

async function handleGameRequest(pathname, request) {
  if (!activeZip) {
    return new Response('Environment Reset: Por favor, reinicie o jogo da biblioteca.', { 
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }

  // Remove prefix
  let filePath = pathname.substring(RUNTIME_PREFIX.length);
  if (!filePath || filePath === '/') {
     filePath = 'index.html'; 
  }

  // Try to find file in ZIP
  let file = activeZip.file(filePath);
  
  if (!file) {
    // Case-insensitive search or subdirectory matching
    const allFiles = Object.keys(activeZip.files);
    const normalizedPath = filePath.toLowerCase();
    const match = allFiles.find(f => f.toLowerCase() === normalizedPath || f.toLowerCase().endsWith('/' + normalizedPath));
    if (match) file = activeZip.file(match);
  }

  if (!file) {
    // If it's a folder-like path, try index.html inside it
    if (!filePath.includes('.')) {
      const subPath = filePath.endsWith('/') ? filePath + 'index.html' : filePath + '/index.html';
      const match = Object.keys(activeZip.files).find(f => f.endsWith(subPath));
      if (match) file = activeZip.file(match);
    }
  }

  if (!file) {
    console.warn('[SW] 404:', filePath);
    return new Response('File Not Found in Archive: ' + filePath, { status: 404 });
  }

  const blob = await file.async('blob');
  
  // Determine content type
  const extension = filePath.split('.').pop()?.toLowerCase();
  const mimeTypes = {
    'html': 'text/html',
    'js': 'application/javascript',
    'css': 'text/css',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'json': 'application/json',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'wasm': 'application/wasm',
    'xml': 'application/xml',
    'txt': 'text/plain'
  };

  const contentType = mimeTypes[extension || ''] || 'application/octet-stream';

  return new Response(blob, {
    headers: { 
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
