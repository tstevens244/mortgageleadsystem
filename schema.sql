-- ============================================================
-- Landing Page Platform — MySQL Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS leadpages;
USE leadpages;

-- -------------------------------------------------------
-- companies: one row per client / subdomain
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS companies (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  subdomain       VARCHAR(100) NOT NULL UNIQUE,   -- e.g. "acme" for acme.yourdomain.com
  company_name    VARCHAR(200) NOT NULL,
  logo_url        VARCHAR(500),
  favicon_url     VARCHAR(500),

  -- Branding
  primary_color   VARCHAR(7)   NOT NULL DEFAULT '#2563eb',  -- hex
  accent_color    VARCHAR(7)   NOT NULL DEFAULT '#1e40af',
  text_color      VARCHAR(7)   NOT NULL DEFAULT '#111827',
  bg_color        VARCHAR(7)   NOT NULL DEFAULT '#ffffff',

  -- Page copy
  headline        VARCHAR(300) NOT NULL DEFAULT 'Get Your Free Quote Today',
  subheadline     VARCHAR(500),
  cta_button_text VARCHAR(100) NOT NULL DEFAULT 'Get My Free Quote',
  trust_badge_text VARCHAR(200) DEFAULT 'Trusted by 10,000+ customers',

  -- Form settings
  form_title      VARCHAR(200) DEFAULT 'Request a Free Consultation',
  success_message VARCHAR(500) DEFAULT 'Thank you! We''ll be in touch shortly.',
  redirect_url    VARCHAR(500),                   -- optional post-submit redirect

  -- CRM routing
  crm_type        ENUM('webhook','hubspot','gohighlevel','salesforce','custom') NOT NULL DEFAULT 'webhook',
  crm_webhook_url VARCHAR(500),                   -- POST destination for all leads
  crm_api_key     VARCHAR(500),                   -- if the CRM needs an auth header
  crm_extra_fields JSON,                          -- static fields to merge into every lead payload

  -- Tracking
  gtm_id          VARCHAR(50),                    -- Google Tag Manager ID
  pixel_id        VARCHAR(100),                   -- Meta Pixel ID

  active          TINYINT(1) NOT NULL DEFAULT 1,
  created_at      DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- -------------------------------------------------------
-- reviews: star ratings shown on the landing page
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  company_id  INT NOT NULL,
  author_name VARCHAR(150) NOT NULL,
  author_title VARCHAR(150),                      -- e.g. "Homeowner in Austin, TX"
  rating      TINYINT NOT NULL DEFAULT 5,         -- 1–5
  body        TEXT NOT NULL,
  avatar_url  VARCHAR(500),
  sort_order  INT NOT NULL DEFAULT 0,
  active      TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- -------------------------------------------------------
-- leads: every submission stored locally
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  company_id      INT NOT NULL,
  first_name      VARCHAR(150),
  last_name       VARCHAR(150),
  email           VARCHAR(255) NOT NULL,
  phone           VARCHAR(30),
  utm_source      VARCHAR(100),
  utm_medium      VARCHAR(100),
  utm_campaign    VARCHAR(100),
  utm_term        VARCHAR(100),
  utm_content     VARCHAR(100),
  referrer_url    VARCHAR(1000),
  ip_address      VARCHAR(45),
  user_agent      VARCHAR(500),
  raw_payload     JSON,                           -- full form + meta snapshot
  crm_status      ENUM('pending','sent','failed') NOT NULL DEFAULT 'pending',
  crm_response    TEXT,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- -------------------------------------------------------
-- Seed: two example companies
-- -------------------------------------------------------
INSERT INTO companies (
  subdomain, company_name, logo_url,
  primary_color, accent_color, bg_color,
  headline, subheadline, cta_button_text, trust_badge_text,
  form_title, crm_webhook_url
) VALUES
(
  'acme',
  'Acme Roofing',
  'https://placehold.co/180x50/2563eb/ffffff?text=ACME+Roofing',
  '#2563eb', '#1e40af', '#f0f7ff',
  'Get a Free Roof Inspection — No Obligation',
  'Storm damage? Aging shingles? Our certified inspectors will assess your roof for free and walk you through your options.',
  'Schedule My Free Inspection',
  '⭐ Rated 4.9 / 5 by 2,300+ homeowners',
  'Schedule Your Free Roof Inspection',
  'https://webhook.site/YOUR-ACME-WEBHOOK-ID'
),
(
  'sunpeak',
  'SunPeak Solar',
  'https://placehold.co/180x50/f59e0b/ffffff?text=SunPeak+Solar',
  '#f59e0b', '#d97706', '#fffdf0',
  'Find Out How Much You Can Save With Solar',
  'Most homeowners cut their electric bill by 70–90%. Get a personalized savings estimate in 60 seconds.',
  'Get My Savings Estimate',
  '🌟 4.8-star rating · 5,000+ installations',
  'Get Your Free Solar Savings Estimate',
  'https://webhook.site/YOUR-SUNPEAK-WEBHOOK-ID'
);

-- Seed reviews for Acme Roofing (company_id = 1)
INSERT INTO reviews (company_id, author_name, author_title, rating, body, sort_order) VALUES
(1, 'Jennifer M.', 'Homeowner, St. Louis MO', 5, 'The inspection was thorough and the team was on time. They found damage I didn''t even know I had and worked directly with my insurance company. Stress-free from start to finish.', 1),
(1, 'Robert K.', 'Property Manager', 5, 'I manage 12 units and Acme handles all of them. Fast scheduling, honest quotes, and the workmanship is excellent. Highly recommend.', 2),
(1, 'Lisa T.', 'First-time Homeowner', 5, 'Called after the hailstorm last spring. They came out the next day, filed the claim for me, and had the roof done within two weeks. Couldn''t ask for more.', 3);

-- Seed reviews for SunPeak Solar (company_id = 2)
INSERT INTO reviews (company_id, author_name, author_title, rating, body, sort_order) VALUES
(2, 'Marcus B.', 'Homeowner, Phoenix AZ', 5, 'My bill went from $340/month down to $41. The SunPeak team handled permits, installation, and utility paperwork. Seamless experience.', 1),
(2, 'Sarah L.', 'Small Business Owner', 5, 'Installed panels on our shop last fall. ROI is ahead of schedule. The savings estimate they gave us was spot-on.', 2),
(2, 'David W.', 'Retired Homeowner', 4, 'Great communication throughout the process. Install crew was professional and cleaned up completely. Would recommend to anyone on the fence about solar.', 3);
