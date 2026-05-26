const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const SITES_DIR = path.join(__dirname, 'sites');

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  let filePath = path.join(SITES_DIR, urlPath);

  const tryFile = (fp) => {
    if (!fp.startsWith(SITES_DIR)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    fs.readFile(fp, (err, data) => {
      if (err) {
        // SPA fallback: serve index.html for all unknown routes
        fs.readFile(path.join(SITES_DIR, 'index.html'), (e2, d2) => {
          if (e2) { res.writeHead(404); res.end('Not found'); return; }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(d2);
        });
        return;
      }
      const ext = path.extname(fp).toLowerCase();
      const ct = MIME[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': ct });
      res.end(data);
    });
  };

  // If path has no extension, try index.html in that dir, then SPA fallback
  if (!path.extname(urlPath)) {
    const dirIndex = path.join(filePath, 'index.html');
    fs.access(dirIndex, fs.constants.F_OK, (err) => {
      tryFile(err ? null : dirIndex);
    });
  } else {
    tryFile(filePath);
  }

}).listen(PORT, () => {
  console.log(`AvtoX server running on port ${PORT}`);
  console.log(`Serving: ${SITES_DIR}`);
});
