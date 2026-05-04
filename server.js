require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

connectDB();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Serve HTML/CSS/JS before body parsers so static assets are not touched by JSON middleware.
app.use(express.static(path.join(__dirname)));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',      require('./auth-routes'));
app.use('/api/products',  require('./products'));
app.use('/api/users',     require('./users'));
app.use('/api/cart',      require('./cart'));
app.use('/api/inventory', require('./inventory'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  const origin = `http://localhost:${PORT}`;
  console.log(`MarketFlow API running on ${origin}`);
  console.log(`Open the site (CSS loads from the same origin): ${origin}/index.html`);
});
