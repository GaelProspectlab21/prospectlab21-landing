// prospectlab21.com — /api/hit.js
// Logs every page view (the pixel in index.html / 404.html fires this via sendBeacon)
// straight to the Google Sheet, tab "Trafico Web". Fire-and-forget; the client
// never waits. Vercel Web Analytics runs in parallel for aggregated metrics.

// Rate-limit por IP (Upstash Redis vía REST). Va INLINE a propósito: este proyecto
// (build/) no tiene package.json, así que no hay "type": "module" declarado y un
// import entre módulos sería una apuesta. Sin imports nuevos = cero riesgo de romper
// el deploy estático. Fail-open: sin las env vars, no limita y todo sigue igual.
async function limited(req, res, { bucket, limit, windowSec }) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return false;
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  try {
    const r = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([['INCR', `rl:${bucket}:${ip}`], ['EXPIRE', `rl:${bucket}:${ip}`, String(windowSec), 'NX']]),
      signal: AbortSignal.timeout(1500),
    });
    if (!r.ok) return false;
    const out = await r.json();
    if (Number(out?.[0]?.result ?? 0) > limit) {
      res.status(429).json({ ok: false, error: 'rate_limited' });
      return true;
    }
  } catch { /* store caído: fail-open */ }
  return false;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  if (await limited(req, res, { bucket: 'hit', limit: 40, windowSec: 60 })) return;

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  const ts = new Date().toISOString();
  const app = String(body.app || 'landing').slice(0, 16);
  const path = String(body.path || '/').slice(0, 300);
  const visitorId = String(body.visitor_id || '').slice(0, 32);
  const country = req.headers['x-vercel-ip-country'] || '';
  const referrer = refHost(String(body.referrer || ''));
  const device = deviceFromUa(String(body.ua || ''));

  try {
    await appendToSheet('Trafico Web', [ts, app, path, country, referrer, device, visitorId]);
  } catch (err) {
    console.error('[HIT] sheet append failed:', err?.message || err);
  }
  return res.status(200).json({ ok: true });
}

function refHost(ref) {
  if (!ref) return 'directo';
  try { return new URL(ref).hostname.replace(/^www\./, ''); } catch { return ref.slice(0, 120); }
}

function deviceFromUa(ua) {
  if (/iPad|Tablet/i.test(ua)) return 'tablet';
  if (/Mobi|Android|iPhone/i.test(ua)) return 'mobile';
  if (!ua) return 'desconocido';
  return 'desktop';
}

// ── Google Sheets append via OAuth refresh token (token cached per warm instance) ──
let _tok = { value: null, exp: 0 };
async function getAccessToken() {
  if (_tok.value && Date.now() < _tok.exp) return _tok.value;
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error('token refresh failed: ' + JSON.stringify(j));
  _tok = { value: j.access_token, exp: Date.now() + ((j.expires_in || 3600) - 60) * 1000 };
  return _tok.value;
}

async function appendToSheet(tab, values) {
  const sheetId = process.env.LEADS_SHEET_ID;
  if (!sheetId) { console.warn('[HIT] LEADS_SHEET_ID not set, skipping'); return; }
  const token = await getAccessToken();
  const range = encodeURIComponent(`'${tab}'!A1`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [values] }),
  });
  if (!r.ok) throw new Error('sheets append ' + r.status + ': ' + (await r.text()));
}
