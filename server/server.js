// ========================================================
// RISHABH TECH - STANDALONE LOCAL DATABASE SERVER
// Lightweight, zero-dependency Node.js HTTP REST Server
// Run with: npm run server
// ========================================================

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'local_db.json');

// Initialize database file with defaults if not exists
function loadDb() {
  if (!fs.existsSync(DB_FILE)) {
    const seedsFile = path.join(__dirname, 'seeds.json');
    let initial = { students: [], teachers: [], attendance: [], ipo: [] };
    if (fs.existsSync(seedsFile)) {
      try {
        initial = JSON.parse(fs.readFileSync(seedsFile, 'utf8'));
      } catch (e) {
        console.error('Error loading seeds:', e);
      }
    }
    initial.updatedAt = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }

  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (err) {
    console.error('Error reading DB_FILE:', err);
    return { students: [], teachers: [], attendance: [], ipo: [] };
  }
}

function saveDb(data) {
  data.updatedAt = new Date().toISOString();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Health check
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', server: 'Rishabh Tech Local DB Server', port: PORT }));
    return;
  }

  // Parse resource name: /api/students, /api/teachers, etc.
  const match = pathname.match(/^\/api\/(students|teachers|attendance|ipo)(?:\/(\d+))?$/);
  if (!match) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
    return;
  }

  const collection = match[1];
  const itemId = match[2] ? parseInt(match[2], 10) : null;
  const db = loadDb();

  if (req.method === 'GET') {
    if (itemId !== null) {
      const item = (db[collection] || []).find(x => x.id === itemId);
      if (!item) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Item not found' }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(item));
      }
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(db[collection] || []));
    }
    return;
  }

  // Handle body for POST/PUT
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      const payload = body ? JSON.parse(body) : {};

      if (req.method === 'POST') {
        const items = db[collection] || [];
        const newId = payload.id || (items.length ? Math.max(...items.map(x => x.id)) + 1 : 1);
        const newItem = { ...payload, id: newId };
        items.push(newItem);
        db[collection] = items;
        saveDb(db);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newItem));
      } else if (req.method === 'PUT' && itemId !== null) {
        const items = db[collection] || [];
        const index = items.findIndex(x => x.id === itemId);
        if (index === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Item not found' }));
        } else {
          items[index] = { ...items[index], ...payload, id: itemId };
          db[collection] = items;
          saveDb(db);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(items[index]));
        }
      } else if (req.method === 'DELETE' && itemId !== null) {
        const items = db[collection] || [];
        db[collection] = items.filter(x => x.id !== itemId);
        saveDb(db);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, deletedId: itemId }));
      } else {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method not allowed' }));
      }
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Rishabh Tech Local Database Server running at http://localhost:${PORT}`);
  console.log(`📊 Endpoints: /api/students, /api/teachers, /api/attendance, /api/ipo, /api/health`);
});
