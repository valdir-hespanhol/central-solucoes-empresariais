const { hasValidSession, json } = require('../../lib/auth');

module.exports = async function session(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return json(res, 405, { authenticated: false });
  }

  const authenticated = hasValidSession(req);
  return json(res, authenticated ? 200 : 401, { authenticated });
};

