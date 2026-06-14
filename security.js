// ── Anti-bot helpers ──────────────────────────────────────────
// Layered protection for the public form/chat endpoints:
//   1. Origin/Referer check  — drops naive direct-to-API spam
//   2. Honeypot field        — drops bots that fill every input
//   3. Cloudflare Turnstile  — the real gate (verified server-side)
//   4. In-memory rate limit  — caps cost on the chat endpoint
//
// Turnstile fails OPEN when TURNSTILE_SECRET_KEY is unset so the site
// keeps working before the keys are configured in Vercel; it fails
// CLOSED on a bad/expired token once a secret is present.

const ALLOWED_HOSTS = ['scissorandboom.co.nz', 'www.scissorandboom.co.nz'];
const HONEYPOT_FIELD = 'company_website';

function clientIp(req) {
  const fwd = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return fwd || req.ip || '';
}

function isAllowedOrigin(req) {
  const candidate = req.get('origin') || req.get('referer');
  if (!candidate) return false;
  let host;
  try { host = new URL(candidate).host; } catch { return false; }
  if (ALLOWED_HOSTS.includes(host)) return true;
  if (host.endsWith('.vercel.app')) return true; // preview deployments
  if (process.env.NODE_ENV !== 'production' &&
      /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) return true; // local dev
  return false;
}

function isHoneypotTripped(body) {
  const v = body && body[HONEYPOT_FIELD];
  return typeof v === 'string' && v.trim() !== '';
}

async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn('[security] TURNSTILE_SECRET_KEY not set — captcha verification skipped');
    return true; // fail open until configured
  }
  if (!token || typeof token !== 'string') return false;
  try {
    const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) }),
    });
    const data = await resp.json();
    return data.success === true;
  } catch (err) {
    console.error('[security] Turnstile verify failed:', err);
    return false; // fail closed on network/parse error
  }
}

// Best-effort in-memory rate limit. On Vercel each warm instance has its
// own map, so this caps a single instance rather than the whole fleet —
// enough to blunt a hammering bot without an external store.
const hits = new Map();
function rateLimit(key, { windowMs, max }) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter(t => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (!v.some(t => now - t < windowMs)) hits.delete(k);
    }
  }
  return arr.length > max;
}

// Combined guard for the email-sending form endpoints.
function formGuard() {
  return async (req, res, next) => {
    if (!isAllowedOrigin(req)) {
      return res.status(403).json({ error: 'Request blocked.' });
    }
    if (isHoneypotTripped(req.body)) {
      // Pretend success so the bot doesn't retry — but drop it silently.
      return res.json({ success: true });
    }
    const ok = await verifyTurnstile(req.body['cf-turnstile-response'], clientIp(req));
    if (!ok) {
      return res.status(403).json({ error: 'Verification failed. Please refresh the page and try again.' });
    }
    next();
  };
}

module.exports = {
  HONEYPOT_FIELD,
  clientIp,
  isAllowedOrigin,
  isHoneypotTripped,
  verifyTurnstile,
  rateLimit,
  formGuard,
};
