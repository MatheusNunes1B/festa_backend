import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import menuRouter from './routes/menu.routes.js';

dotenv.config();
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
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Arraiá Boa Demais funcionando 🚀',
    version: '1.0.0',
  });
});

/* ── 404 handler ── */
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Rota não encontrada: ${req.method} ${req.path}` });
});

/* ── Error handler global ── */
app.use((err, req, res, _next) => {
  console.error('[app] Erro não tratado:', err.message);
  res.status(500).json({ success: false, error: 'Erro interno do servidor' });
});

/* ── Servidor local (apenas fora da Vercel) ── */
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  });
}

export default app;
