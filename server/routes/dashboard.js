const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const barangFile = path.join(__dirname, '../data/barang.json');
const kategoriFile = path.join(__dirname, '../data/kategori.json');
const supplierFile = path.join(__dirname, '../data/supplier.json');

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf-8'));

// GET /api/dashboard - Aggregate statistics
router.get('/', (req, res) => {
  try {
    const barang = read(barangFile);
    const kategori = read(kategoriFile);
    const supplier = read(supplierFile);

    const totalBarang = barang.length;
    const totalKategori = kategori.length;
    const totalSupplier = supplier.length;
    const totalStok = barang.reduce((sum, b) => sum + b.stok, 0);
    const totalNilai = barang.reduce((sum, b) => sum + (b.stok * b.hargaBeli), 0);

    // Low stock items (stok <= 5)
    const stokMenipis = barang
      .filter(b => b.stok > 0 && b.stok <= 5)
      .map(b => {
        const kat = kategori.find(k => k.id === b.kategoriId);
        return { ...b, kategoriNama: kat ? kat.nama : '-' };
      });

    // Out of stock items
    const stokHabis = barang
      .filter(b => b.stok === 0)
      .map(b => {
        const kat = kategori.find(k => k.id === b.kategoriId);
        return { ...b, kategoriNama: kat ? kat.nama : '-' };
      });

    // Per-category breakdown
    const perKategori = kategori.map(k => {
      const items = barang.filter(b => b.kategoriId === k.id);
      return {
        id: k.id,
        nama: k.nama,
        jumlahBarang: items.length,
        totalStok: items.reduce((s, b) => s + b.stok, 0)
      };
    });

    // Recent items (last 5)
    const recentItems = [...barang]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(b => {
        const kat = kategori.find(k => k.id === b.kategoriId);
        return { ...b, kategoriNama: kat ? kat.nama : '-' };
      });

    res.json({
      totalBarang,
      totalKategori,
      totalSupplier,
      totalStok,
      totalNilai,
      stokMenipis,
      stokHabis,
      perKategori,
      recentItems
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal memuat data dashboard' });
  }
});

module.exports = router;
