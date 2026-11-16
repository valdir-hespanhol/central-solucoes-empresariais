const fs = require('fs');
const path = require('path');

const BLOB_PATHS = {
  'data/posts.json': 'blog/posts.json',
  'data/categories.json': 'blog/categories.json'
};

function localFile(relativePath) {
  return path.join(__dirname, '..', relativePath);
}

async function blobSdk() {
  return import('@vercel/blob');
}

function parseLocal(relativePath) {
  return JSON.parse(fs.readFileSync(localFile(relativePath), 'utf8'));
}

async function readJson(relativePath) {
  const pathname = BLOB_PATHS[relativePath];
  if (pathname) {
    try {
      const { get } = await blobSdk();
      const result = await get(pathname, { access: 'private' });
      if (result?.statusCode === 200 && result.stream) {
        const chunks = [];
        for await (const chunk of result.stream) chunks.push(Buffer.from(chunk));
        return JSON.parse(Buffer.concat(chunks).toString('utf8'));
      }
    } catch (error) {
      console.warn(`Blob indisponível para ${relativePath}; usando fallback local.`);
    }
  }

  return parseLocal(relativePath);
}

async function writeJson(relativePath, value, message) {
  const pathname = BLOB_PATHS[relativePath];
  if (!pathname) throw new Error(`Unsupported content path: ${relativePath}`);

  const { put } = await blobSdk();
  await put(pathname, `${JSON.stringify(value, null, 2)}\n`, {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json'
  });
}

module.exports = { readJson, writeJson };

