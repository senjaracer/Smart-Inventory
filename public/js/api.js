// === API Client for Smart Inventory ===
const API = {
  BASE: '/api',

  getToken() {
    return localStorage.getItem('si_token');
  },

  setToken(token) {
    localStorage.setItem('si_token', token);
  },

  clearToken() {
    localStorage.removeItem('si_token');
    localStorage.removeItem('si_user');
  },

  getUser() {
    const u = localStorage.getItem('si_user');
    return u ? JSON.parse(u) : null;
  },

  setUser(user) {
    localStorage.setItem('si_user', JSON.stringify(user));
  },

  async request(endpoint, options = {}) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      const token = this.getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${this.BASE}${endpoint}`, {
        headers,
        ...options
      });
      const data = await res.json();

      // Auto-redirect to login on 401
      if (res.status === 401 && !endpoint.startsWith('/auth')) {
        this.clearToken();
        window.location.hash = 'login';
        throw new Error('Sesi habis. Silakan login kembali.');
      }

      if (!res.ok) throw new Error(data.error || 'Request failed');
      return data;
    } catch (err) {
      throw err;
    }
  },

  // Auth
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(data.token);
    this.setUser(data.user);
    return data;
  },

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (e) { /* ignore */ }
    this.clearToken();
  },

  async getMe() {
    return this.request('/auth/me');
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  // Dashboard
  getDashboard() { return this.request('/dashboard'); },

  // Barang
  getBarang(params = '') { return this.request(`/barang${params ? '?' + params : ''}`); },
  getBarangById(id) { return this.request(`/barang/${id}`); },
  createBarang(data) { return this.request('/barang', { method: 'POST', body: JSON.stringify(data) }); },
  updateBarang(id, data) { return this.request(`/barang/${id}`, { method: 'PUT', body: JSON.stringify(data) }); },
  deleteBarang(id) { return this.request(`/barang/${id}`, { method: 'DELETE' }); },

  // Kategori
  getKategori(params = '') { return this.request(`/kategori${params ? '?' + params : ''}`); },
  createKategori(data) { return this.request('/kategori', { method: 'POST', body: JSON.stringify(data) }); },
  updateKategori(id, data) { return this.request(`/kategori/${id}`, { method: 'PUT', body: JSON.stringify(data) }); },
  deleteKategori(id) { return this.request(`/kategori/${id}`, { method: 'DELETE' }); },

  // Supplier
  getSupplier(params = '') { return this.request(`/supplier${params ? '?' + params : ''}`); },
  createSupplier(data) { return this.request('/supplier', { method: 'POST', body: JSON.stringify(data) }); },
  updateSupplier(id, data) { return this.request(`/supplier/${id}`, { method: 'PUT', body: JSON.stringify(data) }); },
  deleteSupplier(id) { return this.request(`/supplier/${id}`, { method: 'DELETE' }); },
};

