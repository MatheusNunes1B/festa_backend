// menu.controller.js — Backend (Node.js / Vercel)
// Controller: valida input, chama service, formata resposta

import * as menuService from '../services/menu.service.js';

/* ── Helpers ── */
const ok  = (res, data, status = 200) => res.status(status).json({ success: true,  ...data });
const err = (res, msg, status = 500) =>  res.status(status).json({ success: false, error: msg });

function validateItem(body, requireAll = true) {
  const errors = [];

  if (requireAll || body.name !== undefined) {
    if (!body.name?.trim()) errors.push('name é obrigatório');
    else if (body.name.length > 200) errors.push('name muito longo (máx. 200 caracteres)');
  }

  if (requireAll || body.price !== undefined) {
    const price = parseFloat(body.price);
    if (isNaN(price) || price < 0) errors.push('price deve ser um número positivo');
  }

  if (requireAll || body.category !== undefined) {
    if (!body.category?.trim()) errors.push('category é obrigatória');
  }

  if (body.description && body.description.length > 1000)
    errors.push('description muito longa (máx. 1000 caracteres)');

  if (body.image_url && !body.image_url.startsWith('http'))
    errors.push('image_url deve ser uma URL válida');

  return errors;
}

/* ══════════════════════════════════════
   GET /api/menu
   Query: ?category= &featured= &available= &search= &sort=
══════════════════════════════════════ */
export async function getAll(req, res) {
  try {
    const filters = {
      category:  req.query.category,
      featured:  req.query.featured,
      available: req.query.available,
      search:    req.query.search,
      sort:      req.query.sort,
    };
    const result = await menuService.getAllMenuItems(filters);
    return ok(res, { items: result.items, total: result.total });
  } catch (e) {
    console.error('[menu.controller] getAll:', e.message);
    return err(res, 'Erro ao buscar cardápio');
  }
}

/* ══════════════════════════════════════
   GET /api/menu/categories
══════════════════════════════════════ */
export async function getCategories(req, res) {
  try {
    const categories = await menuService.getCategories();
    return ok(res, { categories });
  } catch (e) {
    console.error('[menu.controller] getCategories:', e.message);
    return err(res, 'Erro ao buscar categorias');
  }
}

/* ══════════════════════════════════════
   GET /api/menu/:id
══════════════════════════════════════ */
export async function getById(req, res) {
  try {
    const { id } = req.params;
    const item = await menuService.getMenuItemById(id);
    if (!item) return err(res, 'Item não encontrado', 404);
    return ok(res, { item });
  } catch (e) {
    console.error('[menu.controller] getById:', e.message);
    return err(res, 'Erro ao buscar item');
  }
}

/* ══════════════════════════════════════
   POST /api/menu
   Body: { name, description, price, image_url, category, available, featured }
══════════════════════════════════════ */
export async function create(req, res) {
  try {
    const errors = validateItem(req.body, true);
    if (errors.length) return err(res, errors.join('; '), 400);

    const payload = {
      name:        req.body.name.trim(),
      description: req.body.description?.trim() || null,
      price:       parseFloat(req.body.price),
      image_url:   req.body.image_url?.trim() || null,
      category:    req.body.category.trim(),
      available:   req.body.available !== false,
      featured:    req.body.featured === true,
    };

    const item = await menuService.createMenuItem(payload);
    return ok(res, { item }, 201);
  } catch (e) {
    console.error('[menu.controller] create:', e.message);
    return err(res, 'Erro ao criar item');
  }
}

/* ══════════════════════════════════════
   PUT /api/menu/:id
   Body: campos parciais ou completos
══════════════════════════════════════ */
export async function update(req, res) {
  try {
    const { id } = req.params;
    const errors = validateItem(req.body, false);
    if (errors.length) return err(res, errors.join('; '), 400);

    const payload = {};
    if (req.body.name        !== undefined) payload.name        = req.body.name.trim();
    if (req.body.description !== undefined) payload.description = req.body.description?.trim() || null;
    if (req.body.price       !== undefined) payload.price       = parseFloat(req.body.price);
    if (req.body.image_url   !== undefined) payload.image_url   = req.body.image_url?.trim() || null;
    if (req.body.category    !== undefined) payload.category    = req.body.category.trim();
    if (req.body.available   !== undefined) payload.available   = Boolean(req.body.available);
    if (req.body.featured    !== undefined) payload.featured    = Boolean(req.body.featured);

    const item = await menuService.updateMenuItem(id, payload);
    if (!item) return err(res, 'Item não encontrado', 404);
    return ok(res, { item });
  } catch (e) {
    console.error('[menu.controller] update:', e.message);
    return err(res, 'Erro ao atualizar item');
  }
}

/* ══════════════════════════════════════
   DELETE /api/menu/:id
══════════════════════════════════════ */
export async function remove(req, res) {
  try {
    const { id } = req.params;
    const deleted = await menuService.deleteMenuItem(id);
    if (!deleted) return err(res, 'Item não encontrado', 404);
    return ok(res, { message: 'Item removido com sucesso' });
  } catch (e) {
    console.error('[menu.controller] remove:', e.message);
    return err(res, 'Erro ao remover item');
  }
}
