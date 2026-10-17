/**
 * /api/ai — translation endpoint of Vocabulary Master AI (Vercel Serverless Function).
 *
 * Contract: POST application/json
 *   { "action": "status" }                                  → { status, serverKeyConfigured, limits }
 *   { "words": [...], "source": "en", "target": "ru" }      → { items: [{ original, translation, hint, definition, examples }] }
 * The server builds the prompt itself; callers can no longer send arbitrary chat messages.
 *
 * Environment:
 *   OPENAI_API_KEY        server key (optional; never echoed or logged)
 *   OPENAI_BASE_URL       https endpoint for the server key (default https://api.openai.com/v1)
 *   OPENAI_MODEL          model for the server key
 *   ALLOWED_ORIGINS       extra comma-separated origins allowed to call (the deployment's own host always is)
 *   AI_ALLOWED_HOSTS      extra provider hosts for "bring your own key" requests
 *   AI_RATE_LIMIT / AI_RATE_LIMIT_BYOK / AI_RATE_WINDOW_MS   per-IP limits (default 30 / 120 per 10 min)
 *
 * Limits of this design: the rate limiter lives in the memory of one serverless instance, so it resets on cold
 * starts and is not shared between instances; for hard guarantees put Vercel KV / Upstash or the Vercel firewall
 * in front. Origin/Referer checks stop other websites from using the endpoint from a browser, but a script can fake
 * these headers — the rate limit and the fixed prompt are what bound the damage.
 */
const core = require('../ai-core.js');

const DEFAULT_BASE = 'https://api.openai.com/v1';
const PROVIDER_HOSTS = ['api.openai.com', 'api.groq.com', 'openrouter.ai', 'api.deepseek.com', 'api.mistral.ai', 'api.together.xyz', 'generativelanguage.googleapis.com'];
const MAX_BODY_BYTES = 16 * 1024;
const UPSTREAM_TIMEOUT_MS = 30000;
const hits = new Map(); // ip -> request timestamps inside the current window (this instance only)

const num = (v, d) => (Number(v) > 0 ? Number(v) : d);
const WINDOW_MS = () => num(process.env.AI_RATE_WINDOW_MS, 10 * 60 * 1000);

function send(res, status, body, headers) {
  for (const [k, v] of Object.entries(headers || {})) res.setHeader(k, v);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(status).json(body);
}
const error = (res, status, code, message, headers) => send(res, status, { code, error: message }, headers);

function header(req, name) { const v = req.headers && req.headers[name]; return Array.isArray(v) ? v[0] : v || ''; }

function clientIp(req) {
  // On Vercel x-real-ip / x-forwarded-for are set by the edge, not by the caller.
  return header(req, 'x-real-ip') || header(req, 'x-forwarded-for').split(',')[0].trim() || (req.socket && req.socket.remoteAddress) || 'unknown';
}

function allowedOrigins(req) {
  const set = new Set();
  const add = h => { if (h) { set.add('https://' + h); set.add('http://' + h); } };
  add(header(req, 'host'));
  add(process.env.VERCEL_URL);
  add(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  String(process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim().replace(/\/+$/, '')).filter(Boolean).forEach(o => set.add(o));
  return set;
}

function callerOrigin(req) {
  const origin = header(req, 'origin');
  if (origin && origin !== 'null') return origin;
  try { return new URL(header(req, 'referer')).origin; } catch (e) { return ''; }
}

function rateLimit(ip, limit) {
  const now = Date.now(), windowMs = WINDOW_MS();
  const recent = (hits.get(ip) || []).filter(t => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(ip, recent);
    return Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000));
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.length || now - v[v.length - 1] > windowMs) hits.delete(k);
  return 0;
}

function providerHosts() {
  return PROVIDER_HOSTS.concat(String(process.env.AI_ALLOWED_HOSTS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean));
}

// Upstream failures are reported as stable codes; the provider's own text (which can echo key fragments) never leaves.
function providerError(status) {
  if (status === 401 || status === 403) return [502, 'provider-auth', 'The AI provider rejected the API key.'];
  if (status === 429) return [503, 'provider-rate-limit', 'The AI provider is rate limiting requests. Try again later.'];
  if (status === 404 || status === 400 || status === 422) return [502, 'provider-bad-request', 'The AI provider did not accept the request (check the model name).'];
  return [502, 'provider-unavailable', 'The AI provider is unavailable.'];
}

