/* Applies the "headers" rules of vercel.json to a local response, so the dev server and the
   browser tests run under exactly the same CSP and security headers as the deployment.
   vercel.json is the single source of truth. */
const fs = require('node:fs');
const path = require('node:path');

const rules = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'vercel.json'), 'utf8')).headers || [];
// Vercel "source" patterns used here are plain path patterns with regex groups, e.g. /(.*), /sw.js.
const compiled = rules.map(r => ({ re: new RegExp('^' + r.source.replace(/\.(?=[a-z])/g, '\\.') + '$'), headers: r.headers }));

function headersFor(pathname) {
  const out = {};
  for (const rule of compiled) if (rule.re.test(pathname)) for (const { key, value } of rule.headers) out[key] = value; // later rules win, like Vercel
  return out;
}

function apply(res, pathname) {
  for (const [key, value] of Object.entries(headersFor(pathname))) res.setHeader(key, value);
}

module.exports = { headersFor, apply };
