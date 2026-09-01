/**
 * crm.js — Routes a lead payload to the configured CRM.
 *
 * Each company row has:
 *   crm_type:        'webhook' | 'hubspot' | 'gohighlevel' | 'salesforce' | 'custom'
 *   crm_webhook_url: the destination endpoint
 *   crm_api_key:     bearer token / API key (if required)
 *   crm_extra_fields JSON of static fields to merge into every payload
 */

const axios = require('axios');

/**
 * @param {object} company  - Full company row from DB
 * @param {object} lead     - Normalised lead object
 * @returns {{ success: boolean, response: string }}
 */
async function routeLead(company, lead) {
  const extra = company.crm_extra_fields || {};

  switch (company.crm_type) {
    case 'hubspot':
      return sendHubSpot(company, lead, extra);
    case 'gohighlevel':
      return sendGoHighLevel(company, lead, extra);
    case 'salesforce':
      return sendSalesforce(company, lead, extra);
    case 'webhook':
    case 'custom':
    default:
      return sendWebhook(company, lead, extra);
  }
}

// ─── Generic Webhook ──────────────────────────────────────────────────────────
// POSTs the full lead payload as JSON.
// Works with Zapier, Make, n8n, GoHighLevel direct webhooks, etc.

async function sendWebhook(company, lead, extra) {
  const headers = { 'Content-Type': 'application/json' };
  if (company.crm_api_key) {
    headers['Authorization'] = `Bearer ${company.crm_api_key}`;
  }

  const payload = {
    ...lead,
    ...extra,
    company_name: company.company_name,
    source: 'landing-page',
  };

  const res = await axios.post(company.crm_webhook_url, payload, { headers, timeout: 8000 });
  return { success: true, response: JSON.stringify(res.data).slice(0, 500) };
}

// ─── HubSpot Contacts API ─────────────────────────────────────────────────────
// crm_api_key = your Private App token (starts with pat-na1-...)
// crm_webhook_url is ignored — endpoint is hardcoded to HubSpot's API.

async function sendHubSpot(company, lead, extra) {
  const properties = {
    firstname:  lead.first_name || '',
    lastname:   lead.last_name  || '',
    email:      lead.email,
    phone:      lead.phone      || '',
    hs_lead_status: 'NEW',
    // UTM / campaign data
    hs_analytics_source:         lead.utm_source   || 'DIRECT_TRAFFIC',
    hs_analytics_source_data_1:  lead.utm_medium   || '',
    hs_analytics_source_data_2:  lead.utm_campaign || '',
    ...extra,
  };

  const res = await axios.post(
    'https://api.hubapi.com/crm/v3/objects/contacts',
    { properties },
    {
      headers: {
        'Authorization': `Bearer ${company.crm_api_key}`,
        'Content-Type':  'application/json',
      },
      timeout: 8000,
    }
  );

  return { success: true, response: JSON.stringify(res.data).slice(0, 500) };
}

// ─── GoHighLevel (HighLevel) ──────────────────────────────────────────────────
// crm_api_key = your GHL API key
// crm_webhook_url = your GHL location's contact inbound endpoint,
//   or leave blank to use the standard Contacts API.

async function sendGoHighLevel(company, lead, extra) {
  // If a custom webhook URL is set (e.g. a funnel inbound), use it like a generic webhook
  if (company.crm_webhook_url) return sendWebhook(company, lead, extra);

  const payload = {
    firstName:  lead.first_name || '',
    lastName:   lead.last_name  || '',
    email:      lead.email,
    phone:      lead.phone      || '',
    source:     lead.utm_source || 'landing-page',
    tags:       [company.subdomain, 'landing-page'],
    customField: extra,
  };

  const res = await axios.post(
    'https://rest.gohighlevel.com/v1/contacts/',
    payload,
    {
      headers: {
        'Authorization': `Bearer ${company.crm_api_key}`,
        'Content-Type':  'application/json',
      },
      timeout: 8000,
    }
  );

  return { success: true, response: JSON.stringify(res.data).slice(0, 500) };
}

// ─── Salesforce Web-to-Lead ───────────────────────────────────────────────────
// crm_webhook_url = your org's Web-to-Lead endpoint
//   (e.g. https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8)
// crm_extra_fields should include { "oid": "YOUR_ORG_ID" }

async function sendSalesforce(company, lead, extra) {
  const params = new URLSearchParams({
    oid:         extra.oid || '',
    first_name:  lead.first_name || '',
    last_name:   lead.last_name  || '',
    email:       lead.email,
    phone:       lead.phone      || '',
    lead_source: lead.utm_source || 'Web',
    ...extra,
  });

  const res = await axios.post(
    company.crm_webhook_url,
    params.toString(),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 8000,
    }
  );

  return { success: true, response: String(res.status) };
}

module.exports = { routeLead };