function readBody(req) {
  let body = req.body;
  if (typeof body === 'string') {
    if (Buffer.byteLength(body) > MAX_BODY_BYTES) return { tooLarge: true };
    try { body = JSON.parse(body); } catch (e) { return { invalid: true }; }
  } else if (body && JSON.stringify(body).length > MAX_BODY_BYTES) return { tooLarge: true };
  return { body: body || {} };
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const allowed = allowedOrigins(req);
  const origin = header(req, 'origin');
  if (origin && allowed.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '600');
  }
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return error(res, 405, 'method-not-allowed', 'Use POST.', { Allow: 'POST, OPTIONS' });
  if (!allowed.has(callerOrigin(req))) return error(res, 403, 'forbidden-origin', 'This origin is not allowed to use the API.');
  if (!/^application\/json\b/i.test(header(req, 'content-type'))) return error(res, 415, 'bad-request', 'Content-Type must be application/json.');

  const parsed = readBody(req);
  if (parsed.tooLarge) return error(res, 413, 'payload-too-large', 'Request body is too large.');
  if (parsed.invalid || !parsed.body || typeof parsed.body !== 'object' || Array.isArray(parsed.body)) return error(res, 400, 'bad-request', 'Body must be a JSON object.');
  const body = parsed.body;
  const serverKey = process.env.OPENAI_API_KEY || '';

  if (body.action === 'status') {
    return send(res, 200, { status: 'ok', serverKeyConfigured: Boolean(serverKey), limits: { words: core.LIMITS.words, wordLength: core.LIMITS.wordLength } });
  }

  const bearer = header(req, 'authorization').replace(/^Bearer\s+/i, '').trim();
  const clientKey = bearer || (typeof body.apiKey === 'string' ? body.apiKey.trim() : '');
  if (!serverKey && !clientKey) return error(res, 501, 'no-key', 'No API key: the server has none configured and the request did not include one.');
  if (!serverKey && (clientKey.length > 400 || !/^[\x21-\x7e]+$/.test(clientKey))) return error(res, 400, 'bad-request', 'Malformed API key.');

  const retryAfter = rateLimit(clientIp(req), serverKey ? num(process.env.AI_RATE_LIMIT, 30) : num(process.env.AI_RATE_LIMIT_BYOK, 120));
  if (retryAfter) return error(res, 429, 'rate-limited', 'Too many requests. Try again in ' + retryAfter + ' s.', { 'Retry-After': String(retryAfter) });

  let request;
  try { request = core.validateRequest(body); }
  catch (e) { return error(res, 400, 'bad-request', e.message); }

  // A server key is pinned to the operator's endpoint and model; a caller's own key may pick a known provider.
  let base, model;
  if (serverKey) {
    base = String(process.env.OPENAI_BASE_URL || DEFAULT_BASE).replace(/\/+$/, '');
    model = process.env.OPENAI_MODEL || (/tokenharbor/i.test(base) ? 'claude-sonnet-4.6' : 'gpt-4o-mini');
  } else {
    base = String(body.baseUrl || DEFAULT_BASE).replace(/\/+$/, '');
    let url;
    try { url = new URL(base); } catch (e) { return error(res, 400, 'bad-request', 'Invalid base URL.'); }
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return error(res, 400, 'bad-request', 'Base URL must be plain HTTPS without credentials or port.');
    if (!providerHosts().includes(url.hostname.toLowerCase())) return error(res, 400, 'bad-request', 'Unsupported AI provider host. Allowed: ' + providerHosts().join(', ') + '.');
    model = typeof body.model === 'string' && body.model.trim() ? body.model.trim() : 'gpt-4o-mini';
    if (!/^[\w.:/@-]{1,100}$/.test(model)) return error(res, 400, 'bad-request', 'Invalid model name.');
  }

  const headers = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (serverKey || clientKey) };
  if (/openrouter\.ai/i.test(base)) headers['X-Title'] = 'Vocabulary Master AI';

  let upstream;
  try {
    upstream = await fetch(base + '/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({ model, messages: core.buildMessages(request), temperature: 0.2 }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      redirect: 'error'
    });
  } catch (err) {
    const timeout = err && (err.name === 'TimeoutError' || err.name === 'AbortError');
    console.warn('[api/ai] provider request failed:', timeout ? 'timeout' : (err && err.name) || 'error');
    return timeout ? error(res, 504, 'provider-timeout', 'The AI provider did not answer in time.') : error(res, 502, 'provider-unavailable', 'The AI provider is unavailable.');
  }

  if (!upstream.ok) {
    console.warn('[api/ai] provider responded with HTTP', upstream.status);
    const [status, code, message] = providerError(upstream.status);
    return error(res, status, code, message);
  }

  let content = '';
  try {
    const data = JSON.parse(await upstream.text());
    content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  } catch (e) { content = ''; }
  try {
    return send(res, 200, { items: core.parseResponse(content, request) });
  } catch (e) {
    return error(res, 502, 'bad-model-response', 'The AI returned an answer that could not be used.');
  }
};

module.exports._resetRateLimit = () => hits.clear();
