const express = require('express');
const cors = require('cors');
const path = require('path');
const authMiddleware = require('../server/middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth Routes (public — no token required)
const authRoutes = require('../server/routes/auth');
app.use('/api/auth', authRoutes);

// Protected API Routes (require valid token)
const protect = authMiddleware(authRoutes.sessions);
app.use('/api/dashboard', protect, require('../server/routes/dashboard'));
app.use('/api/barang', protect, require('../server/routes/barang'));
app.use('/api/kategori', protect, require('../server/routes/kategori'));
app.use('/api/supplier', protect, require('../server/routes/supplier'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
