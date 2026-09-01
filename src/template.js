/**
 * template.js — Renders the landing page HTML for a given company + reviews.
 * All customisation comes from the DB row; zero hardcoded brand values here.
 */

function starSVG(filled) {
  const color = filled ? 'currentColor' : '#d1d5db';
  return `<svg width="16" height="16" viewBox="0 0 20 20" fill="${color}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
  </svg>`;
}

function renderStars(rating) {
  return Array.from({ length: 5 }, (_, i) => starSVG(i < rating)).join('');
}

function reviewCard(r) {
  const initials = r.author_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return `
    <article class="review-card">
      <div class="review-stars">${renderStars(r.rating)}</div>
      <p class="review-body">${escapeHtml(r.body)}</p>
      <footer class="review-author">
        <div class="review-avatar" aria-hidden="true">${r.avatar_url
          ? `<img src="${r.avatar_url}" alt="${escapeHtml(r.author_name)}" width="40" height="40">`
          : `<span>${initials}</span>`
        }</div>
        <div>
          <strong>${escapeHtml(r.author_name)}</strong>
          ${r.author_title ? `<span class="review-title">${escapeHtml(r.author_title)}</span>` : ''}
        </div>
      </footer>
    </article>`;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function render(company, reviews, query = {}) {
  const utmFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  const hiddenUTM = utmFields
    .filter(k => query[k])
    .map(k => `<input type="hidden" name="${k}" value="${escapeHtml(query[k])}">`)
    .join('\n        ');

  const reviewsHTML = reviews.length
    ? reviews.map(reviewCard).join('')
    : '<p class="no-reviews">Be the first to share your experience.</p>';

  const gtmHead = company.gtm_id
    ? `<!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${company.gtm_id}');</script>
    <!-- End Google Tag Manager -->`
    : '';

  const metaPixel = company.pixel_id
    ? `<!-- Meta Pixel -->
    <script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${company.pixel_id}');fbq('track','PageView');</script>
    <!-- End Meta Pixel -->`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(company.company_name)}</title>
  ${company.favicon_url ? `<link rel="icon" href="${company.favicon_url}">` : ''}
  ${gtmHead}
  ${metaPixel}
  <style>
    /* ── Reset & base ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --primary:  ${company.primary_color};
      --accent:   ${company.accent_color};
      --text:     ${company.text_color};
      --bg:       ${company.bg_color};
      --radius:   10px;
      --shadow:   0 4px 24px rgba(0,0,0,0.09);
      --max-w:    1100px;
    }

    body {
      font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      min-height: 100vh;
    }

    /* ── Header ── */
    .site-header {
      background: var(--primary);
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .site-header img { max-height: 48px; width: auto; }
    .site-header .company-name-text {
      font-size: 1.4rem;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.02em;
    }

    /* ── Hero ── */
    .hero {
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
      color: #fff;
      text-align: center;
      padding: 60px 24px 72px;
    }
    .hero h1 {
      font-size: clamp(1.7rem, 4vw, 2.7rem);
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.15;
      max-width: 700px;
      margin: 0 auto 16px;
    }
    .hero p {
      font-size: clamp(1rem, 2vw, 1.15rem);
      opacity: 0.88;
      max-width: 560px;
      margin: 0 auto 20px;
    }
    .trust-badge {
      display: inline-block;
      background: rgba(255,255,255,0.18);
      border: 1px solid rgba(255,255,255,0.35);
      border-radius: 999px;
      padding: 6px 18px;
      font-size: 0.88rem;
      font-weight: 600;
    }

    /* ── Main layout ── */
    .main-layout {
      max-width: var(--max-w);
      margin: -36px auto 0;
      padding: 0 20px 60px;
      display: grid;
      grid-template-columns: 1fr 400px 1fr;
      gap: 28px;
      align-items: start;
    }

    /* ── Form card ── */
    .form-card {
      background: #fff;
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      padding: 36px 32px;
      grid-column: 2;
    }
    .form-card h2 {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 20px;
      color: var(--text);
      line-height: 1.3;
    }

    .field { margin-bottom: 16px; }
    .field label {
      display: block;
      font-size: 0.82rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 5px;
    }
    .field input {
      width: 100%;
      padding: 11px 14px;
      border: 1.5px solid #d1d5db;
      border-radius: 7px;
      font-size: 1rem;
      color: var(--text);
      transition: border-color 0.15s, box-shadow 0.15s;
      outline: none;
      background: #f9fafb;
    }
    .field input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 20%, transparent);
      background: #fff;
    }
    .field input.error { border-color: #ef4444; }

    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .submit-btn {
      width: 100%;
      padding: 14px;
      background: var(--primary);
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 1.05rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s;
      margin-top: 4px;
    }
    .submit-btn:hover  { background: var(--accent); }
    .submit-btn:active { transform: scale(0.99); }
    .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

    .form-disclaimer {
      font-size: 0.74rem;
      color: #9ca3af;
      text-align: center;
      margin-top: 12px;
      line-height: 1.4;
    }

    /* ── Success state ── */
    .success-message {
      display: none;
      text-align: center;
      padding: 16px 0;
    }
    .success-icon {
      font-size: 3rem;
      margin-bottom: 12px;
    }
    .success-message h3 {
      font-size: 1.3rem;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .success-message p { color: #6b7280; }

    /* ── Reviews sidebar ── */
    .reviews-col {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 12px;
    }
    .reviews-col.left  { grid-column: 1; }
    .reviews-col.right { grid-column: 3; }

    .review-card {
      background: #fff;
      border-radius: var(--radius);
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      padding: 20px;
      border-top: 3px solid var(--primary);
    }
    .review-stars {
      display: flex;
      gap: 2px;
      color: #f59e0b;
      margin-bottom: 10px;
    }
    .review-body {
      font-size: 0.92rem;
      line-height: 1.55;
      color: #374151;
      margin-bottom: 14px;
    }
    .review-author {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .review-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
      flex-shrink: 0;
      overflow: hidden;
    }
    .review-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .review-author strong { display: block; font-size: 0.88rem; }
    .review-title { font-size: 0.78rem; color: #9ca3af; }

    .no-reviews { color: #9ca3af; font-size: 0.9rem; }

    /* ── Error message ── */
    .form-error {
      display: none;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 7px;
      padding: 10px 14px;
      color: #dc2626;
      font-size: 0.88rem;
      margin-bottom: 14px;
    }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .main-layout {
        grid-template-columns: 1fr;
        margin-top: -24px;
      }
      .form-card    { grid-column: 1; order: 1; }
      .reviews-col  { grid-column: 1; order: 2; flex-direction: row; flex-wrap: wrap; }
      .reviews-col.right { order: 2; }
      .review-card  { flex: 1 1 280px; }
      .field-row    { grid-template-columns: 1fr; }
    }

    @media (max-width: 480px) {
      .hero { padding: 40px 16px 56px; }
      .form-card { padding: 24px 18px; }
    }

    @media (prefers-reduced-motion: reduce) {
      * { transition: none !important; }
    }
  </style>
</head>
<body>

  <header class="site-header">
    ${company.logo_url
      ? `<img src="${escapeHtml(company.logo_url)}" alt="${escapeHtml(company.company_name)} logo">`
      : `<span class="company-name-text">${escapeHtml(company.company_name)}</span>`}
  </header>

  <section class="hero">
    <h1>${escapeHtml(company.headline)}</h1>
    ${company.subheadline ? `<p>${escapeHtml(company.subheadline)}</p>` : ''}
    ${company.trust_badge_text ? `<div class="trust-badge">${escapeHtml(company.trust_badge_text)}</div>` : ''}
  </section>

  <div class="main-layout">

    <!-- Left reviews -->
    <div class="reviews-col left" aria-label="Customer reviews">
      ${reviews.length >= 1 ? reviewCard(reviews[0]) : ''}
      ${reviews.length >= 2 ? reviewCard(reviews[1]) : ''}
    </div>

    <!-- Lead form -->
    <div class="form-card" role="main">
      <h2>${escapeHtml(company.form_title)}</h2>

      <div class="form-error" id="formError" role="alert"></div>

      <form id="leadForm" novalidate>
        ${hiddenUTM}
        <div class="field-row">
          <div class="field">
            <label for="first_name">First Name</label>
            <input type="text" id="first_name" name="first_name" placeholder="Jane" autocomplete="given-name" required>
          </div>
          <div class="field">
            <label for="last_name">Last Name</label>
            <input type="text" id="last_name" name="last_name" placeholder="Smith" autocomplete="family-name" required>
          </div>
        </div>
        <div class="field">
          <label for="email">Email Address</label>
          <input type="email" id="email" name="email" placeholder="jane@example.com" autocomplete="email" required>
        </div>
        <div class="field">
          <label for="phone">Phone Number</label>
          <input type="tel" id="phone" name="phone" placeholder="(555) 000-0000" autocomplete="tel" required>
        </div>
        <button type="submit" class="submit-btn" id="submitBtn">
          ${escapeHtml(company.cta_button_text)}
        </button>
        <p class="form-disclaimer">
          By submitting you agree to be contacted about your inquiry. We respect your privacy.
        </p>
      </form>

      <div class="success-message" id="successMessage">
        <div class="success-icon">✅</div>
        <h3>You're all set!</h3>
        <p>${escapeHtml(company.success_message)}</p>
      </div>
    </div>

    <!-- Right reviews -->
    <div class="reviews-col right" aria-label="More customer reviews">
      ${reviews.length >= 3 ? reviewCard(reviews[2]) : ''}
      ${reviews.length >= 4 ? reviewCard(reviews[3]) : ''}
    </div>

  </div>

  <script>
    const form     = document.getElementById('leadForm');
    const btn      = document.getElementById('submitBtn');
    const errorBox = document.getElementById('formError');
    const success  = document.getElementById('successMessage');

    function showError(msg) {
      errorBox.textContent = msg;
      errorBox.style.display = 'block';
    }
    function clearError() {
      errorBox.style.display = 'none';
    }

    function validate() {
      const fn    = form.first_name.value.trim();
      const ln    = form.last_name.value.trim();
      const email = form.email.value.trim();
      const phone = form.phone.value.trim();
      if (!fn || !ln)   return 'Please enter your first and last name.';
      if (!email || !/^[^@]+@[^@]+\\.[^@]+$/.test(email)) return 'Please enter a valid email address.';
      if (!phone)        return 'Please enter your phone number.';
      return null;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearError();
      const err = validate();
      if (err) { showError(err); return; }

      btn.disabled    = true;
      btn.textContent = 'Submitting…';

      const data = Object.fromEntries(new FormData(form).entries());

      try {
        const res = await fetch('/submit', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(data),
        });
        const json = await res.json();

        if (res.ok && json.ok) {
          form.style.display    = 'none';
          success.style.display = 'block';
          ${company.redirect_url ? `setTimeout(() => { window.location.href = '${escapeHtml(company.redirect_url)}'; }, 2500);` : ''}
          ${company.pixel_id ? `if (typeof fbq !== 'undefined') fbq('track', 'Lead');` : ''}
          ${company.gtm_id   ? `if (typeof dataLayer !== 'undefined') dataLayer.push({ event: 'lead_submitted' });` : ''}
        } else {
          showError(json.error || 'Something went wrong. Please try again.');
          btn.disabled    = false;
          btn.textContent = '${escapeHtml(company.cta_button_text)}';
        }
      } catch {
        showError('Network error — please check your connection and try again.');
        btn.disabled    = false;
        btn.textContent = '${escapeHtml(company.cta_button_text)}';
      }
    });
  </script>
</body>
</html>`;
}

module.exports = { render };
