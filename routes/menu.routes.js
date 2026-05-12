// routes/menu.routes.js
// CAMINHOS CORRIGIDOS:
//   ../controllers/menu.controller.js  (era ./menu.controller.js — ERRADO)
//   ../middleware/auth.js              (arquivo criado em /middleware/)

import { Router } from 'express';
import * as menuController from '../controllers/menu.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/* ══════════════════════════════════════
   Rotas Públicas — leitura (sem auth)
══════════════════════════════════════ */

// GET /api/menu
// Suporta query params: ?category= &featured= &available= &search= &sort=
router.get('/', menuController.getAll);

// GET /api/menu/categories
// Retorna lista de categorias com contagem de itens
router.get('/categories', menuController.getCategories);

// GET /api/menu/:id
// Retorna um item específico pelo UUID
router.get('/:id', menuController.getById);

/* ══════════════════════════════════════
   Rotas Protegidas — escrita (requer ADMIN_TOKEN)
══════════════════════════════════════ */

// POST /api/menu
// Cria novo item no cardápio
router.post('/', authenticate, menuController.create);

// PUT /api/menu/:id
// Atualiza item existente (parcial ou completo)
router.put('/:id', authenticate, menuController.update);

// DELETE /api/menu/:id
// Remove item do cardápio
router.delete('/:id', authenticate, menuController.remove);

export default router;