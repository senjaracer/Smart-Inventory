const ProfilePage = {
  render() {
    const container = document.getElementById('appContent');
    
    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-info">
          <h2>Profile Kelompok</h2>
          <p>Daftar anggota kelompok project Smart Inventory.</p>
        </div>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>NIM</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-weight: 600;">Ameta Noveolyn</td>
                <td style="font-family: monospace;">103012300240</td>
              </tr>
              <tr>
                <td style="font-weight: 600;">Darrel Saverio</td>
                <td style="font-family: monospace;">103012300426</td>
              </tr>
              <tr>
                <td style="font-weight: 600;">Fazri Ihza Pratama</td>
                <td style="font-family: monospace;">103012300323</td>
              </tr>
              <tr>
                <td style="font-weight: 600;">Muhammad Raffa Putra Hermawan</td>
                <td style="font-family: monospace;">103012300051</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
};
