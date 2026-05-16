// === Supplier Page ===
const SupplierPage = {
  async render() {
    const container = document.getElementById('appContent');
    container.innerHTML = '<div class="loading"><div class="spinner"></div> Memuat...</div>';
    try {
      container.innerHTML = `
        <div class="page-header">
          <div class="page-header-info">
            <h2>Manajemen Supplier</h2>
            <p>Kelola informasi kontak dan data supplier barang.</p>
          </div>
          <button class="btn btn-primary" id="btnAddSupplier">
            <span class="material-symbols-outlined">add</span> Tambah Supplier
          </button>
        </div>
        <div class="table-container">
          <div class="table-toolbar">
            <div class="table-toolbar-left">
              <div class="table-search">
                <span class="material-symbols-outlined">search</span>
                <input type="text" placeholder="Cari nama supplier atau email..." id="searchSupplier"/>
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
                <th style="width:60px;text-align:center">No</th><th>Nama Supplier</th>
                <th>Kontak</th><th>Email</th><th>Alamat</th>
                <th style="text-align:center;width:100px">Aksi</th>
              </tr></thead>
              <tbody id="supplierTableBody"></tbody>
            </table>
          </div>
          <div class="pagination" id="supplierPagination"></div>
        </div>
      `;
      document.getElementById('btnAddSupplier').onclick = () => this.showForm(null);
      document.getElementById('searchSupplier').oninput = (e) => this.loadData(e.target.value);
      await this.loadData('');
    } catch (err) {
      container.innerHTML = `<div class="empty-state"><span class="material-symbols-outlined">error</span><p>${err.message}</p></div>`;
    }
  },

  async loadData(search) {
    const tbody = document.getElementById('supplierTableBody');
    try {
      const params = search ? `search=${encodeURIComponent(search)}` : '';
      const data = await API.getSupplier(params);
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><span class="material-symbols-outlined">local_shipping</span><p>Tidak ada supplier</p></div></td></tr>';
        document.getElementById('supplierPagination').innerHTML = '';
        return;
      }
      tbody.innerHTML = data.map((s, i) => `<tr>
        <td style="text-align:center;color:var(--on-surface-variant)">${i + 1}</td>
        <td style="font-weight:500">${s.nama}</td>
        <td style="color:var(--on-surface-variant)">${s.kontak}</td>
        <td style="color:var(--on-surface-variant)">${s.email}</td>
        <td style="color:var(--on-surface-variant);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${s.alamat}">${s.alamat}</td>
        <td class="actions-cell"><div class="action-btns">
          <button class="btn-ghost" onclick="SupplierPage.showForm('${s.id}')" title="Edit"><span class="material-symbols-outlined">edit</span></button>
          <button class="btn-ghost btn-ghost-danger" onclick="SupplierPage.confirmDelete('${s.id}','${s.nama.replace(/'/g, "\\'")}')" title="Hapus"><span class="material-symbols-outlined">delete</span></button>
        </div></td>
      </tr>`).join('');
      document.getElementById('supplierPagination').innerHTML = `
        <span class="pagination-info">Showing <span>1</span> to <span>${data.length}</span> of <span>${data.length}</span> entries</span>
        <div class="pagination-btns"><button class="page-btn active">1</button></div>
      `;
    } catch (err) { tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><p>${err.message}</p></div></td></tr>`; }
  },

  async showForm(id) {
    let item = null;
    if (id) { const all = await API.getSupplier(); item = all.find(s => s.id === id); }
    App.showModal(`
      <div class="modal-header">
        <h3>${id ? 'Edit Supplier' : 'Tambah Supplier Baru'}</h3>
        <button class="modal-close" onclick="App.closeModal()"><span class="material-symbols-outlined">close</span></button>
      </div>
      <form id="formSupplier">
        <div class="form-group"><label>Nama Supplier</label><input type="text" name="nama" value="${item ? item.nama : ''}" required/></div>
        <div class="form-row">
          <div class="form-group"><label>Kontak</label><input type="text" name="kontak" value="${item ? item.kontak : ''}" placeholder="0812-xxxx-xxxx" required/></div>
          <div class="form-group"><label>Email</label><input type="email" name="email" value="${item ? item.email : ''}" required/></div>
        </div>
        <div class="form-group"><label>Alamat</label><textarea name="alamat" required>${item ? item.alamat : ''}</textarea></div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" onclick="App.closeModal()">Batal</button>
          <button type="submit" class="btn btn-primary">${id ? 'Simpan' : 'Tambah'}</button>
        </div>
      </form>
    `);
    document.getElementById('formSupplier').onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const payload = Object.fromEntries(fd);
      try {
        if (id) { await API.updateSupplier(id, payload); App.toast('Supplier berhasil diperbarui', 'success'); }
        else { await API.createSupplier(payload); App.toast('Supplier berhasil ditambahkan', 'success'); }
        App.closeModal(); this.render();
      } catch (err) { App.toast(err.message, 'error'); }
    };
  },

  confirmDelete(id, nama) {
    App.showModal(`
      <div class="modal-header"><h3>Hapus Supplier</h3><button class="modal-close" onclick="App.closeModal()"><span class="material-symbols-outlined">close</span></button></div>
      <p style="margin-bottom:var(--spacing-md);color:var(--on-surface-variant)">Apakah Anda yakin ingin menghapus supplier <strong>"${nama}"</strong>?</p>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="App.closeModal()">Batal</button>
        <button class="btn btn-danger" id="btnConfirmDelete">Hapus</button>
      </div>
    `);
    document.getElementById('btnConfirmDelete').onclick = async () => {
      try { await API.deleteSupplier(id); App.toast('Supplier berhasil dihapus', 'success'); App.closeModal(); this.render(); }
      catch (err) { App.toast(err.message, 'error'); }
    };
  }
};
