import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import menuRouter from './routes/menu.routes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: '*'
}));

app.use(express.json());

app.use('/api/menu', menuRouter);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Arraiá Boa Demais funcionando 🚀'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;