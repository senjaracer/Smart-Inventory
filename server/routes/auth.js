const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const usersFile = path.join(__dirname, '../data/users.json');

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf-8'));

// In-memory token store (for simplicity — in production, use a proper session/JWT)
const sessions = {};

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi' });
    }

    const users = read(usersFile);
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    // Generate session token
    const token = crypto.randomBytes(32).toString('hex');
    sessions[token] = {
      userId: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      loginAt: new Date().toISOString()
    };

    res.json({
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal melakukan login' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token && sessions[token]) {
    delete sessions[token];
  }
  res.json({ message: 'Berhasil logout' });
});

// GET /api/auth/me — get current user info from token
router.get('/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !sessions[token]) {
    return res.status(401).json({ error: 'Tidak terautentikasi' });
  }
  res.json(sessions[token]);
});

// Export sessions for middleware use
router.sessions = sessions;

module.exports = router;
