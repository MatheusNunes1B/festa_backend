// middleware/auth.js — Autenticação simples por token (admin)
// Protege as rotas POST, PUT e DELETE do cardápio.
//
// Configure a variável de ambiente ADMIN_TOKEN no painel da Vercel.
// Exemplo: ADMIN_TOKEN=meu-token-secreto-aqui
//
// Para chamar rotas protegidas, envie o header:
//   Authorization: Bearer meu-token-secreto-aqui
export function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token de autenticação não fornecido',
    });
  }
  const token = authHeader.slice(7); // remove "Bearer "
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    console.error('[auth] Variável ADMIN_TOKEN não configurada no ambiente');
    return res.status(500).json({
      success: false,
      error: 'Configuração de autenticação ausente no servidor',
    });
  }
  if (token !== adminToken) {
    return res.status(403).json({
      success: false,
      error: 'Token inválido ou sem permissão',
    });
  }
  next();
}

menu.routes.js:
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
