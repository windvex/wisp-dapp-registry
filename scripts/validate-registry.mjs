import { access, readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const issues = [];

async function readJson(file) {
  try {
    return JSON.parse(await readFile(resolve(root, file), 'utf8'));
  } catch (error) {
    issues.push(`${file}: ${error.message}`);
    return null;
  }
}

function issue(location, message) {
  issues.push(`${location}: ${message}`);
}

function isHttpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}

function isDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

async function validateAsset(path, location, expectedPrefix) {
  if (typeof path !== 'string' || !path.startsWith(expectedPrefix) || !/\.(png|webp)$/i.test(path)) {
    issue(location, `must be a PNG or WebP path under ${expectedPrefix}`);
    return;
  }

  const fullPath = resolve(root, path);
  if (!fullPath.startsWith(resolve(root, expectedPrefix))) {
    issue(location, 'must not escape the asset directory');
    return;
  }

  try {
    await access(fullPath);
    const info = await stat(fullPath);
    if (info.size > 512 * 1024) issue(location, 'must be 512 KB or smaller');
  } catch {
    issue(location, `file does not exist: ${path}`);
  }
}

const registry = await readJson('registry.json');
const chainRegistry = await readJson('chains.json');

if (registry?.version !== 1) issue('registry.json.version', 'must equal 1');
if (chainRegistry?.version !== 1) issue('chains.json.version', 'must equal 1');

const chains = Array.isArray(chainRegistry?.chains) ? chainRegistry.chains : [];
if (!Array.isArray(chainRegistry?.chains)) issue('chains.json.chains', 'must be an array');

const chainIds = new Set();
for (const [index, chain] of chains.entries()) {
  const at = `chains.json.chains[${index}]`;
  if (!chain || typeof chain !== 'object' || Array.isArray(chain)) {
    issue(at, 'must be an object');
    continue;
  }
  if (!/^[a-z][A-Za-z0-9]*$/.test(chain.id || '')) issue(`${at}.id`, 'has an invalid chain ID');
  if (chainIds.has(chain.id)) issue(`${at}.id`, `duplicate chain ID: ${chain.id}`);
  chainIds.add(chain.id);
  if (typeof chain.name !== 'string' || chain.name.length < 2 || chain.name.length > 50) issue(`${at}.name`, 'must contain 2-50 characters');
  if (!['antelope', 'bitcoin', 'evm', 'solana', 'tron'].includes(chain.namespace)) issue(`${at}.namespace`, 'is unsupported');
  if (typeof chain.chainId !== 'string' || !chain.chainId.trim()) issue(`${at}.chainId`, 'is required');
  await validateAsset(chain.icon, `${at}.icon`, 'assets/chains/');
}

const expectedChainOrder = [...chainIds].sort((a, b) => a.localeCompare(b));
if ([...chainIds].some((id, index) => id !== expectedChainOrder[index])) issue('chains.json.chains', 'must be sorted by id');

const dapps = Array.isArray(registry?.dapps) ? registry.dapps : [];
if (!Array.isArray(registry?.dapps)) issue('registry.json.dapps', 'must be an array');

const dappIds = new Set();
const dappUrls = new Set();
const allowedCategories = new Set(['bridge', 'defi', 'explorer', 'games', 'governance', 'marketplace', 'nft', 'social', 'tools', 'wallet']);

for (const [index, dapp] of dapps.entries()) {
  const at = `registry.json.dapps[${index}]`;
  if (!dapp || typeof dapp !== 'object' || Array.isArray(dapp)) {
    issue(at, 'must be an object');
    continue;
  }

  const required = ['id', 'name', 'description', 'url', 'icon', 'chains', 'categories', 'developer', 'status', 'featured', 'verified', 'addedAt'];
  for (const field of required) {
    if (!(field in dapp)) issue(`${at}.${field}`, 'is required');
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(dapp.id || '')) issue(`${at}.id`, 'must be lowercase kebab-case');
  if (dappIds.has(dapp.id)) issue(`${at}.id`, `duplicate DApp ID: ${dapp.id}`);
  dappIds.add(dapp.id);

  if (typeof dapp.name !== 'string' || dapp.name.length < 2 || dapp.name.length > 50) issue(`${at}.name`, 'must contain 2-50 characters');
  if (typeof dapp.description !== 'string' || dapp.description.length < 10 || dapp.description.length > 160) issue(`${at}.description`, 'must contain 10-160 characters');
  if (!isHttpsUrl(dapp.url)) issue(`${at}.url`, 'must be a credential-free HTTPS URL');
  if (dappUrls.has(dapp.url)) issue(`${at}.url`, `duplicate DApp URL: ${dapp.url}`);
  dappUrls.add(dapp.url);
  await validateAsset(dapp.icon, `${at}.icon`, 'assets/dapps/');

  if (!Array.isArray(dapp.chains) || !dapp.chains.length) {
    issue(`${at}.chains`, 'must contain at least one chain ID');
  } else {
    if (new Set(dapp.chains).size !== dapp.chains.length) issue(`${at}.chains`, 'must not contain duplicates');
    for (const chain of dapp.chains) {
      if (!chainIds.has(chain)) issue(`${at}.chains`, `references unknown chain: ${chain}`);
    }
  }

  if (!Array.isArray(dapp.categories) || !dapp.categories.length) {
    issue(`${at}.categories`, 'must contain at least one category');
  } else {
    if (new Set(dapp.categories).size !== dapp.categories.length) issue(`${at}.categories`, 'must not contain duplicates');
    for (const category of dapp.categories) {
      if (!allowedCategories.has(category)) issue(`${at}.categories`, `contains unsupported category: ${category}`);
    }
  }

  if (!dapp.developer || typeof dapp.developer !== 'object') {
    issue(`${at}.developer`, 'must be an object');
  } else {
    if (typeof dapp.developer.name !== 'string' || dapp.developer.name.length < 2) issue(`${at}.developer.name`, 'is required');
    if (!isHttpsUrl(dapp.developer.url)) issue(`${at}.developer.url`, 'must be a credential-free HTTPS URL');
  }
  if (!['active', 'beta', 'inactive'].includes(dapp.status)) issue(`${at}.status`, 'must be active, beta, or inactive');
  if (typeof dapp.featured !== 'boolean') issue(`${at}.featured`, 'must be boolean');
  if (typeof dapp.verified !== 'boolean') issue(`${at}.verified`, 'must be boolean');
  if (!isDate(dapp.addedAt || '')) issue(`${at}.addedAt`, 'must be a valid YYYY-MM-DD date');
}

const expectedDappOrder = [...dappIds].sort((a, b) => a.localeCompare(b));
if ([...dappIds].some((id, index) => id !== expectedDappOrder[index])) issue('registry.json.dapps', 'must be sorted by id');

if (issues.length) {
  console.error(`Registry validation failed with ${issues.length} issue(s):`);
  for (const item of issues) console.error(`- ${item}`);
  process.exit(1);
}

console.log(`Registry is valid: ${dapps.length} DApp(s), ${chains.length} chain(s).`);
