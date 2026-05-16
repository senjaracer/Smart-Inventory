# Smart Inventory - Admin Dashboard

Aplikasi manajemen inventaris modern dengan arsitektur full-stack, menggunakan Node.js/Express untuk backend dan vanilla HTML/CSS/JS untuk frontend.

## 🏗️ Arsitektur

```
Smart Inventory/
├── server/                    ← Backend (Node.js + Express)
│   ├── server.js              ← Entry point
│   ├── data/                  ← JSON Database
│   │   ├── barang.json
│   │   ├── kategori.json
│   │   └── supplier.json
│   └── routes/                ← REST API Routes
│       ├── dashboard.js
│       ├── barang.js
│       ├── kategori.js
│       └── supplier.js
├── public/                    ← Frontend (Vanilla HTML/CSS/JS)
│   ├── index.html             ← SPA Shell
│   ├── css/styles.css         ← Design System CSS
│   └── js/
│       ├── api.js             ← HTTP Client
│       ├── app.js             ← Main Controller & Router
│       ├── dashboard.js       ← Dashboard Page
│       ├── barang.js          ← Barang Page
│       ├── kategori.js        ← Kategori Page
│       └── supplier.js        ← Supplier Page
└── package.json
```

## 🚀 Cara Menjalankan

```bash
# 1. Install dependencies
npm install

# 2. Jalankan server
npm start

# 3. Buka di browser
# http://localhost:3000
```

## 📡 API Endpoints

| Method | Endpoint           | Deskripsi              |
|--------|--------------------|------------------------|
| GET    | /api/dashboard     | Statistik dashboard    |
| GET    | /api/barang        | Daftar semua barang    |
| POST   | /api/barang        | Tambah barang baru     |
| PUT    | /api/barang/:id    | Update barang          |
| DELETE | /api/barang/:id    | Hapus barang           |
| GET    | /api/kategori      | Daftar semua kategori  |
| POST   | /api/kategori      | Tambah kategori baru   |
| PUT    | /api/kategori/:id  | Update kategori        |
| DELETE | /api/kategori/:id  | Hapus kategori         |
| GET    | /api/supplier      | Daftar semua supplier  |
| POST   | /api/supplier      | Tambah supplier baru   |
| PUT    | /api/supplier/:id  | Update supplier        |
| DELETE | /api/supplier/:id  | Hapus supplier         |

## 🛠️ Tech Stack

- **Backend**: Node.js + Express.js
- **Frontend**: HTML5 + CSS3 + JavaScript (ES6+)
- **Database**: Local JSON Files
- **Komunikasi**: HTTP REST API (fetch)
- **Icons**: Material Symbols Outlined
- **Font**: Inter (Google Fonts)
