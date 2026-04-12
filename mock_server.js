const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const HTDOCS_DIR = path.join(__dirname, 'htdocs');

// Mock Data
let books = [];
let nextId = 101;

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // --- Mock Backend (Simulating the C CGI) ---
    if (req.url.startsWith('/cgi-bin/')) {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const endpoint = req.url.split('/').pop().replace('.exe', '');

            if (req.method === 'GET' && endpoint === 'view_books') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify(books));
            }

            if (req.method === 'POST') {
                if (endpoint === 'add_book') {
                    // C payload: id|name|author|quantity
                    const parts = body.split('|');
                    if (parts.length === 4) {
                        const id = parseInt(parts[0]);
                        if (books.find(b => b.id === id)) {
                            res.writeHead(200, { 'Content-Type': 'text/plain' });
                            return res.end('ERROR|Book ID already exists.');
                        }
                        books.push({
                            id: id,
                            name: parts[1],
                            author: parts[2],
                            quantity: parseInt(parts[3]),
                            issued: 0
                        });
                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        return res.end('SUCCESS|Book added successfully!');
                    }
                } 
                else if (endpoint === 'issue_book') {
                    const id = parseInt(body.trim());
                    const book = books.find(b => b.id === id);
                    if (book && (book.quantity - book.issued > 0)) {
                        book.issued++;
                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        return res.end(`SUCCESS|Book ${id} issued successfully!`);
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        return res.end(!book ? `ERROR|Book ${id} not found.` : `ERROR|No copies available for Book ${id}.`);
                    }
                }
                else if (endpoint === 'return_book') {
                    const id = parseInt(body.trim());
                    const book = books.find(b => b.id === id);
                    if (book && book.issued > 0) {
                        book.issued--;
                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        return res.end(`SUCCESS|Book ${id} returned successfully!`);
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        return res.end(!book ? `ERROR|Book ${id} not found.` : 'ERROR|This book is not currently issued out.');
                    }
                }
            }
            res.writeHead(404);
            res.end('Not Found');
        });
        return;
    }

    // --- Serve Static Frontend Files ---
    let filePath = path.join(HTDOCS_DIR, req.url === '/' ? 'index.html' : req.url);
    const extname = String(path.extname(filePath)).toLowerCase();
    
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
    };
    
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end("<h1>404 Not Found</h1>", 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Mock server running at http://localhost:${PORT}/index.html`);
});
