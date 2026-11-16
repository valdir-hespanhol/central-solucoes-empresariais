const crypto = require('crypto');
const {
  createSession,
  json,
  readRequestBody,
  sessionCookie
} = require('../../lib/auth');

module.exports = async function login(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { success: false, message: 'Método não permitido.' });
  }

  const body = await readRequestBody(req);
  const password = typeof body?.password === 'string' ? body.password : '';
  const configuredPassword = process.env.ADMIN_PASSWORD || '';

  if (!configuredPassword || !process.env.ADMIN_SESSION_SECRET) {
    return json(res, 503, { success: false, message: 'Autenticação administrativa não configurada.' });
  }

  const passwordMatches = Buffer.byteLength(password) === Buffer.byteLength(configuredPassword)
    && crypto.timingSafeEqual(Buffer.from(password), Buffer.from(configuredPassword));

  if (!passwordMatches) {
    return json(res, 401, { success: false, message: 'Senha incorreta.' });
  }

  res.setHeader('Set-Cookie', sessionCookie(createSession()));
  return json(res, 200, { success: true });
};

