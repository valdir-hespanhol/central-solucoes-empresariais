const { clearSessionCookie, json } = require('../../lib/auth');

module.exports = async function logout(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { success: false, message: 'Método não permitido.' });
  }

  res.setHeader('Set-Cookie', clearSessionCookie());
  return json(res, 200, { success: true });
};

