const { json, readRequestBody, requireAdmin } = require('../lib/auth');
const { readJson, writeJson } = require('../lib/content');

module.exports = async function categories(req, res) {
  try {
    if (req.method === 'GET') {
      return json(res, 200, await readJson('data/categories.json'));
    }

    if (req.method === 'POST') {
      if (!(await requireAdmin(req, res))) return;
      const categories = await readRequestBody(req);
      if (!Array.isArray(categories)) return json(res, 400, { success: false, message: 'Formato inválido.' });
      await writeJson('data/categories.json', categories, 'Atualiza categorias pelo painel administrativo');
      return json(res, 200, { success: true });
    }

    res.setHeader('Allow', 'GET, POST');
    return json(res, 405, { success: false, message: 'Método não permitido.' });
  } catch (error) {
    console.error('Categories API error:', error);
    return json(res, 500, { success: false, message: 'Não foi possível processar as categorias.' });
  }
};

