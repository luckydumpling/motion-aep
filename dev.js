#!/usr/bin/env node
/*
 * Local preview: builds the site, serves it on http://localhost:8080
 * and reloads the browser whenever you save a file in content/ or site/.
 * No extra packages needed.
 */
'use strict';

process.argv.push('--dev');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { build } = require('./build');

const PORT = Number(process.env.PORT) || 8080;
const OUT = path.join(__dirname, '_site');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.mp4': 'video/mp4', '.zip': 'application/zip',
  '.ai': 'application/postscript', '.txt': 'text/plain; charset=utf-8',
};

const clients = new Set();

function safeBuild() {
  try { build(); } catch (e) { console.error('Build failed:', e.message); }
}

safeBuild();

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/__reload') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write('\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }
  let file = path.join(OUT, url);
  if (!file.startsWith(OUT)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found: ' + url); return; }
    const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
    // Videos need range requests (Safari won't play them otherwise).
    const range = req.headers.range && req.headers.range.match(/bytes=(\d*)-(\d*)/);
    if (range) {
      const start = range[1] ? Number(range[1]) : 0;
      const end = range[2] ? Math.min(Number(range[2]), stat.size - 1) : stat.size - 1;
      res.writeHead(206, {
        'Content-Type': type, 'Accept-Ranges': 'bytes',
        'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Content-Length': end - start + 1,
      });
      fs.createReadStream(file, { start, end }).pipe(res);
      return;
    }
    res.writeHead(200, { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Length': stat.size });
    fs.createReadStream(file).pipe(res);
  });
}).listen(PORT, () => {
  console.log(`\nPreview running at http://localhost:${PORT}`);
  console.log('Save any file in content/ or site/ and the browser reloads. Stop with Ctrl+C.\n');
});

let timer = null;
function onChange() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    safeBuild();
    for (const c of clients) c.write('data: reload\n\n');
  }, 150);
}
for (const dir of ['content', 'site', 'downloads']) {
  const p = path.join(__dirname, dir);
  if (fs.existsSync(p)) fs.watch(p, { recursive: true }, onChange);
}
