const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const supplierFile = path.join(__dirname, '../data/supplier.json');
const barangFile = path.join(__dirname, '../data/barang.json');

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf-8'));
const write = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

// GET /api/supplier - List all with optional search
router.get('/', (req, res) => {
  try {
    let supplier = read(supplierFile);
    const { search } = req.query;

    if (search) {
      const q = search.toLowerCase();
      supplier = supplier.filter(s =>
        s.nama.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.alamat.toLowerCase().includes(q)
      );
    }

    res.json(supplier);
  } catch (err) {
    res.status(500).json({ error: 'Gagal memuat data supplier' });
  }
});

// GET /api/supplier/:id
router.get('/:id', (req, res) => {
  try {
    const supplier = read(supplierFile);
    const item = supplier.find(s => s.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Supplier tidak ditemukan' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Gagal memuat data supplier' });
  }
});

// POST /api/supplier - Create
router.post('/', (req, res) => {
  try {
    const supplier = read(supplierFile);
    const { nama, kontak, email, alamat } = req.body;

    if (!nama || !kontak || !email || !alamat) {
      return res.status(400).json({ error: 'Semua field wajib diisi' });
    }

    const lastNum = supplier.length > 0
      ? Math.max(...supplier.map(s => parseInt(s.id.replace('SUP-', ''))))
      : 0;
    const newId = `SUP-${String(lastNum + 1).padStart(3, '0')}`;

    const newItem = {
      id: newId,
      nama,
      kontak,
      email,
      alamat,
      createdAt: new Date().toISOString()
    };

    supplier.push(newItem);
    write(supplierFile, supplier);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Gagal menambah supplier' });
  }
});

// PUT /api/supplier/:id - Update
router.put('/:id', (req, res) => {
  try {
    const supplier = read(supplierFile);
    const idx = supplier.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Supplier tidak ditemukan' });

    const { nama, kontak, email, alamat } = req.body;
    if (nama) supplier[idx].nama = nama;
    if (kontak) supplier[idx].kontak = kontak;
    if (email) supplier[idx].email = email;
    if (alamat) supplier[idx].alamat = alamat;

    write(supplierFile, supplier);
    res.json(supplier[idx]);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengupdate supplier' });
  }
});

// DELETE /api/supplier/:id - Delete with referential integrity check
router.delete('/:id', (req, res) => {
  try {
    const supplier = read(supplierFile);
    const barang = read(barangFile);
    const idx = supplier.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Supplier tidak ditemukan' });

    const used = barang.filter(b => b.supplierId === req.params.id);
    if (used.length > 0) {
      return res.status(409).json({
        error: `Supplier tidak bisa dihapus karena masih digunakan oleh ${used.length} barang`
      });
    }

    const deleted = supplier.splice(idx, 1)[0];
    write(supplierFile, supplier);
    res.json({ message: `Supplier "${deleted.nama}" berhasil dihapus` });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus supplier' });
  }
});

module.exports = router;
