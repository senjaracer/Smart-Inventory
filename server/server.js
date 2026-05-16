const express = require('express');
const cors = require('cors');
const path = require('path');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../public')));

// Auth Routes (public — no token required)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Protected API Routes (require valid token)
const protect = authMiddleware(authRoutes.sessions);
app.use('/api/dashboard', protect, require('./routes/dashboard'));
app.use('/api/barang', protect, require('./routes/barang'));
app.use('/api/kategori', protect, require('./routes/kategori'));
app.use('/api/supplier', protect, require('./routes/supplier'));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Smart Inventory server running at http://localhost:${PORT}`);
});
