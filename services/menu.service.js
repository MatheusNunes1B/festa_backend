// services/menu.service.js — Acesso ao Supabase

import { createClient } from '@supabase/supabase-js';

const TABLE = 'menu_items';

let _supabase = null;

function getClient() {
  if (_supabase) return _supabase;

  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    throw new Error(
      `SUPABASE_URL inválida ou ausente. Valor recebido: "${url}"`
    );
  }

  if (!key || typeof key !== 'string') {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY ausente. Verifique as variáveis na Vercel.'
    );
  }

  _supabase = createClient(url, key);
  return _supabase;
}

/* ===================== READ ===================== */

export async function getAllMenuItems({
  category,
  featured,
  available,
  search,
  sort
} = {}) {
  const supabase = getClient();

  let query = supabase.from(TABLE).select('*');

  if (category) query = query.eq('category', category);
  if (featured === 'true') query = query.eq('featured', true);

  if (available !== 'false') {
    query = query.eq('available', true);
  }

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`
    );
  }

  switch (sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false });
      break;
    case 'name_asc':
      query = query.order('name', { ascending: true });
      break;
    case 'featured':
      query = query.order('featured', { ascending: false });
      break;
    default:
      query = query
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Supabase getAllMenuItems: ${error.message}`);
  }

  return { items: data || [], total: data?.length || 0 };
}

/* ===================== READ BY ID ===================== */

export async function getMenuItemById(id) {
  const supabase = getClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Supabase getMenuItemById: ${error.message}`);
  }

  return data;
}

/* ===================== CATEGORIES ===================== */

export async function getCategories() {
  const supabase = getClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select('category')
    .eq('available', true);

  if (error) {
    throw new Error(`Supabase getCategories: ${error.message}`);
  }

  const counts = {};

  (data || []).forEach(({ category }) => {
    counts[category] = (counts[category] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/* ===================== CREATE ===================== */

export async function createMenuItem(payload) {
  const supabase = getClient();

  const { data, error } = await supabase
    .from(TABLE)
    .insert([payload])
    .select()
    .single();

  if (error) {
    throw new Error(`Supabase createMenuItem: ${error.message}`);
  }

  return data;
}

/* ===================== UPDATE ===================== */

export async function updateMenuItem(id, updates) {
  const supabase = getClient();

  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Supabase updateMenuItem: ${error.message}`);
  }

  return data;
}

/* ===================== DELETE ===================== */

export async function deleteMenuItem(id) {
  const supabase = getClient();

  const { error, count } = await supabase
    .from(TABLE)
    .delete({ count: 'exact' })
    .eq('id', id);

  if (error) {
    throw new Error(`Supabase deleteMenuItem: ${error.message}`);
  }

  return (count ?? 0) > 0;
}
