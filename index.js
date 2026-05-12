// api/index.js — Entry point para Vercel Serverless
// Vercel chama este arquivo como uma função serverless.
// Ele importa o app Express e o exporta como handler HTTP.

import app from '../app.js';

export default app;