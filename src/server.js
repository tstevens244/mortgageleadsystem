require('dotenv').config();

const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const db         = require('./db');
const { render } = require('./template');
const { routeLead } = require('./crm');

const app  = express();
const PORT = parseInt(process.env.PORT || '3000');
const ROOT_DOMAIN = process.env.ROOT_DOMAIN || 'localhost';

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));   // CSP off for GTM/Pixel compat
app.use(cors());
app.use(express.json({ limit: '20kb' }));

// Rate-limit form submissions to 10 per 15 min per IP
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { ok: false, error: 'Too many submissions. Please wait and try again.' },
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Resolve the subdomain from the request hostname.
 * Handles:
 *   acme.yourdomain.com  → "acme"
 *   localhost:3000        → from ?__subdomain= query param (dev convenience)
 */
function getSubdomain(req) {
  const host = (req.hostname || '').toLowerCase();
  // Dev override: ?__subdomain=acme
  if (req.query.__subdomain) return req.query.__subdomain;
  // Strip trailing dots
  const parts = host.replace(/\.$/, '').split('.');
  // If root domain is set and hostname ends with it, peel it off
  const rootParts = ROOT_DOMAIN.split('.');
  if (parts.length > rootParts.length) {
    return parts.slice(0, parts.length - rootParts.length).join('.');
  }
  return null;
}

async function getCompany(subdomain) {
  const [rows] = await db.execute(
    'SELECT * FROM companies WHERE subdomain = ? AND active = 1 LIMIT 1',
    [subdomain]
  );
  return rows[0] || null;
}

async function getReviews(companyId) {
  const [rows] = await db.execute(
    'SELECT * FROM reviews WHERE company_id = ? AND active = 1 ORDER BY sort_order ASC LIMIT 4',
    [companyId]
  );
  return rows;
}

// ── Routes ────────────────────────────────────────────────────────────────────

// Landing page
app.get('/', async (req, res) => {
  const subdomain = getSubdomain(req);
  if (!subdomain) {
    return res.status(404).send('<h1>Not found</h1><p>No subdomain specified.</p>');
  }

  const company = await getCompany(subdomain).catch(() => null);
  if (!company) {
    return res.status(404).send('<h1>Page not found</h1>');
  }

  const reviews = await getReviews(company.id).catch(() => []);
  const html    = render(company, reviews, req.query);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// Lead form submission
app.post('/submit', submitLimiter, async (req, res) => {
  const subdomain = getSubdomain(req);
  if (!subdomain) return res.status(400).json({ ok: false, error: 'Unknown domain.' });

  const company = await getCompany(subdomain).catch(() => null);
  if (!company) return res.status(404).json({ ok: false, error: 'Company not found.' });

  // Basic server-side validation
  const { first_name, last_name, email, phone } = req.body;
  if (!first_name?.trim() || !last_name?.trim()) {
    return res.status(422).json({ ok: false, error: 'Name is required.' });
  }
  if (!email?.match(/^[^@]+@[^@]+\.[^@]+$/)) {
    return res.status(422).json({ ok: false, error: 'Valid email is required.' });
  }
  if (!phone?.trim()) {
    return res.status(422).json({ ok: false, error: 'Phone is required.' });
  }

  // Normalised lead object
  const lead = {
    first_name:    first_name.trim(),
    last_name:     last_name.trim(),
    email:         email.trim().toLowerCase(),
    phone:         phone.trim(),
    utm_source:    req.body.utm_source    || null,
    utm_medium:    req.body.utm_medium    || null,
    utm_campaign:  req.body.utm_campaign  || null,
    utm_term:      req.body.utm_term      || null,
    utm_content:   req.body.utm_content   || null,
    referrer_url:  req.get('Referer')     || null,
    ip_address:    req.ip,
    user_agent:    req.get('User-Agent')  || null,
  };

  // 1. Store locally (async — don't await for response time)
  let leadId = null;
  try {
    const [result] = await db.execute(
      `INSERT INTO leads
         (company_id, first_name, last_name, email, phone,
          utm_source, utm_medium, utm_campaign, utm_term, utm_content,
          referrer_url, ip_address, user_agent, raw_payload, crm_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        company.id,
        lead.first_name, lead.last_name, lead.email, lead.phone,
        lead.utm_source, lead.utm_medium, lead.utm_campaign,
        lead.utm_term,   lead.utm_content,
        lead.referrer_url, lead.ip_address, lead.user_agent,
        JSON.stringify(req.body),
      ]
    );
    leadId = result.insertId;
  } catch (dbErr) {
    console.error('[DB] Lead insert failed:', dbErr.message);
  }

  // Respond to browser immediately — don't make user wait for CRM
  res.json({ ok: true });

  // 2. Route to CRM asynchronously
  if (company.crm_webhook_url || company.crm_api_key) {
    routeLead(company, lead)
      .then(async ({ success, response }) => {
        if (leadId) {
          await db.execute(
            'UPDATE leads SET crm_status = ?, crm_response = ? WHERE id = ?',
            [success ? 'sent' : 'failed', response, leadId]
          ).catch(() => {});
        }
      })
      .catch(async (err) => {
        console.error('[CRM] Routing failed:', err.message);
        if (leadId) {
          await db.execute(
            'UPDATE leads SET crm_status = ?, crm_response = ? WHERE id = ?',
            ['failed', err.message.slice(0, 500), leadId]
          ).catch(() => {});
        }
      });
  }
});

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ LeadPage server running on port ${PORT}`);
  console.log(`   Dev test: http://localhost:${PORT}/?__subdomain=acme`);
});

module.exports = app;
