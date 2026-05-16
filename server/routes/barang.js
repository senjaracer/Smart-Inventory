const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const barangFile = path.join(__dirname, '../data/barang.json');
const kategoriFile = path.join(__dirname, '../data/kategori.json');
const supplierFile = path.join(__dirname, '../data/supplier.json');

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf-8'));
const write = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

// GET /api/barang - List all with optional search, filter
router.get('/', (req, res) => {
  try {
    let barang = read(barangFile);
    const kategori = read(kategoriFile);
    const supplier = read(supplierFile);
    const { search, kategoriId, status } = req.query;

    // Enrich with category & supplier names
    barang = barang.map(b => {
      const kat = kategori.find(k => k.id === b.kategoriId);
      const sup = supplier.find(s => s.id === b.supplierId);
      return {
        ...b,
        kategoriNama: kat ? kat.nama : '-',
        supplierNama: sup ? sup.nama : '-'
      };
    });

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      barang = barang.filter(b =>
        b.nama.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (kategoriId) {
      barang = barang.filter(b => b.kategoriId === kategoriId);
    }

    // Stock status filter
    if (status === 'tersedia') {
      barang = barang.filter(b => b.stok > 5);
    } else if (status === 'menipis') {
      barang = barang.filter(b => b.stok > 0 && b.stok <= 5);
    } else if (status === 'habis') {
      barang = barang.filter(b => b.stok === 0);
    }

    res.json(barang);
  } catch (err) {
    res.status(500).json({ error: 'Gagal memuat data barang' });
  }
});

// GET /api/barang/:id - Get single item
router.get('/:id', (req, res) => {
  try {
    const barang = read(barangFile);
    const item = barang.find(b => b.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Barang tidak ditemukan' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Gagal memuat data barang' });
  }
});

// POST /api/barang - Create new item
router.post('/', (req, res) => {
  try {
    const barang = read(barangFile);
    const { nama, kategoriId, supplierId, stok, satuan, hargaBeli } = req.body;

    if (!nama || !kategoriId || !supplierId || stok === undefined || !satuan || hargaBeli === undefined) {
      return res.status(400).json({ error: 'Semua field wajib diisi' });
    }

    // Generate next ID
    const lastNum = barang.length > 0
      ? Math.max(...barang.map(b => parseInt(b.id.replace('BRG-', ''))))
      : 0;
    const newId = `BRG-${String(lastNum + 1).padStart(3, '0')}`;

    const newItem = {
      id: newId,
      nama,
      kategoriId,
      supplierId,
      stok: Number(stok),
      satuan,
      hargaBeli: Number(hargaBeli),
      createdAt: new Date().toISOString()
    };

    barang.push(newItem);
    write(barangFile, barang);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Gagal menambah barang' });
  }
});

// PUT /api/barang/:id - Update item
router.put('/:id', (req, res) => {
  try {
    const barang = read(barangFile);
    const idx = barang.findIndex(b => b.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Barang tidak ditemukan' });

    const { nama, kategoriId, supplierId, stok, satuan, hargaBeli } = req.body;
    if (nama) barang[idx].nama = nama;
    if (kategoriId) barang[idx].kategoriId = kategoriId;
    if (supplierId) barang[idx].supplierId = supplierId;
    if (stok !== undefined) barang[idx].stok = Number(stok);
    if (satuan) barang[idx].satuan = satuan;
    if (hargaBeli !== undefined) barang[idx].hargaBeli = Number(hargaBeli);

    write(barangFile, barang);
    res.json(barang[idx]);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengupdate barang' });
  }
});

// DELETE /api/barang/:id - Delete item
router.delete('/:id', (req, res) => {
  try {
    let barang = read(barangFile);
    const idx = barang.findIndex(b => b.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Barang tidak ditemukan' });

    const deleted = barang.splice(idx, 1)[0];
    write(barangFile, barang);
    res.json({ message: `Barang "${deleted.nama}" berhasil dihapus` });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus barang' });
  }
});

module.exports = router;
