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
