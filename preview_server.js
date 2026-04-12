const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');

const ROOT = path.join(__dirname, 'htdocs');

const MIME = {
    '.html': 'text/html',
    '.css' : 'text/css',
    '.js'  : 'application/javascript',
    '.png' : 'image/png',
    '.jpg' : 'image/jpeg',
    '.ico' : 'image/x-icon',
    '.txt' : 'text/plain',
};

http.createServer((req, res) => {
    const parsed   = url.parse(req.url);
    const pathname = parsed.pathname === '/' ? '/index.html' : parsed.pathname;
    const filepath = path.join(ROOT, pathname);

    fs.readFile(filepath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found: ' + pathname);
            return;
        }
        const ext  = path.extname(filepath);
        const type = MIME[ext] || 'application/octet-stream';
        res.writeHead(200, {
            'Content-Type': type,
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*',
        });
        res.end(data);
    });
}).listen(7788, () => {
    console.log('Lona Library server running at http://localhost:7788');
});
