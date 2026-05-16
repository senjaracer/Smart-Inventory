const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const kategoriFile = path.join(__dirname, '../data/kategori.json');
const barangFile = path.join(__dirname, '../data/barang.json');

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf-8'));
const write = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

// GET /api/kategori - List all categories with item count
router.get('/', (req, res) => {
  try {
    const kategori = read(kategoriFile);
    const barang = read(barangFile);
    const { search } = req.query;

    let result = kategori.map(k => ({
      ...k,
      jumlahBarang: barang.filter(b => b.kategoriId === k.id).length
    }));

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(k =>
        k.nama.toLowerCase().includes(q) ||
        k.deskripsi.toLowerCase().includes(q)
      );
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Gagal memuat data kategori' });
  }
});

// GET /api/kategori/:id
router.get('/:id', (req, res) => {
  try {
    const kategori = read(kategoriFile);
    const item = kategori.find(k => k.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Kategori tidak ditemukan' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Gagal memuat data kategori' });
  }
});

// POST /api/kategori - Create
router.post('/', (req, res) => {
  try {
    const kategori = read(kategoriFile);
    const { nama, deskripsi } = req.body;

    if (!nama) return res.status(400).json({ error: 'Nama kategori wajib diisi' });

    const lastNum = kategori.length > 0
      ? Math.max(...kategori.map(k => parseInt(k.id.replace('KAT-', ''))))
      : 0;
    const newId = `KAT-${String(lastNum + 1).padStart(3, '0')}`;

    const newItem = {
      id: newId,
      nama,
      deskripsi: deskripsi || '',
      createdAt: new Date().toISOString()
    };

    kategori.push(newItem);
    write(kategoriFile, kategori);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Gagal menambah kategori' });
  }
});

// PUT /api/kategori/:id - Update
router.put('/:id', (req, res) => {
  try {
    const kategori = read(kategoriFile);
    const idx = kategori.findIndex(k => k.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Kategori tidak ditemukan' });

    const { nama, deskripsi } = req.body;
    if (nama) kategori[idx].nama = nama;
    if (deskripsi !== undefined) kategori[idx].deskripsi = deskripsi;

    write(kategoriFile, kategori);
    res.json(kategori[idx]);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengupdate kategori' });
  }
});

// DELETE /api/kategori/:id - Delete with referential integrity check
router.delete('/:id', (req, res) => {
  try {
    const kategori = read(kategoriFile);
    const barang = read(barangFile);
    const idx = kategori.findIndex(k => k.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Kategori tidak ditemukan' });

    // Check if any products use this category
    const used = barang.filter(b => b.kategoriId === req.params.id);
    if (used.length > 0) {
      return res.status(409).json({
        error: `Kategori tidak bisa dihapus karena masih digunakan oleh ${used.length} barang`
      });
    }

    const deleted = kategori.splice(idx, 1)[0];
    write(kategoriFile, kategori);
    res.json({ message: `Kategori "${deleted.nama}" berhasil dihapus` });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus kategori' });
  }
});

module.exports = router;
