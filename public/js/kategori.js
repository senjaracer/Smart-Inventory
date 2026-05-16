// === Kategori Page ===
const KategoriPage = {
  async render() {
    const container = document.getElementById('appContent');
    container.innerHTML = '<div class="loading"><div class="spinner"></div> Memuat...</div>';
    try {
      container.innerHTML = `
        <div class="page-header">
          <div class="page-header-info">
            <h2>Manajemen Kategori</h2>
            <p>Kelola pengelompokan barang untuk organisasi inventaris yang lebih baik.</p>
          </div>
          <button class="btn btn-primary" id="btnAddKategori">
            <span class="material-symbols-outlined">add</span> Tambah Kategori
          </button>
        </div>
        <div class="table-container">
          <div class="table-toolbar">
            <div class="table-toolbar-left">
              <div class="table-search">
                <span class="material-symbols-outlined">search</span>
                <input type="text" placeholder="Saring tabel..." id="searchKategori"/>
              </div>
            </div>
            <div class="table-toolbar-right">
              <button class="btn btn-outline"><span class="material-symbols-outlined">filter_list</span> Filter</button>
              <button class="btn btn-outline"><span class="material-symbols-outlined">download</span> Export</button>
            </div>
          </div>
          <div style="overflow-x:auto">
            <table class="data-table">
              <thead><tr>
                <th style="width:60px">No</th><th>Nama Kategori</th>
                <th style="text-align:right;width:130px">Jumlah Barang</th>
                <th>Deskripsi</th><th style="text-align:center;width:100px">Aksi</th>
              </tr></thead>
              <tbody id="kategoriTableBody"></tbody>
            </table>
          </div>
          <div class="pagination" id="kategoriPagination"></div>
        </div>
      `;
      document.getElementById('btnAddKategori').onclick = () => this.showForm(null);
      document.getElementById('searchKategori').oninput = (e) => this.loadData(e.target.value);
      await this.loadData('');
    } catch (err) {
      container.innerHTML = `<div class="empty-state"><span class="material-symbols-outlined">error</span><p>${err.message}</p></div>`;
    }
  },

  async loadData(search) {
    const tbody = document.getElementById('kategoriTableBody');
    try {
      const params = search ? `search=${encodeURIComponent(search)}` : '';
      const data = await API.getKategori(params);
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><span class="material-symbols-outlined">category</span><p>Tidak ada kategori</p></div></td></tr>';
        document.getElementById('kategoriPagination').innerHTML = '';
        return;
      }
      tbody.innerHTML = data.map((k, i) => `<tr>
        <td style="color:var(--on-surface-variant)">${i + 1}</td>
        <td style="font-weight:500">${k.nama}</td>
        <td style="text-align:right"><span class="badge badge-info">${k.jumlahBarang}</span></td>
        <td style="color:var(--on-surface-variant);max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${k.deskripsi || '-'}</td>
        <td class="actions-cell"><div class="action-btns">
          <button class="btn-ghost" onclick="KategoriPage.showForm('${k.id}')" title="Edit"><span class="material-symbols-outlined">edit</span></button>
          <button class="btn-ghost btn-ghost-danger" onclick="KategoriPage.confirmDelete('${k.id}','${k.nama.replace(/'/g, "\\'")}')" title="Hapus"><span class="material-symbols-outlined">delete</span></button>
        </div></td>
      </tr>`).join('');
      document.getElementById('kategoriPagination').innerHTML = `
        <span class="pagination-info">Menampilkan <span>1-${data.length}</span> dari <span>${data.length}</span> entri</span>
        <div class="pagination-btns"><button class="page-btn active">1</button></div>
      `;
    } catch (err) { tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><p>${err.message}</p></div></td></tr>`; }
  },

  async showForm(id) {
    let item = null;
    if (id) { const all = await API.getKategori(); item = all.find(k => k.id === id); }
    App.showModal(`
      <div class="modal-header">
        <h3>${id ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h3>
        <button class="modal-close" onclick="App.closeModal()"><span class="material-symbols-outlined">close</span></button>
      </div>
      <form id="formKategori">
        <div class="form-group"><label>Nama Kategori</label><input type="text" name="nama" value="${item ? item.nama : ''}" required/></div>
        <div class="form-group"><label>Deskripsi</label><textarea name="deskripsi">${item ? item.deskripsi : ''}</textarea></div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" onclick="App.closeModal()">Batal</button>
          <button type="submit" class="btn btn-primary">${id ? 'Simpan' : 'Tambah'}</button>
        </div>
      </form>
    `);
    document.getElementById('formKategori').onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const payload = Object.fromEntries(fd);
      try {
        if (id) { await API.updateKategori(id, payload); App.toast('Kategori berhasil diperbarui', 'success'); }
        else { await API.createKategori(payload); App.toast('Kategori berhasil ditambahkan', 'success'); }
        App.closeModal(); this.render();
      } catch (err) { App.toast(err.message, 'error'); }
    };
  },

  confirmDelete(id, nama) {
    App.showModal(`
      <div class="modal-header"><h3>Hapus Kategori</h3><button class="modal-close" onclick="App.closeModal()"><span class="material-symbols-outlined">close</span></button></div>
      <p style="margin-bottom:var(--spacing-md);color:var(--on-surface-variant)">Apakah Anda yakin ingin menghapus kategori <strong>"${nama}"</strong>?</p>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="App.closeModal()">Batal</button>
        <button class="btn btn-danger" id="btnConfirmDelete">Hapus</button>
      </div>
    `);
    document.getElementById('btnConfirmDelete').onclick = async () => {
      try { await API.deleteKategori(id); App.toast('Kategori berhasil dihapus', 'success'); App.closeModal(); this.render(); }
      catch (err) { App.toast(err.message, 'error'); }
    };
  }
};
