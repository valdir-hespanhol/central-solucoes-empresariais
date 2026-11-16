const crypto = require('crypto');

const SESSION_COOKIE = 'central_admin_session';
const SESSION_TTL_SECONDS = 8 * 60 * 60;

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function parseCookies(header = '') {
  return header.split(';').reduce((cookies, part) => {
    const separator = part.indexOf('=');
    if (separator === -1) return cookies;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (key) cookies[key] = decodeURIComponent(value);
    return cookies;
  }, {});
}

function sign(value) {
  return crypto
    .createHmac('sha256', process.env.ADMIN_SESSION_SECRET || '')
    .update(value)
    .digest('base64url');
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left || '');
  const rightBuffer = Buffer.from(right || '');
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function createSession() {
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    issuedAt: now,
    expiresAt: now + SESSION_TTL_SECONDS
  })).toString('base64url');

  return `${payload}.${sign(payload)}`;
}

function hasValidSession(req) {
  if (!process.env.ADMIN_SESSION_SECRET) return false;

  const token = parseCookies(req.headers.cookie || '')[SESSION_COOKIE];
  if (!token) return false;

  const separator = token.lastIndexOf('.');
  if (separator === -1) return false;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  if (!safeEqual(signature, sign(payload))) return false;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Number.isFinite(session.expiresAt) && session.expiresAt > Math.floor(Date.now() / 1000);
  } catch (error) {
    return false;
  }
}

function sessionCookie(value, maxAge = SESSION_TTL_SECONDS) {
  return `${SESSION_COOKIE}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`;
}

function clearSessionCookie() {
  return sessionCookie('', 0);
}

function readRequestBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  if (typeof req.body === 'string') {
    try { return Promise.resolve(JSON.parse(req.body)); } catch (error) { return Promise.resolve(null); }
  }

  return new Promise((resolve) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : null); } catch (error) { resolve(null); }
    });
  });
}

async function requireAdmin(req, res) {
  if (!hasValidSession(req)) {
    json(res, 401, { success: false, message: 'Não autorizado.' });
    return false;
  }
  return true;
}

module.exports = {
  clearSessionCookie,
  createSession,
  hasValidSession,
  json,
  readRequestBody,
  requireAdmin,
  sessionCookie
};

