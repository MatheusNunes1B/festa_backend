// menuService.js — Frontend (Cloudflare Pages)
// Serviço de integração com a API do cardápio
// Inclui cache local, tratamento de erro e retry

const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : 'https://arraia-boa-demais.vercel.app/api';

const CACHE_KEY   = 'arraia_menu_cache';
const CACHE_TTL   = 5 * 60 * 1000; // 5 minutos

/* ── Utilitários ── */
function getCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL) return null;
    return data;
  } catch { return null; }
}

function setCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch { /* storage cheio, ignora */ }
}

async function fetchWithRetry(url, options = {}, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(8000),
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      return await res.json();
    } catch (err) {
      if (i === retries) throw err;
      // Espera exponencial antes de tentar de novo
      await new Promise(r => setTimeout(r, 500 * (i + 1)));
    }
  }
}

/* ══════════════════════════════════════
   PUBLIC API
══════════════════════════════════════ */

const menuService = {

  /* ── Buscar todos os itens ── */
  async getAll({ category, featured, search, sort, forceRefresh = false } = {}) {
    // Usar cache se disponível (só para busca sem filtros)
    if (!category && !featured && !search && !sort && !forceRefresh) {
      const cached = getCache();
      if (cached) return cached;
    }

    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (featured) params.set('featured', featured);
    if (search)   params.set('search', search);
    if (sort)     params.set('sort', sort);

    const url = `${API_BASE}/menu${params.toString() ? '?' + params : ''}`;
    const data = await fetchWithRetry(url);

    // Salvar no cache apenas busca sem filtros
    if (!category && !featured && !search && !sort) setCache(data);

    return data;
  },

  /* ── Buscar categorias ── */
  async getCategories() {
    return fetchWithRetry(`${API_BASE}/menu/categories`);
  },

  /* ── Buscar item por ID ── */
  async getById(id) {
    return fetchWithRetry(`${API_BASE}/menu/${id}`);
  },

  /* ── Criar item (admin) ── */
  async create(payload, token) {
    return fetchWithRetry(`${API_BASE}/menu`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
  },

  /* ── Atualizar item (admin) ── */
  async update(id, payload, token) {
    // Invalida cache ao modificar
    sessionStorage.removeItem(CACHE_KEY);
    return fetchWithRetry(`${API_BASE}/menu/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
  },

  /* ── Deletar item (admin) ── */
  async delete(id, token) {
    sessionStorage.removeItem(CACHE_KEY);
    return fetchWithRetry(`${API_BASE}/menu/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /* ── Toggle disponibilidade ── */
  async toggleAvailability(id, currentStatus, token) {
    return this.update(id, { available: !currentStatus }, token);
  },

  /* ── Toggle destaque ── */
  async toggleFeatured(id, currentStatus, token) {
    return this.update(id, { featured: !currentStatus }, token);
  },

  /* ── Limpar cache ── */
  clearCache() {
    sessionStorage.removeItem(CACHE_KEY);
  },
};

export default menuService;

/* ══════════════════════════════════════
   EXEMPLOS DE USO:
   ──────────────────────────────────────
   import menuService from './menuService.js';

   // Listar todos
   const { items, total } = await menuService.getAll();

   // Filtrar por categoria
   const { items } = await menuService.getAll({ category: 'Espetinhos' });

   // Buscar
   const { items } = await menuService.getAll({ search: 'frango' });

   // Criar (admin)
   const { item } = await menuService.create({
     name: 'Novo Prato',
     price: 15.00,
     category: 'Pratos',
     available: true,
   }, adminToken);

   // Atualizar
   await menuService.update(id, { price: 18.00 }, adminToken);

   // Deletar
   await menuService.delete(id, adminToken);
══════════════════════════════════════ */