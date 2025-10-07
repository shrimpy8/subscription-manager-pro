#!/usr/bin/env node
/**
 * Dry-run importer for public/toolsSubscription2.json
 * - Normalizes fields (casing, booleans, dates)
 * - Generates UUID v4 for subscription ids
 * - Validates against expected schema constraints
 * - Prints summary (no DB writes)
 */

const fs = require('fs');
const path = require('path');

function generateUUIDv4() {
  // Basic UUID v4 generator (non-crypto)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (value == null) return false;
  const s = String(value).toLowerCase().trim();
  return s === 'true' || s === 'yes' || s === '1';
}

function normalizeStatus(value) {
  const m = String(value || '').toLowerCase();
  if (m === 'active' || m === 'paused' || m === 'canceled') return m;
  // handle common typos
  if (m === 'cancelled') return 'canceled';
  return 'active';
}

function normalizeUsageFrequency(value) {
  const m = String(value || '').toLowerCase();
  if (['daily', 'weekly', 'monthly', 'rarely'].includes(m)) return m;
  return 'monthly';
}

function normalizeUsageImportance(value) {
  const m = String(value || '').toLowerCase();
  if (['high', 'medium', 'low'].includes(m)) return m;
  return 'medium';
}

function parseISOorNull(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function normalizeRecord(rec) {
  // Required / core fields with defaults
  const normalized = {
    id: generateUUIDv4(),
    name: String(rec.name || '').trim(),
    plan: String(rec.plan || 'Free').trim(),
    logo_url: rec.logo_url || null,
    fallback_icon: rec.fallback_icon || null,
    cost: typeof rec.cost === 'number' ? rec.cost : Number(rec.cost || 0),
    currency: String(rec.currency || 'USD').trim(),
    billing_cycle: String(rec.billing_cycle || 'Monthly'),
    category: String(rec.category || 'Other').trim(),
    subcategory: rec.subcategory ? String(rec.subcategory).trim() : null,
    description: rec.description || null,
    url: rec.url || null,
    notes: rec.notes || null,
    status: normalizeStatus(rec.status || 'active'),
    usage_importance: normalizeUsageImportance(rec.usage_importance || 'medium'),
    usage_frequency: normalizeUsageFrequency(rec.usage_frequency || 'monthly'),
    account_email: rec.account_email || null,
    auto_renew: toBoolean(rec.auto_renew),
    start_date: parseISOorNull(rec.start_date),
    renewal_date: parseISOorNull(rec.renewal_date),
    safe_for_work: typeof rec.safe_for_work === 'boolean' ? rec.safe_for_work : toBoolean(rec.safe_for_work),
    china_region_only: typeof rec.china_region_only === 'boolean' ? rec.china_region_only : toBoolean(rec.china_region_only),
    a16z_rank: typeof rec.a16z_rank === 'number' ? rec.a16z_rank : null,
    secret_key: rec.secret_key || null,
    latest_promocode: rec.latest_promocode || null,
    // New flags
    iam_using_it: typeof rec.iam_using_it === 'boolean' ? rec.iam_using_it : toBoolean(rec.iam_using_it),
    no_subscription: rec.no_subscription == null ? true : toBoolean(rec.no_subscription),
    not_in_a16z: typeof rec.not_in_a16z === 'boolean' ? rec.not_in_a16z : toBoolean(rec.not_in_a16z),
  };

  // Relationship arrays
  const api_keys = Array.isArray(rec.subscription_api_keys)
    ? rec.subscription_api_keys
        .filter((x) => x && (x.key_name || x.key_value))
        .map((x) => ({ key_name: String(x.key_name || '').trim() || 'API Key', key_value: String(x.key_value || '').trim() }))
    : [];

  const prev_emails = Array.isArray(rec.subscription_previous_accountemails)
    ? rec.subscription_previous_accountemails
        .filter((x) => x && x.email)
        .map((x) => ({ email: String(x.email).trim() }))
    : [];

  const prev_promos = Array.isArray(rec.subscription_previous_promocodes)
    ? rec.subscription_previous_promocodes
        .filter((x) => x && (x.promocode || x.promo_code))
        .map((x) => ({ promo_code: String(x.promocode || x.promo_code).trim() }))
    : [];

  return { normalized, api_keys, prev_emails, prev_promos };
}

function validateRecord(n) {
  const errors = [];
  const allowedBilling = ['Monthly', 'Yearly', 'Weekly', 'Quarterly', 'Free'];
  if (!n.name) errors.push('name is required');
  if (!allowedBilling.includes(n.billing_cycle)) errors.push(`invalid billing_cycle: ${n.billing_cycle}`);
  if (!['active', 'paused', 'canceled'].includes(n.status)) errors.push(`invalid status: ${n.status}`);
  if (!['high', 'medium', 'low'].includes(n.usage_importance)) errors.push(`invalid usage_importance: ${n.usage_importance}`);
  if (!['daily', 'weekly', 'monthly', 'rarely'].includes(n.usage_frequency)) errors.push(`invalid usage_frequency: ${n.usage_frequency}`);
  if (Number.isNaN(n.cost)) errors.push('cost must be a number');
  return errors;
}

function main() {
  const argv = process.argv.slice(2);
  const showSamples = argv.includes('--show-samples');
  const jsonPath = path.resolve(process.cwd(), 'public', 'toolsSubscription2.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`File not found: ${jsonPath}`);
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  if (!Array.isArray(raw)) {
    console.error('Expected JSON array at public/toolsSubscription2.json');
    process.exit(1);
  }

  let baseCount = 0;
  let apiKeyCount = 0;
  let emailCount = 0;
  let promoCount = 0;
  const validationErrors = [];

  const normalizedRows = raw.map((rec, idx) => {
    const { normalized, api_keys, prev_emails, prev_promos } = normalizeRecord(rec);
    const errs = validateRecord(normalized);
    if (errs.length > 0) {
      validationErrors.push({ index: idx, name: normalized.name, errors: errs });
    }
    baseCount += 1;
    apiKeyCount += api_keys.length;
    emailCount += prev_emails.length;
    promoCount += prev_promos.length;
    return { normalized, api_keys, prev_emails, prev_promos };
  });

  // Output summary
  console.log('============================================');
  console.log('Import Dry-Run Summary (no DB writes)');
  console.log('============================================');
  console.log(`Subscriptions to insert: ${baseCount}`);
  console.log(`subscription_api_keys rows: ${apiKeyCount}`);
  console.log(`subscription_previous_accountemails rows: ${emailCount}`);
  console.log(`subscription_previous_promocodes rows: ${promoCount}`);
  console.log('');
  if (validationErrors.length > 0) {
    console.log(`Validation issues: ${validationErrors.length}`);
    console.log(validationErrors.slice(0, 10));
  } else {
    console.log('Validation issues: 0');
  }
  if (showSamples) {
    console.log('');
    console.log('Sample normalized rows (first 2):');
    console.log(JSON.stringify(normalizedRows.slice(0, 2), null, 2));
  }
}

if (require.main === module) {
  main();
}


