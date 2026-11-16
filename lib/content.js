const fs = require('fs');
const path = require('path');

const REPOSITORY = process.env.GITHUB_REPOSITORY || 'valdir-hespanhol/central-solucoes-empresariais';
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const GITHUB_API = 'https://api.github.com';

function localFile(relativePath) {
  return path.join(__dirname, '..', relativePath);
}

function githubPath(relativePath) {
  return relativePath.split('/').map(encodeURIComponent).join('/');
}

function githubHeaders() {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    'User-Agent': 'central-blog-cms',
    'X-GitHub-Api-Version': '2022-11-28'
  };
}

async function githubRequest(relativePath, options = {}) {
  const url = `${GITHUB_API}/repos/${REPOSITORY}/contents/${githubPath(relativePath)}?ref=${encodeURIComponent(BRANCH)}`;
  return fetch(url, {
    ...options,
    headers: { ...githubHeaders(), ...(options.headers || {}) }
  });
}

function parseLocal(relativePath) {
  return JSON.parse(fs.readFileSync(localFile(relativePath), 'utf8'));
}

async function readJson(relativePath) {
  if (process.env.GITHUB_TOKEN) {
    const response = await githubRequest(relativePath);
    if (response.ok) {
      const file = await response.json();
      return JSON.parse(Buffer.from(file.content.replace(/\s/g, ''), 'base64').toString('utf8'));
    }
  }

  return parseLocal(relativePath);
}

async function writeJson(relativePath, value, message) {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN is not configured.');
  }

  const current = await githubRequest(relativePath);
  if (!current.ok) throw new Error(`Unable to read ${relativePath} before saving.`);
  const currentFile = await current.json();
  const content = Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8').toString('base64');
  const response = await githubRequest(relativePath, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, content, branch: BRANCH, sha: currentFile.sha })
  });

  if (!response.ok) throw new Error('Unable to save blog content.');
}

module.exports = { readJson, writeJson };

