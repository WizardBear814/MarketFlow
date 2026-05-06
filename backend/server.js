const path = require('path');

// Load .env that lives next to this file (works no matter what cwd is).
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

connectDB();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Serve the static frontend (sibling folder) before body parsers
// so static assets aren't touched by JSON middleware.
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
app.use(express.static(FRONTEND_DIR));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/auth',      require('./auth-routes'));
app.use('/api/products',  require('./products'));
app.use('/api/users',     require('./users'));

app.use('/api/cart',      require('./cart'));
app.use('/api/inventory', require('./inventory'));


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Convenience: GET / sends index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// 404 handler — only for /api/* paths so static HTML still works
app.use('/api', (req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  const origin = `http://localhost:${PORT}`;
  console.log(`MarketFlow API running on ${origin}`);
  console.log(`Open the site:                   ${origin}/`);
});
