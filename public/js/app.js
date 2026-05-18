// === Main App Controller ===
const App = {
  currentPage: 'dashboard',

  init() {
    this.bindLogin();
    this.bindTogglePassword();
    this.checkAuth();
    window.addEventListener('hashchange', () => this.handleRoute());
  },

  // === Auth State ===
  checkAuth() {
    if (API.isLoggedIn()) {
      this.showApp();
    } else {
      this.showLogin();
    }
  },

  showLogin() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('loginScreen').style.display = '';
    document.getElementById('appShell').style.display = 'none';
    // Clear form
    const form = document.getElementById('loginForm');
    if (form) form.reset();
    document.getElementById('loginError').classList.remove('visible');
    document.getElementById('loginError').textContent = '';
  },

  showApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appShell').style.display = '';
    this.updateUserDisplay();
    this.bindNav();
    this.bindMobile();
    this.bindLogout();
    this.handleRoute();
  },

  updateUserDisplay() {
    const user = API.getUser();
    if (!user) return;
    const initial = user.nama ? user.nama.charAt(0).toUpperCase() : 'U';

    // Sidebar
    const sName = document.getElementById('sidebarUserName');
    const sEmail = document.getElementById('sidebarUserEmail');
    const sAvatar = document.getElementById('sidebarAvatar');
    if (sName) sName.textContent = user.nama;
    if (sEmail) sEmail.textContent = user.email;
    if (sAvatar) sAvatar.textContent = initial;

    // Topbar
    const tName = document.getElementById('topbarUserName');
    const tAvatar = document.getElementById('topbarAvatar');
    if (tName) tName.textContent = user.nama;
    if (tAvatar) tAvatar.textContent = initial;
  },

  // === Login Form ===
  bindLogin() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const errorEl = document.getElementById('loginError');
      const btn = document.getElementById('loginBtn');

      // Reset error
      errorEl.classList.remove('visible');
      errorEl.textContent = '';

      // Disable button during request
      btn.disabled = true;
      btn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px"></div> <span>Memproses...</span>';

      try {
        await API.login(email, password);
        this.showApp();
      } catch (err) {
        errorEl.innerHTML = `<span class="material-symbols-outlined" style="font-size:18px">error</span> ${err.message}`;
        errorEl.classList.add('visible');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined">login</span> <span>Masuk</span>';
      }
    });
  },

  bindTogglePassword() {
    const toggleBtn = document.getElementById('togglePw');
    if (!toggleBtn) return;
    toggleBtn.addEventListener('click', () => {
      const input = document.getElementById('loginPassword');
      const icon = toggleBtn.querySelector('.material-symbols-outlined');
      if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = 'visibility_off';
      } else {
        input.type = 'password';
        icon.textContent = 'visibility';
      }
    });
  },

  // === Logout ===
  bindLogout() {
    const btn = document.getElementById('btnLogout');
    if (!btn) return;
    btn.onclick = () => {
      this.showModal(`
        <div class="modal-header">
          <h3>Konfirmasi Logout</h3>
          <button class="modal-close" onclick="App.closeModal()"><span class="material-symbols-outlined">close</span></button>
        </div>
        <p style="margin-bottom:var(--spacing-md);color:var(--on-surface-variant)">
          Apakah Anda yakin ingin keluar dari aplikasi?
        </p>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="App.closeModal()">Batal</button>
          <button class="btn btn-danger" id="btnConfirmLogout">
            <span class="material-symbols-outlined">logout</span> Logout
          </button>
        </div>
      `);
      document.getElementById('btnConfirmLogout').onclick = async () => {
        await API.logout();
        this.closeModal();
        window.location.hash = '';
        this.showLogin();
        this.toast('Berhasil logout', 'success');
      };
    };
  },

  // === Navigation ===
  bindNav() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        window.location.hash = page;
      });
    });
  },

  bindMobile() {
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');

    if (menuBtn) {
      menuBtn.onclick = () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
      };
    }
    if (overlay) {
      overlay.onclick = () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
      };
    }
  },

  handleRoute() {
    // Guard: if not logged in, show login
    if (!API.isLoggedIn()) {
      this.showLogin();
      return;
    }

    const hash = window.location.hash.replace('#', '') || 'dashboard';

    // If hash is "login", redirect to dashboard since already logged in
    if (hash === 'login') {
      window.location.hash = 'dashboard';
      return;
    }

    this.currentPage = hash;

    // Update active nav
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.page === hash);
    });

    // Update topbar title
    const titles = { 
      dashboard: 'Dashboard', 
      barang: 'Daftar Barang', 
      kategori: 'Kategori', 
      supplier: 'Supplier',
      profile: 'Profile Kelompok'
    };
    document.getElementById('topbarTitle').textContent = titles[hash] || 'Dashboard';

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('mobileOverlay').classList.remove('active');

    // Render page
    switch (hash) {
      case 'barang': BarangPage.render(); break;
      case 'kategori': KategoriPage.render(); break;
      case 'supplier': SupplierPage.render(); break;
      case 'profile': ProfilePage.render(); break;
      default: DashboardPage.render(); break;
    }
  },

  // Modal utilities
  showModal(html) {
    document.getElementById('modalContent').innerHTML = html;
    document.getElementById('modalOverlay').classList.add('active');
  },
  closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
  },

  // Toast utility
  toast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const icon = type === 'success' ? 'check_circle' : 'error';
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span class="material-symbols-outlined">${icon}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }
};

// Close modal on overlay click
document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) App.closeModal();
});

// Init
document.addEventListener('DOMContentLoaded', () => App.init());

