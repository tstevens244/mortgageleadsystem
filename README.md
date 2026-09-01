# LeadPage Platform

A multi-tenant landing page system. Each client gets a subdomain (`acme.yourdomain.com`) with its own branding, reviews, and CRM destination — all driven by a MySQL table. No code changes needed to add a new client.

---

## Architecture

```
acme.yourdomain.com
       │
       ▼
   Nginx (wildcard SSL + proxy)
       │
       ▼
   Node.js / Express  :3000
       │
       ├── reads companies + reviews from MySQL
       ├── renders HTML (theme, form, reviews)
       └── on submit → stores lead → POSTs to client CRM
```

---

## Quick Start (local dev)

```bash
# 1. Clone / copy project
cd leadpage

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your MySQL credentials

# 4. Create DB and seed data
mysql -u root -p < schema.sql

# 5. Start server
npm run dev

# 6. Test in browser (subdomain override via query param)
open http://localhost:3000/?__subdomain=acme
open http://localhost:3000/?__subdomain=sunpeak
```

---

## Environment Variables

| Variable        | Description                                     |
|-----------------|-------------------------------------------------|
| `PORT`          | Port to listen on (default 3000)                |
| `ROOT_DOMAIN`   | Your apex domain, e.g. `yourdomain.com`         |
| `DB_HOST`       | MySQL host                                      |
| `DB_PORT`       | MySQL port (default 3306)                       |
| `DB_NAME`       | Database name                                   |
| `DB_USER`       | DB username                                     |
| `DB_PASS`       | DB password                                     |
| `WEBHOOK_SECRET`| Optional signing secret for outbound webhooks   |

---

## Adding a New Client

Just insert a row into `companies` and rows into `reviews`:

```sql
INSERT INTO companies (
  subdomain, company_name, logo_url,
  primary_color, accent_color, bg_color,
  headline, subheadline, cta_button_text, trust_badge_text,
  form_title, success_message,
  crm_type, crm_webhook_url
) VALUES (
  'bestplumbing',
  'Best Plumbing Co.',
  'https://yourcdn.com/bestplumbing-logo.png',
  '#0f766e', '#0d9488', '#f0fdfa',
  'Emergency Plumber — On-Site in 60 Minutes',
  'Available 24/7 for burst pipes, blocked drains, and more.',
  'Request Emergency Service',
  '🔧 4.9 stars · 8,000+ jobs completed',
  'Get Emergency Plumbing Help Now',
  'We''ll call you within 5 minutes to confirm your appointment.',
  'webhook',
  'https://hooks.zapier.com/hooks/catch/XXXXXXX/YYYYYYY'
);

INSERT INTO reviews (company_id, author_name, author_title, rating, body) VALUES
  (LAST_INSERT_ID(), 'Tom B.', 'Homeowner', 5, 'Fixed our burst pipe at 2am. Incredible service.'),
  (LAST_INSERT_ID(), 'Maria S.', 'Property Manager', 5, 'Our go-to for all 20 units. Fast and honest.');
```

That's it. `bestplumbing.yourdomain.com` is now live.

---

## CRM Routing

Each company has a `crm_type` and `crm_webhook_url` / `crm_api_key`.

| crm_type       | What you need                                                      |
|----------------|--------------------------------------------------------------------|
| `webhook`      | Any POST endpoint (Zapier, Make, n8n, custom)                      |
| `hubspot`      | `crm_api_key` = HubSpot Private App token                          |
| `gohighlevel`  | `crm_api_key` = GHL API key (or `crm_webhook_url` for funnel)      |
| `salesforce`   | `crm_webhook_url` = Web-to-Lead URL; `crm_extra_fields.oid` = Org ID |
| `custom`       | Same as webhook — just POST to any URL                             |

### Static extra fields (per company)

Use `crm_extra_fields` (JSON column) to inject static values into every lead:

```sql
UPDATE companies
SET crm_extra_fields = '{"pipeline_id": "abc123", "owner_id": "user_99"}'
WHERE subdomain = 'acme';
```

---

## Lead Source / UTM Passthrough

Any UTM params on the landing page URL are automatically captured and forwarded to the CRM:

```
acme.yourdomain.com/?utm_source=google&utm_medium=cpc&utm_campaign=roofing-q4
```

The lead stored in MySQL and POSTed to the CRM will include all five UTM fields plus `referrer_url`, `ip_address`, and `user_agent`.

---

## Deployment

### Option A — Render / Railway (easiest)

1. Push to GitHub
2. Create a new **Web Service** pointing to your repo
3. Set environment variables in the dashboard
4. Point a **wildcard DNS record** at your service:
   `*.yourdomain.com → CNAME your-service.onrender.com`

### Option B — VPS (Ubuntu + Nginx)

**1. Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**2. Install PM2 (process manager)**
```bash
sudo npm install -g pm2
cd /var/www/leadpage
npm install --omit=dev
pm2 start src/server.js --name leadpage
pm2 save && pm2 startup
```

**3. Nginx wildcard config**

```nginx
# /etc/nginx/sites-available/leadpage
server {
    listen 80;
    listen [::]:80;
    server_name *.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name *.yourdomain.com;

    # Wildcard cert — get with:
    #   certbot certonly --dns-cloudflare -d *.yourdomain.com
    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/leadpage /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

**4. Wildcard DNS**

Add at your DNS provider:
```
*.yourdomain.com  →  A  your.server.ip.address
```

**5. Wildcard SSL with Certbot**
```bash
sudo certbot certonly --dns-cloudflare \
  --dns-cloudflare-credentials ~/.secrets/cloudflare.ini \
  -d "*.yourdomain.com" -d "yourdomain.com"
```

---

## Database columns reference

| Column             | Type        | Notes                                              |
|--------------------|-------------|----------------------------------------------------|
| `subdomain`        | VARCHAR     | Unique; maps to subdomain prefix                   |
| `primary_color`    | VARCHAR(7)  | Hex, e.g. `#2563eb` — buttons, header, accents     |
| `accent_color`     | VARCHAR(7)  | Hex — gradient end, hover states                   |
| `bg_color`         | VARCHAR(7)  | Hex — page background                              |
| `headline`         | VARCHAR(300)| Hero headline                                      |
| `subheadline`      | VARCHAR(500)| Hero supporting copy (optional)                    |
| `cta_button_text`  | VARCHAR(100)| Submit button label                                |
| `trust_badge_text` | VARCHAR(200)| Pill badge in hero (optional)                      |
| `form_title`       | VARCHAR(200)| Heading above the form                             |
| `success_message`  | VARCHAR(500)| Shown after submit                                 |
| `redirect_url`     | VARCHAR(500)| If set, redirects 2.5s after submit (optional)     |
| `crm_type`         | ENUM        | `webhook`, `hubspot`, `gohighlevel`, `salesforce`  |
| `crm_webhook_url`  | VARCHAR(500)| POST destination                                   |
| `crm_api_key`      | VARCHAR(500)| Bearer token / API key                             |
| `crm_extra_fields` | JSON        | Static fields merged into every lead payload       |
| `gtm_id`           | VARCHAR(50) | Google Tag Manager container ID (optional)         |
| `pixel_id`         | VARCHAR(100)| Meta Pixel ID (optional)                           |
| `active`           | TINYINT     | Set to 0 to take a page offline                    |
