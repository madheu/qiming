'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const handler = require('../api/generate-name');

const root = path.resolve(__dirname, '..');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.txt': 'text/plain; charset=utf-8' };

function serve(req, res) {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch (_) { res.statusCode = 400; return res.end('Bad URL'); }
  if (pathname === '/api/generate-name') return handler(req, res);
  if (pathname === '/api/health') { res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify({ ok: true, modelConfigured: Boolean(process.env.MODEL_API_KEY && process.env.MODEL_API_URL) })); }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.statusCode = 405; return res.end('GET only'); }
  let file = path.resolve(root, `.${pathname}`);
  // The root directory itself is valid; only descendants need the separator check.
  if (file !== root && !file.startsWith(root + path.sep)) { res.statusCode = 403; return res.end('Forbidden'); }
  try { if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html'); } catch (_) {}
  if (!fs.existsSync(file)) { res.statusCode = 404; return res.end('Not found'); }
  res.setHeader('Content-Type', mime[path.extname(file).toLowerCase()] || 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-store');
  fs.createReadStream(file).pipe(res);
}

const port = Number(process.env.PORT || 4173);
http.createServer(serve).listen(port, '127.0.0.1', () => console.log(`Hanzi local server: http://127.0.0.1:${port}/`));
