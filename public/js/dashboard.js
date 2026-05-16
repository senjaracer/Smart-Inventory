// === Dashboard Page ===
const DashboardPage = {
  async render() {
    const container = document.getElementById('appContent');
    container.innerHTML = '<div class="loading"><div class="spinner"></div> Memuat dashboard...</div>';

    try {
      const data = await API.getDashboard();
      const fmt = (n) => new Intl.NumberFormat('id-ID').format(n);
      const fmtRp = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

      container.innerHTML = `
        <div class="page-header">
          <div class="page-header-info">
            <h2>Daftar Ringkasan</h2>
            <p>Overview metrik inventaris terkini.</p>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-card-top">
              <span class="summary-card-label">Total Barang</span>
              <div class="summary-card-icon"><span class="material-symbols-outlined">inventory_2</span></div>
            </div>
            <div>
              <div class="summary-card-value">${fmt(data.totalBarang)}</div>
              <div class="summary-card-trend trend-up">
                <span class="material-symbols-outlined" style="font-size:18px">trending_up</span>
                <span>${fmt(data.totalStok)} unit total stok</span>
              </div>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-card-top">
              <span class="summary-card-label">Total Kategori</span>
              <div class="summary-card-icon"><span class="material-symbols-outlined">category</span></div>
            </div>
            <div>
              <div class="summary-card-value">${fmt(data.totalKategori)}</div>
              <div class="summary-card-trend trend-neutral">
                <span class="material-symbols-outlined" style="font-size:18px">horizontal_rule</span>
                <span>Pengelompokan aktif</span>
              </div>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-card-top">
              <span class="summary-card-label">Total Supplier</span>
              <div class="summary-card-icon"><span class="material-symbols-outlined">local_shipping</span></div>
            </div>
            <div>
              <div class="summary-card-value">${fmt(data.totalSupplier)}</div>
              <div class="summary-card-trend trend-neutral">
                <span class="material-symbols-outlined" style="font-size:18px">handshake</span>
                <span>Mitra pemasok</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Chart & Alerts -->
        <div class="dashboard-grid">
          <div class="card chart-container">
            <h3 class="text-headline-sm" style="margin-bottom:var(--spacing-md)">Stok per Kategori</h3>
            <div class="chart-bar-group" id="categoryChart"></div>
          </div>
          <div class="card">
            <h3 class="text-headline-sm" style="margin-bottom:var(--spacing-md)">
              <span class="material-symbols-outlined" style="color:var(--error);vertical-align:middle;font-size:20px">warning</span>
              Peringatan Stok
            </h3>
            <div class="alert-list" id="alertList"></div>
          </div>
        </div>

        <!-- Recent Items -->
        <div class="table-container">
          <div class="table-toolbar">
            <h3 class="text-label-md">Barang Terbaru</h3>
          </div>
          <div style="overflow-x:auto">
            <table class="data-table">
              <thead><tr>
                <th>Kode</th><th>Nama Barang</th><th>Kategori</th>
                <th>Stok</th><th style="text-align:right">Harga Beli</th>
              </tr></thead>
              <tbody id="recentTable"></tbody>
            </table>
          </div>
        </div>
      `;

      // Render chart bars
      const maxStok = Math.max(...data.perKategori.map(k => k.totalStok), 1);
      document.getElementById('categoryChart').innerHTML = data.perKategori.map(k => {
        const h = Math.max((k.totalStok / maxStok) * 180, 8);
        return `<div class="chart-bar-item">
          <div class="chart-bar" style="height:${h}px"><span class="chart-bar-value">${fmt(k.totalStok)}</span></div>
          <span class="chart-bar-label">${k.nama}</span>
        </div>`;
      }).join('');

      // Render alerts
      const alerts = [...data.stokMenipis, ...data.stokHabis];
      document.getElementById('alertList').innerHTML = alerts.length === 0
        ? '<p style="color:var(--on-surface-variant);font-size:14px;text-align:center;padding:24px">Semua stok aman ✓</p>'
        : alerts.map(a => `<div class="alert-item">
            <span class="material-symbols-outlined">${a.stok === 0 ? 'error' : 'warning'}</span>
            <span class="alert-item-text">${a.nama}</span>
            <span class="alert-item-stock">${a.stok} ${a.satuan || ''}</span>
          </div>`).join('');

      // Render recent table
      const getStokBadge = (stok) => {
        if (stok === 0) return `<span class="badge badge-danger">${stok}</span>`;
        if (stok <= 5) return `<span class="badge badge-warning">${stok}</span>`;
        if (stok <= 15) return `<span class="badge badge-success">${stok}</span>`;
        return `<span class="badge badge-neutral">${stok}</span>`;
      };
      document.getElementById('recentTable').innerHTML = data.recentItems.map(b => `<tr>
        <td style="font-weight:500">${b.id}</td>
        <td>${b.nama}</td>
        <td style="color:var(--on-surface-variant)">${b.kategoriNama}</td>
        <td>${getStokBadge(b.stok)}</td>
        <td style="text-align:right">${fmtRp(b.hargaBeli)}</td>
      </tr>`).join('');

    } catch (err) {
      container.innerHTML = `<div class="empty-state"><span class="material-symbols-outlined">error</span><p>Gagal memuat dashboard: ${err.message}</p></div>`;
    }
  }
};
