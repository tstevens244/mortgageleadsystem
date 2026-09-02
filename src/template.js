/**
 * template.js — Renders the landing page HTML for a given company + reviews.
 * Multi-step mortgage lead form with blurred results reveal.
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
    : '';

  const gtmHead = company.gtm_id
    ? `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${company.gtm_id}');</script>` : '';

  const metaPixel = company.pixel_id
    ? `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${company.pixel_id}');fbq('track','PageView');</script>` : '';

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
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --primary:  ${company.primary_color};
      --accent:   ${company.accent_color};
      --text:     ${company.text_color};
      --bg:       ${company.bg_color};
      --radius:   12px;
      --shadow:   0 4px 32px rgba(0,0,0,0.10);
    }

    body {
      font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      min-height: 100vh;
    }

    /* Header */
    .site-header {
      background: var(--primary);
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .site-header img { max-height: 48px; width: auto; }
    .site-header .company-name-text {
      font-size: 1.4rem; font-weight: 700; color: #fff; letter-spacing: -0.02em;
    }

    /* Hero */
    .hero {
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
      color: #fff; text-align: center; padding: 48px 24px 80px;
    }
    .hero h1 {
      font-size: clamp(1.6rem, 4vw, 2.5rem); font-weight: 800;
      letter-spacing: -0.03em; line-height: 1.15;
      max-width: 680px; margin: 0 auto 14px;
    }
    .hero p {
      font-size: clamp(0.95rem, 2vw, 1.1rem); opacity: 0.88;
      max-width: 520px; margin: 0 auto 18px;
    }
    .trust-badge {
      display: inline-block;
      background: rgba(255,255,255,0.18);
      border: 1px solid rgba(255,255,255,0.35);
      border-radius: 999px; padding: 6px 18px;
      font-size: 0.88rem; font-weight: 600;
    }

    /* Layout */
    .main-layout {
      max-width: 780px; margin: -44px auto 0;
      padding: 0 20px 60px;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    /* Form card */
    .form-card {
      background: #fff; border-radius: var(--radius);
      box-shadow: var(--shadow); overflow: hidden;
      width: 100%;
    }

    /* Progress bar */
    .progress-bar-wrap {
      height: 4px; background: #e5e7eb;
    }
    .progress-bar {
      height: 4px; background: var(--primary);
      transition: width 0.4s ease;
    }

    .form-inner { padding: 32px 28px; }

    /* Step counter */
    .step-counter {
      font-size: 0.75rem; font-weight: 600;
      color: #9ca3af; text-transform: uppercase;
      letter-spacing: 0.08em; margin-bottom: 8px;
    }

    /* Step */
    .step { display: none; }
    .step.active { display: block; animation: fadeSlide 0.25s ease; }

    @keyframes fadeSlide {
      from { opacity: 0; transform: translateX(16px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    .step h2 {
      font-size: 1.15rem; font-weight: 700;
      color: var(--text); margin-bottom: 20px; line-height: 1.35;
    }

    /* Option buttons */
    .options-grid {
      display: grid; gap: 10px;
      grid-template-columns: 1fr 1fr;
    }
    .options-grid.single-col { grid-template-columns: 1fr; }

    .opt-btn {
      padding: 13px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 9px;
      background: #fff;
      font-size: 0.95rem; font-weight: 500;
      color: var(--text);
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s, color 0.15s;
      text-align: left;
      display: flex; align-items: center; gap: 10px;
    }
    .opt-btn:hover {
      border-color: var(--primary);
      background: color-mix(in srgb, var(--primary) 6%, white);
    }
    .opt-btn.selected {
      border-color: var(--primary);
      background: color-mix(in srgb, var(--primary) 10%, white);
      color: var(--primary);
      font-weight: 600;
    }
    .opt-icon { font-size: 1.3rem; }

    /* Slider */
    .slider-wrap { margin-top: 8px; }
    .slider-value {
      font-size: 1.8rem; font-weight: 800;
      color: var(--primary); margin-bottom: 16px;
      text-align: center;
    }
    input[type=range] {
      width: 100%; height: 6px;
      -webkit-appearance: none;
      background: linear-gradient(to right, var(--primary) 0%, var(--primary) 50%, #e5e7eb 50%, #e5e7eb 100%);
      border-radius: 999px; outline: none; cursor: pointer;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 22px; height: 22px;
      border-radius: 50%;
      background: var(--primary);
      border: 3px solid #fff;
      box-shadow: 0 1px 6px rgba(0,0,0,0.2);
      cursor: pointer;
    }
    .slider-labels {
      display: flex; justify-content: space-between;
      font-size: 0.75rem; color: #9ca3af; margin-top: 8px;
    }

    /* Zip input */
    .zip-input {
      width: 100%; padding: 16px;
      border: 2px solid #e5e7eb; border-radius: 9px;
      font-size: 1.5rem; font-weight: 700;
      text-align: center; letter-spacing: 0.15em;
      outline: none; color: var(--text);
      transition: border-color 0.15s;
    }
    .zip-input:focus { border-color: var(--primary); }

    /* Next button */
    .next-btn {
      width: 100%; padding: 14px;
      background: var(--primary); color: #fff;
      border: none; border-radius: 9px;
      font-size: 1.05rem; font-weight: 700;
      cursor: pointer; margin-top: 20px;
      transition: background 0.15s, transform 0.1s;
    }
    .next-btn:hover { background: var(--accent); }
    .next-btn:active { transform: scale(0.99); }
    .next-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Loading screen */
    .loading-screen {
      display: none; text-align: center; padding: 40px 20px;
    }
    .loading-screen.active { display: block; }
    .loading-title {
      font-size: 1.1rem; font-weight: 700; margin-bottom: 24px;
    }
    .loading-items { list-style: none; text-align: left; margin-bottom: 24px; }
    .loading-items li {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 0; font-size: 0.92rem; color: #6b7280;
      border-bottom: 1px solid #f3f4f6;
    }
    .loading-items li .check {
      width: 20px; height: 20px; border-radius: 50%;
      background: #e5e7eb; display: flex; align-items: center;
      justify-content: center; flex-shrink: 0;
      font-size: 0.7rem; transition: background 0.3s;
    }
    .loading-items li.done .check { background: #22c55e; color: #fff; }
    .loading-bar-wrap { height: 6px; background: #e5e7eb; border-radius: 999px; overflow: hidden; }
    .loading-bar { height: 6px; background: var(--primary); border-radius: 999px; width: 0%; transition: width 0.4s ease; }

    /* Blurred results + email gate */
    .results-screen { display: none; }
    .results-screen.active { display: block; }

    .results-badge {
      background: var(--primary); color: #fff;
      font-size: 0.75rem; font-weight: 700;
      padding: 4px 12px; border-radius: 999px;
      display: inline-block; margin-bottom: 12px;
      letter-spacing: 0.05em;
    }
    .results-title {
      font-size: 1.1rem; font-weight: 800;
      margin-bottom: 16px; line-height: 1.3;
    }

    /* Blurred table */
    .results-table-wrap { position: relative; margin-bottom: 0; }
    .results-table {
      width: 100%; border-collapse: collapse;
      font-size: 0.8rem;
    }
    .results-table th {
      text-align: left; padding: 6px 8px;
      color: #9ca3af; font-size: 0.7rem;
      text-transform: uppercase; letter-spacing: 0.05em;
      border-bottom: 1px solid #f3f4f6;
    }
    .results-table td {
      padding: 10px 8px; border-bottom: 1px solid #f3f4f6;
      font-weight: 500;
    }
    .results-table tr:last-child td { border-bottom: none; }
    .blur-overlay {
      position: absolute; bottom: 0; left: 0; right: 0;
      height: 75%;
      background: linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.6) 30%, rgba(255,255,255,0.97) 100%);
      display: flex; flex-direction: column;
      align-items: center; justify-content: flex-end;
      padding-bottom: 16px;
    }

    /* Email gate */
    .email-gate {
      background: #fff; border-radius: var(--radius);
      padding: 20px; width: 100%;
      box-shadow: 0 2px 16px rgba(0,0,0,0.08);
    }
    .email-gate p {
      font-size: 0.85rem; color: #6b7280;
      margin-bottom: 12px; text-align: center;
    }
    .email-row {
      display: flex; gap: 8px;
    }
    .email-input {
      flex: 1; padding: 12px 14px;
      border: 2px solid #e5e7eb; border-radius: 8px;
      font-size: 0.95rem; outline: none;
      transition: border-color 0.15s;
    }
    .email-input:focus { border-color: var(--primary); }
    .email-btn {
      padding: 12px 18px;
      background: var(--primary); color: #fff;
      border: none; border-radius: 8px;
      font-size: 0.95rem; font-weight: 700;
      cursor: pointer; white-space: nowrap;
      transition: background 0.15s;
    }
    .email-btn:hover { background: var(--accent); }
    .no-ssn {
      text-align: center; font-size: 0.72rem;
      color: #9ca3af; margin-top: 8px;
    }

    /* Final success */
    .success-screen {
      display: none; text-align: center; padding: 32px 20px;
    }
    .success-screen.active { display: block; }
    .success-icon { font-size: 3rem; margin-bottom: 12px; }
    .success-screen h3 { font-size: 1.3rem; font-weight: 700; margin-bottom: 8px; }
    .success-screen p { color: #6b7280; }

    /* Reviews */
    .reviews-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .review-card {
      background: #fff; border-radius: var(--radius);
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      padding: 20px; border-top: 3px solid var(--primary);
    }
    .review-stars { display: flex; gap: 2px; color: #f59e0b; margin-bottom: 10px; }
    .review-body { font-size: 0.92rem; line-height: 1.55; color: #374151; margin-bottom: 14px; }
    .review-author { display: flex; align-items: center; gap: 10px; }
    .review-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: var(--primary); color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem; font-weight: 700; flex-shrink: 0; overflow: hidden;
    }
    .review-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .review-author strong { display: block; font-size: 0.88rem; }
    .review-title { font-size: 0.78rem; color: #9ca3af; }

    @media (max-width: 700px) {
      .reviews-row { grid-template-columns: 1fr 1fr; }
      .options-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 480px) {
      .hero { padding: 36px 16px 60px; }
      .main-layout { margin-top: -24px; }
      .form-inner { padding: 24px 18px; }
      .reviews-row { grid-template-columns: 1fr; }
      .options-grid { grid-template-columns: 1fr; }
      .email-row { flex-direction: column; }
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

    <!-- Form card -->
    <div class="form-card">
      <div class="progress-bar-wrap">
        <div class="progress-bar" id="progressBar" style="width: 11%"></div>
      </div>

      <div class="form-inner">
        <div class="step-counter" id="stepCounter">Step 1 of 9</div>

        <!-- Step 1: Home type -->
        <div class="step active" id="step-1">
          <h2>What kind of home are you looking for?</h2>
          <div class="options-grid">
            <button class="opt-btn" data-field="home_type" data-value="Single Family Home" onclick="selectOpt(this)"><span class="opt-icon">🏠</span> Single Family</button>
            <button class="opt-btn" data-field="home_type" data-value="Townhome" onclick="selectOpt(this)"><span class="opt-icon">🏘️</span> Townhome</button>
            <button class="opt-btn" data-field="home_type" data-value="Condo" onclick="selectOpt(this)"><span class="opt-icon">🏢</span> Condo</button>
            <button class="opt-btn" data-field="home_type" data-value="Multi Family" onclick="selectOpt(this)"><span class="opt-icon">🏗️</span> Multi Family</button>
          </div>
        </div>

        <!-- Step 2: Timeline -->
        <div class="step" id="step-2">
          <h2>When are you planning to make your home purchase?</h2>
          <div class="options-grid single-col">
            <button class="opt-btn" data-field="timeline" data-value="Immediately" onclick="selectOpt(this)"><span class="opt-icon">⚡</span> Immediately</button>
            <button class="opt-btn" data-field="timeline" data-value="Within 30 Days" onclick="selectOpt(this)"><span class="opt-icon">📅</span> Within 30 Days</button>
            <button class="opt-btn" data-field="timeline" data-value="2–6 Months" onclick="selectOpt(this)"><span class="opt-icon">🗓️</span> 2–6 Months</button>
            <button class="opt-btn" data-field="timeline" data-value="6+ Months" onclick="selectOpt(this)"><span class="opt-icon">🔭</span> 6+ Months</button>
          </div>
        </div>

        <!-- Step 3: Residency -->
        <div class="step" id="step-3">
          <h2>What is the residency type?</h2>
          <div class="options-grid single-col">
            <button class="opt-btn" data-field="residency_type" data-value="Primary Home" onclick="selectOpt(this)"><span class="opt-icon">🏡</span> Primary Home</button>
            <button class="opt-btn" data-field="residency_type" data-value="Second Home" onclick="selectOpt(this)"><span class="opt-icon">🌴</span> Second Home</button>
            <button class="opt-btn" data-field="residency_type" data-value="Rental / Investment" onclick="selectOpt(this)"><span class="opt-icon">💼</span> Rental / Investment</button>
          </div>
        </div>

        <!-- Step 4: Zip -->
        <div class="step" id="step-4">
          <h2>What is the ZIP code of the property?</h2>
          <input type="tel" class="zip-input" id="zip_code" maxlength="5" placeholder="00000" oninput="zipChanged(this)">
          <button class="next-btn" id="zipNextBtn" onclick="nextStep()" disabled>Continue →</button>
        </div>

        <!-- Step 5: Property value -->
        <div class="step" id="step-5">
          <h2>What is the estimated property value?</h2>
          <div class="slider-wrap">
            <div class="slider-value" id="prop_val_display">$450,000</div>
            <input type="range" id="property_value" min="50000" max="2000000" step="5000" value="450000" oninput="updateSlider('property_value','prop_val_display','$',true); updateDownPayment()">
            <div class="slider-labels"><span>$50K</span><span>$2M</span></div>
          </div>
          <button class="next-btn" onclick="nextStep()">Continue →</button>
        </div>

        <!-- Step 6: Down payment -->
        <div class="step" id="step-6">
          <h2>What is the estimated down payment?</h2>
          <div class="slider-wrap">
            <div class="slider-value" id="down_pay_display">$90,000</div>
            <input type="range" id="down_payment" min="0" max="500000" step="1000" value="90000" oninput="updateSlider('down_payment','down_pay_display','$',true)">
            <div class="slider-labels"><span>$0</span><span>$500K</span></div>
          </div>
          <button class="next-btn" onclick="nextStep()">Continue →</button>
        </div>

        <!-- Step 7: Income -->
        <div class="step" id="step-7">
          <h2>What is your annual household income?</h2>
          <div class="slider-wrap">
            <div class="slider-value" id="income_display">$200,000</div>
            <input type="range" id="annual_income" min="20000" max="1000000" step="5000" value="200000" oninput="updateSlider('annual_income','income_display','$',true)">
            <div class="slider-labels"><span>$20K</span><span>$1M+</span></div>
          </div>
          <button class="next-btn" onclick="nextStep()">Continue →</button>
        </div>

        <!-- Step 8: Credit score -->
        <div class="step" id="step-8">
          <h2>What is your estimated credit score?</h2>
          <div class="slider-wrap">
            <div class="slider-value" id="credit_display">700</div>
            <input type="range" id="credit_score" min="500" max="850" step="10" value="700" oninput="updateSlider('credit_score','credit_display','',false)">
            <div class="slider-labels"><span>500</span><span>850</span></div>
          </div>
          <button class="next-btn" onclick="nextStep()">Continue →</button>
        </div>

        <!-- Step 9: Military -->
        <div class="step" id="step-9">
          <h2>Have you or your spouse served in the military?</h2>
          <div class="options-grid">
            <button class="opt-btn" data-field="military" data-value="Yes" onclick="selectOpt(this)"><span class="opt-icon">🎖️</span> Yes</button>
            <button class="opt-btn" data-field="military" data-value="No" onclick="selectOpt(this)"><span class="opt-icon">👤</span> No</button>
          </div>
        </div>

        <!-- Loading screen -->
        <div class="loading-screen" id="loadingScreen">
          <div class="loading-title">Finding your best mortgage options...</div>
          <ul class="loading-items">
            <li id="li1"><span class="check">✓</span> Checking loan eligibility</li>
            <li id="li2"><span class="check">✓</span> Comparing lender rates</li>
            <li id="li3"><span class="check">✓</span> Calculating your savings</li>
            <li id="li4"><span class="check">✓</span> Preparing your results</li>
          </ul>
          <div class="loading-bar-wrap">
            <div class="loading-bar" id="loadingBar"></div>
          </div>
        </div>

        <!-- Results + email gate -->
        <div class="results-screen" id="resultsScreen">
          <div class="results-badge">● LIVE RATES</div>
          <div class="results-title">You have mortgage options that are ready for your review!</div>
          <div class="results-table-wrap">
            <table class="results-table">
              <thead>
                <tr>
                  <th>Term</th>
                  <th>Rate</th>
                  <th>Mo. Payment</th>
                  <th>Fees</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>30-Year Fixed</td><td>6.49%</td><td style="filter:blur(5px)">$2,844</td><td style="filter:blur(5px)">$1,200</td></tr>
                <tr><td>15-Year Fixed</td><td>5.89%</td><td style="filter:blur(5px)">$3,761</td><td style="filter:blur(5px)">$950</td></tr>
                <tr><td>5/1 ARM</td><td>5.99%</td><td style="filter:blur(5px)">$2,694</td><td style="filter:blur(5px)">$800</td></tr>
                <tr><td>FHA 30-Year</td><td>6.25%</td><td style="filter:blur(5px)">$2,770</td><td style="filter:blur(5px)">$1,100</td></tr>
              </tbody>
            </table>
            <div class="blur-overlay">
              <div class="email-gate">
                <p>Free and complete access in seconds</p>
                <div class="email-row">
                  <input type="email" class="email-input" id="emailInput" placeholder="Enter your email">
                  <button class="email-btn" onclick="submitLead()">Continue</button>
                </div>
                <div class="no-ssn">• No SSN required •</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Success -->
        <div class="success-screen" id="successScreen">
          <div class="success-icon">✅</div>
          <h3>You're all set!</h3>
          <p>${escapeHtml(company.success_message)}</p>
        </div>

      </div>
    </div>

    <!-- Reviews row below form -->
    <div class="reviews-row">
      ${reviews.length >= 1 ? reviewCard(reviews[0]) : ''}
      ${reviews.length >= 2 ? reviewCard(reviews[1]) : ''}
      ${reviews.length >= 3 ? reviewCard(reviews[2]) : ''}
    </div>

  </div>

  <script>
    // State
    const answers = {};
    let currentStep = 1;
    const TOTAL_STEPS = 9;

    // Format currency
    function fmt(n) {
      return '$' + Number(n).toLocaleString();
    }

    // Update slider display + gradient
    function updateSlider(id, displayId, prefix, currency) {
      const el = document.getElementById(id);
      const val = parseInt(el.value);
      const display = document.getElementById(displayId);
      display.textContent = currency ? fmt(val) : prefix + val;
      answers[id] = val;
      // Update gradient
      const min = parseInt(el.min), max = parseInt(el.max);
      const pct = ((val - min) / (max - min)) * 100;
      el.style.background = 'linear-gradient(to right, var(--primary) 0%, var(--primary) ' + pct + '%, #e5e7eb ' + pct + '%, #e5e7eb 100%)';
    }

    function updateDownPayment() {
      const propVal = parseInt(document.getElementById('property_value').value);
      const dp = document.getElementById('down_payment');
      const newDefault = Math.round(propVal * 0.20 / 1000) * 1000;
      dp.value = Math.min(newDefault, parseInt(dp.max));
      updateSlider('down_payment', 'down_pay_display', '$', true);
    }

    // Initialize all sliders
    function initSliders() {
      updateSlider('property_value', 'prop_val_display', '$', true);
      updateSlider('down_payment', 'down_pay_display', '$', true);
      updateSlider('annual_income', 'income_display', '$', true);
      updateSlider('credit_score', 'credit_display', '', false);
    }
    initSliders();

    // Option button selection — auto-advance
    function selectOpt(btn) {
      const field = btn.dataset.field;
      document.querySelectorAll('[data-field="' + field + '"]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      answers[field] = btn.dataset.value;
      setTimeout(() => nextStep(), 300);
    }

    // Zip validation
    function zipChanged(el) {
      document.getElementById('zipNextBtn').disabled = el.value.length !== 5;
      answers['zip_code'] = el.value;
    }

    // Progress
    function updateProgress() {
      const pct = (currentStep / TOTAL_STEPS) * 100;
      document.getElementById('progressBar').style.width = pct + '%';
      document.getElementById('stepCounter').textContent = 'Step ' + currentStep + ' of ' + TOTAL_STEPS;
    }

    // Next step
    function nextStep() {
      // Collect slider values for current step
      const sliderMap = { 5: ['property_value'], 6: ['down_payment'], 7: ['annual_income'], 8: ['credit_score'] };
      if (sliderMap[currentStep]) {
        sliderMap[currentStep].forEach(id => {
          answers[id] = parseInt(document.getElementById(id).value);
        });
      }

      document.getElementById('step-' + currentStep).classList.remove('active');
      currentStep++;

      if (currentStep <= TOTAL_STEPS) {
        document.getElementById('step-' + currentStep).classList.add('active');
        updateProgress();
      } else {
        // Show loading
        document.getElementById('stepCounter').style.display = 'none';
        document.getElementById('progressBar').parentElement.style.display = 'none';
        showLoading();
      }
    }

    // Loading animation
    function showLoading() {
      const ls = document.getElementById('loadingScreen');
      ls.classList.add('active');
      const items = ['li1','li2','li3','li4'];
      const bar = document.getElementById('loadingBar');
      let i = 0;
      const interval = setInterval(() => {
        if (i < items.length) {
          document.getElementById(items[i]).classList.add('done');
          bar.style.width = ((i + 1) / items.length * 100) + '%';
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            ls.classList.remove('active');
            document.getElementById('resultsScreen').classList.add('active');
          }, 400);
        }
      }, 500);
    }

    // Final submit with email
    async function submitLead() {
      const email = document.getElementById('emailInput').value.trim();
      if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
        document.getElementById('emailInput').style.borderColor = '#ef4444';
        return;
      }
      answers['email'] = email;

      // UTM params
      const params = new URLSearchParams(window.location.search);
      ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'].forEach(k => {
        if (params.get(k)) answers[k] = params.get(k);
      });

      try {
        await fetch('/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(answers),
        });
      } catch(e) {}

      document.getElementById('resultsScreen').classList.remove('active');
      document.getElementById('successScreen').classList.add('active');
      ${company.redirect_url ? `setTimeout(() => { window.location.href = '${escapeHtml(company.redirect_url)}'; }, 2500);` : ''}
    }
  </script>
</body>
</html>`;
}

module.exports = { render };
