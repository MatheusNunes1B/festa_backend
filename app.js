// app.js — Configuração principal do Express
// Sem app.listen() — em serverless (Vercel) o handler é exportado via api/index.js.

import express from 'express';
import cors from 'cors';
import menuRouter from './routes/menu.routes.js';

const app = express();

/* ── Middlewares globais ── */
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ── Rotas ── */
app.use('/api/menu', menuRouter);

/* ── Health check ── */
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'API Arraiá Boa Demais funcionando 🚀',
    version: '1.0.0',
  });
});

/* ── 404 handler ── */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Rota não encontrada: ${req.method} ${req.path}`,
  });
});

/* ── Error handler global ── */
app.use((err, _req, res, _next) => {
  console.error('[app] Erro não tratado:', err.message);
  res.status(500).json({ success: false, error: 'Erro interno do servidor' });
});

export default app;
