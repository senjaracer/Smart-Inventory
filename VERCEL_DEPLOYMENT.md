# Deploy ke Vercel - Panduan Lengkap

Proyek ini sudah dikonfigurasi untuk deploy ke Vercel. Ikuti langkah berikut:

## Persiapan

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login ke Vercel
```bash
vercel login
```

Ikuti instruksi di browser untuk login dengan akun GitHub/email Vercel.

### 3. Deploy Project
```bash
vercel
```

Vercel akan:
- Menanyakan nama project
- Mengdeteksi framework (Node.js)
- Deploy secara otomatis

## Konfigurasi Vercel

File konfigurasi sudah tersedia:
- **vercel.json** — Routing dan build configuration
- **.vercelignore** — File yang tidak perlu di-upload

## Struktur Project untuk Vercel

```
Smart-Inventory/
├── api/
│   └── index.js          # Express app (serverless handler)
├── server/
│   ├── routes/           # API routes
│   ├── middleware/       # Auth middleware
│   └── data/             # JSON data files
├── public/               # Frontend static files
│   ├── index.html
│   ├── js/
│   └── css/
├── vercel.json           # Vercel config
├── .vercelignore         # Files to ignore
└── package.json
```

## Testing Lokal (Sebelum Deploy)

### Test dengan Vercel CLI
```bash
vercel dev
```

Ini akan menjalankan project secara lokal dengan environment yang mirip Vercel.

### Atau gunakan server.js langsung
```bash
npm run dev
```

Akses: `http://localhost:3000`

## Troubleshooting

### 1. Build Gagal
- Cek bahwa `api/index.js` bisa di-require tanpa error
- Pastikan semua dependencies di `package.json`

### 2. API Endpoint Error
- Vercel meroutkan `/api/*` ke `api/index.js`
- Jangan ubah routing di vercel.json tanpa tahu akibatnya

### 3. Static Files Tidak Tampil
- Public folder harus di-root project
- Pastikan `public/index.html` ada

### 4. Session/Token Problem
- Sessions disimpan in-memory (tidak persist antar redeploy)
- Untuk production: gunakan database untuk session storage (Redis, MongoDB, etc)

## Deploy Otomatis dari GitHub

1. Push code ke GitHub repo
2. Connect Vercel ke repo Anda
3. Vercel otomatis deploy setiap kali ada push ke main branch

## Environment Variables

Jika butuh env vars, buat di Vercel Dashboard:
1. Pilih project → Settings → Environment Variables
2. Tambahkan variable (contoh: `DATABASE_URL`, `JWT_SECRET`)

## Optimasi Production

Saat ini sessions disimpan in-memory. Untuk production lebih baik:

```javascript
// Gunakan database session store
// atau Redis untuk session management
```

Konsultasikan dengan dokumentasi Express.js tentang session store options.

---

**Setelah deploy berhasil**, project Anda akan accessible di:
```
https://[project-name].vercel.app
```

Happy deploying! 🚀
