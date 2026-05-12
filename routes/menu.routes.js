// menu.routes.js — Backend (Express / Vercel)
// Define as rotas do cardápio e aplica middlewares

import { Router } from 'express';
import * as menuController from '../controllers/menu.controller.js';
import { authenticate } from '../middleware/auth.js'; // middleware JWT existente

const router = Router();

/* ══════════════════════════════════════
   Rotas Públicas (leitura)
══════════════════════════════════════ */

// GET /api/menu
// ?category=Espetinhos &featured=true &search=frango &sort=price_asc
router.get('/', menuController.getAll);

// GET /api/menu/categories
router.get('/categories', menuController.getCategories);

// GET /api/menu/:id
router.get('/:id', menuController.getById);

/* ══════════════════════════════════════
   Rotas Protegidas (autenticação admin)
══════════════════════════════════════ */

// POST /api/menu
router.post('/', authenticate, menuController.create);

// PUT /api/menu/:id
router.put('/:id', authenticate, menuController.update);

// DELETE /api/menu/:id
router.delete('/:id', authenticate, menuController.remove);

export default router;

/* ══════════════════════════════════════
   Integração no app principal (app.js):

   import menuRouter from './routes/menu.routes.js';
   app.use('/api/menu', menuRouter);
══════════════════════════════════════ */
