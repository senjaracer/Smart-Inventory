// === Barang Page ===
const BarangPage = {
  currentSearch: '',
  currentKategori: '',
  currentStatus: '',

  async render() {
    const container = document.getElementById('appContent');
    container.innerHTML = '<div class="loading"><div class="spinner"></div> Memuat data barang...</div>';
    try {
      const [kategoriList] = await Promise.all([API.getKategori()]);
      const katOptions = kategoriList.map(k => `<option value="${k.id}">${k.nama}</option>`).join('');

      container.innerHTML = `
        <div class="page-header">
          <div class="page-header-info">
            <h2>Manajemen Inventaris</h2>
            <p>Kelola data barang, stok, dan harga dengan efisien.</p>
          </div>
          <button class="btn btn-primary" id="btnAddBarang">
            <span class="material-symbols-outlined">add</span> Tambah Barang
          </button>
        </div>
        <div class="table-container">
          <div class="table-toolbar">
            <div class="table-toolbar-left">
              <div class="table-search">
                <span class="material-symbols-outlined">search</span>
                <input type="text" placeholder="Cari barang..." id="searchBarang"/>
              </div>
              <select class="filter-select" id="filterKategori">
                <option value="">Semua Kategori</option>${katOptions}
              </select>
              <select class="filter-select" id="filterStatus">
                <option value="">Status Stok</option>
                <option value="tersedia">Tersedia</option>
                <option value="menipis">Menipis</option>
                <option value="habis">Habis</option>
              </select>
            </div>
            <div class="table-toolbar-right">
              <button class="btn btn-outline" title="Filter"><span class="material-symbols-outlined">filter_list</span></button>
              <button class="btn btn-outline" title="Export"><span class="material-symbols-outlined">download</span></button>
            </div>
          </div>
          <div style="overflow-x:auto">
            <table class="data-table">
              <thead><tr>
                <th>Kode Barang</th><th>Nama Barang</th><th>Kategori</th>
                <th>Stok</th><th>Satuan</th><th style="text-align:right">Harga Beli</th>
                <th style="text-align:center">Aksi</th>
              </tr></thead>
              <tbody id="barangTableBody"></tbody>
            </table>
          </div>
          <div class="pagination" id="barangPagination"></div>
        </div>
      `;

      document.getElementById('btnAddBarang').onclick = () => this.showForm(null, kategoriList);
      document.getElementById('searchBarang').oninput = (e) => { this.currentSearch = e.target.value; this.loadData(kategoriList); };
      document.getElementById('filterKategori').onchange = (e) => { this.currentKategori = e.target.value; this.loadData(kategoriList); };
      document.getElementById('filterStatus').onchange = (e) => { this.currentStatus = e.target.value; this.loadData(kategoriList); };

      await this.loadData(kategoriList);
    } catch (err) {
      container.innerHTML = `<div class="empty-state"><span class="material-symbols-outlined">error</span><p>${err.message}</p></div>`;
    }
  },

  async loadData(kategoriList) {
    const tbody = document.getElementById('barangTableBody');
    const params = new URLSearchParams();
    if (this.currentSearch) params.set('search', this.currentSearch);
    if (this.currentKategori) params.set('kategoriId', this.currentKategori);
    if (this.currentStatus) params.set('status', this.currentStatus);

    try {
      const barang = await API.getBarang(params.toString());
      const fmtRp = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
      const getStokBadge = (stok) => {
        if (stok === 0) return `<span class="badge badge-danger">${stok}</span>`;
        if (stok <= 5) return `<span class="badge badge-warning">${stok}</span>`;
        if (stok <= 15) return `<span class="badge badge-success">${stok}</span>`;
        return `<span class="badge badge-neutral">${stok}</span>`;
      };

      if (barang.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><span class="material-symbols-outlined">inventory_2</span><p>Tidak ada barang ditemukan</p></div></td></tr>';
        document.getElementById('barangPagination').innerHTML = '';
        return;
      }

      tbody.innerHTML = barang.map(b => `<tr>
        <td style="font-weight:500">${b.id}</td>
        <td>${b.nama}</td>
        <td style="color:var(--on-surface-variant)">${b.kategoriNama || '-'}</td>
        <td>${getStokBadge(b.stok)}</td>
        <td style="color:var(--on-surface-variant)">${b.satuan}</td>
        <td style="text-align:right">${fmtRp(b.hargaBeli)}</td>
        <td class="actions-cell"><div class="action-btns">
          <button class="btn-ghost" onclick="BarangPage.showForm('${b.id}', null)" title="Edit"><span class="material-symbols-outlined">edit</span></button>
          <button class="btn-ghost btn-ghost-danger" onclick="BarangPage.confirmDelete('${b.id}','${b.nama.replace(/'/g, "\\'")}')" title="Hapus"><span class="material-symbols-outlined">delete</span></button>
        </div></td>
      </tr>`).join('');

      document.getElementById('barangPagination').innerHTML = `
        <span class="pagination-info">Menampilkan <span>1</span> hingga <span>${barang.length}</span> dari <span>${barang.length}</span> hasil</span>
        <div class="pagination-btns"><button class="page-btn active">1</button></div>
      `;
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><p>Error: ${err.message}</p></div></td></tr>`;
    }
  },

  async showForm(id, kategoriListParam) {
    let kategoriList = kategoriListParam;
    if (!kategoriList) kategoriList = await API.getKategori();
    const supplierList = await API.getSupplier();
    let item = null;
    if (id) item = await API.getBarangById(id);

    const katOptions = kategoriList.map(k => `<option value="${k.id}" ${item && item.kategoriId === k.id ? 'selected' : ''}>${k.nama}</option>`).join('');
    const supOptions = supplierList.map(s => `<option value="${s.id}" ${item && item.supplierId === s.id ? 'selected' : ''}>${s.nama}</option>`).join('');

    App.showModal(`
      <div class="modal-header">
        <h3>${id ? 'Edit Barang' : 'Tambah Barang Baru'}</h3>
        <button class="modal-close" onclick="App.closeModal()"><span class="material-symbols-outlined">close</span></button>
      </div>
      <form id="formBarang">
        <div class="form-group"><label>Nama Barang</label><input type="text" name="nama" value="${item ? item.nama : ''}" required/></div>
        <div class="form-row">
          <div class="form-group"><label>Kategori</label><select name="kategoriId" required><option value="">Pilih Kategori</option>${katOptions}</select></div>
          <div class="form-group"><label>Supplier</label><select name="supplierId" required><option value="">Pilih Supplier</option>${supOptions}</select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Stok</label><input type="number" name="stok" min="0" value="${item ? item.stok : 0}" required/></div>
          <div class="form-group"><label>Satuan</label><input type="text" name="satuan" value="${item ? item.satuan : ''}" placeholder="Unit, Pcs, Rim..." required/></div>
        </div>
        <div class="form-group"><label>Harga Beli (Rp)</label><input type="number" name="hargaBeli" min="0" value="${item ? item.hargaBeli : ''}" required/></div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" onclick="App.closeModal()">Batal</button>
          <button type="submit" class="btn btn-primary">${id ? 'Simpan' : 'Tambah'}</button>
        </div>
      </form>
    `);

    document.getElementById('formBarang').onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const payload = Object.fromEntries(fd);
      try {
        if (id) { await API.updateBarang(id, payload); App.toast('Barang berhasil diperbarui', 'success'); }
        else { await API.createBarang(payload); App.toast('Barang berhasil ditambahkan', 'success'); }
        App.closeModal();
        this.render();
      } catch (err) { App.toast(err.message, 'error'); }
    };
  },

  confirmDelete(id, nama) {
    App.showModal(`
      <div class="modal-header">
        <h3>Hapus Barang</h3>
        <button class="modal-close" onclick="App.closeModal()"><span class="material-symbols-outlined">close</span></button>
      </div>
      <p style="margin-bottom:var(--spacing-md);color:var(--on-surface-variant)">Apakah Anda yakin ingin menghapus <strong>"${nama}"</strong>? Tindakan ini tidak dapat dibatalkan.</p>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="App.closeModal()">Batal</button>
        <button class="btn btn-danger" id="btnConfirmDelete">Hapus</button>
      </div>
    `);
    document.getElementById('btnConfirmDelete').onclick = async () => {
      try {
        await API.deleteBarang(id);
        App.toast('Barang berhasil dihapus', 'success');
        App.closeModal();
        this.render();
      } catch (err) { App.toast(err.message, 'error'); }
    };
  }
};
