#!/usr/bin/env node
/**
 * Importer for public/toolsSubscription2.json into local sandbox DB.
 * - Uses local REST endpoints via Supabase REST (service key required) or direct SQL via /rest/v1/rpc
 * - Flags: --dry-run (no writes), --truncate (wipe tables first)
 *
 * Note: For simplicity and avoiding new deps, this script prints SQL you can run in Studio.
 * Steps:
 * 1) Generates INSERT statements for subscriptions and relationship tables.
 * 2) Honors --dry-run (prints only) or writes SQL file to disk for manual execution.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Reuse normalization from dry-run by requiring the file
const dryRunPath = path.resolve(__dirname, 'import-dry-run.js');
const dryRunSrc = fs.readFileSync(dryRunPath, 'utf-8');

// Eval minimal helpers from dry-run in this context
let helpers = {};
(function loadHelpers() {
  // Extract needed functions: generateUUIDv4, toBoolean, normalizeStatus, normalizeUsageFrequency, normalizeUsageImportance, parseISOorNull, normalizeRecord
  const startIdx = dryRunSrc.indexOf('function generateUUIDv4()');
  const need = [
    'function generateUUIDv4()',
    'function toBoolean(',
    'function normalizeStatus(',
    'function normalizeUsageFrequency(',
    'function normalizeUsageImportance(',
    'function parseISOorNull(',
    'function normalizeRecord('
  ];
  let block = '';
  for (const key of need) {
    const i = dryRunSrc.indexOf(key);
    if (i >= 0) {
      // naive slice to function end by next double newline + function start heuristic
      const tail = dryRunSrc.slice(i);
      const end = tail.indexOf('\n}\n');
      block += tail.slice(0, end + 3) + '\n\n';
    }
  }
  // eslint-disable-next-line no-new-func
  const fn = new Function(block + '\nreturn { generateUUIDv4, toBoolean, normalizeStatus, normalizeUsageFrequency, normalizeUsageImportance, parseISOorNull, normalizeRecord };');
  helpers = fn();
})();

function readJson() {
  const p = path.resolve(process.cwd(), 'public', 'toolsSubscription6.json');
  const raw = JSON.parse(fs.readFileSync(p, 'utf-8'));
  if (!Array.isArray(raw)) throw new Error('Expected array in toolsSubscription6.json');
  return raw;
}

function sqlLiteral(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  // escape single quotes
  return `'${String(val).replace(/'/g, "''")}'`;
}

function buildSQL(records) {
  const stmts = [];

  // Optional truncate
  stmts.push('-- Optional wipe (uncomment to use)');
  stmts.push('-- TRUNCATE subscription_api_keys, subscription_previous_promocodes, subscription_previous_accountemails, subscription_alternatives, subscription_tags, subscriptions RESTART IDENTITY CASCADE;');
  stmts.push('');

  for (const { normalized, api_keys, prev_emails, prev_promos } of records) {
    // Ensure NOT NULL start/renewal dates: fallback to NOW() and NOW()+1 month if null
    const startDate = normalized.start_date ? sqlLiteral(normalized.start_date) : 'NOW()';
    const renewalDate = normalized.renewal_date ? sqlLiteral(normalized.renewal_date) : "(NOW() + INTERVAL '1 month')";

    const cols = [
      'id','name','plan','cost','currency','billing_cycle','category','subcategory','description','url','status','usage_importance','usage_frequency','account_email','auto_renew','start_date','renewal_date','logo_url','fallback_icon','safe_for_work','china_region_only','a16z_rank','secret_key','latest_promocode','iam_using_it','no_subscription','not_in_a16z','notes'
    ];
    const vals = [
      sqlLiteral(normalized.id), sqlLiteral(normalized.name), sqlLiteral(normalized.plan), sqlLiteral(normalized.cost), sqlLiteral(normalized.currency), sqlLiteral(normalized.billing_cycle), sqlLiteral(normalized.category), sqlLiteral(normalized.subcategory), sqlLiteral(normalized.description), sqlLiteral(normalized.url), sqlLiteral(normalized.status), sqlLiteral(normalized.usage_importance), sqlLiteral(normalized.usage_frequency), sqlLiteral(normalized.account_email), sqlLiteral(normalized.auto_renew), startDate, renewalDate, sqlLiteral(normalized.logo_url), sqlLiteral(normalized.fallback_icon), sqlLiteral(normalized.safe_for_work), sqlLiteral(normalized.china_region_only), sqlLiteral(normalized.a16z_rank), sqlLiteral(normalized.secret_key), sqlLiteral(normalized.latest_promocode), sqlLiteral(normalized.iam_using_it), sqlLiteral(normalized.no_subscription), sqlLiteral(normalized.not_in_a16z), sqlLiteral(normalized.notes)
    ];

    stmts.push(`INSERT INTO subscriptions (${cols.join(',')}) VALUES (${vals.join(',')});`);

    for (const k of api_keys) {
      stmts.push(`INSERT INTO subscription_api_keys (id, subscription_id, key_name, key_value) VALUES (${sqlLiteral(helpers.generateUUIDv4())}, ${sqlLiteral(normalized.id)}, ${sqlLiteral(k.key_name)}, ${sqlLiteral(k.key_value)});`);
    }
    for (const e of prev_emails) {
      stmts.push(`INSERT INTO subscription_previous_accountemails (id, subscription_id, email) VALUES (${sqlLiteral(helpers.generateUUIDv4())}, ${sqlLiteral(normalized.id)}, ${sqlLiteral(e.email)});`);
    }
    for (const p of prev_promos) {
      stmts.push(`INSERT INTO subscription_previous_promocodes (id, subscription_id, promo_code) VALUES (${sqlLiteral(helpers.generateUUIDv4())}, ${sqlLiteral(normalized.id)}, ${sqlLiteral(p.promo_code)});`);
    }
  }

  return stmts.join('\n');
}

function main() {
  const argv = process.argv.slice(2);
  const doTruncate = argv.includes('--truncate');
  const dryRun = argv.includes('--dry-run');

  const raw = readJson();
  const normalizedRecords = raw.map((rec) => helpers.normalizeRecord(rec));
  const sql = buildSQL(normalizedRecords);
  const header = [
    'BEGIN;',
    doTruncate ? 'TRUNCATE subscription_api_keys, subscription_previous_promocodes, subscription_previous_accountemails, subscription_alternatives, subscription_tags, subscriptions RESTART IDENTITY CASCADE;' : '-- no truncate',
    sql,
    'COMMIT;'
  ].join('\n');

  const outPath = path.resolve(process.cwd(), 'scripts', 'import-to-sandbox.sql');
  fs.writeFileSync(outPath, header, 'utf-8');
  console.log(`SQL written to: ${outPath}`);
  if (dryRun) {
    console.log('Dry-run: SQL not executed. Paste into Studio SQL editor for the sandbox instance.');
    return;
  }
  console.log('For safety, please run the generated SQL in the sandbox Studio manually.');
}

if (require.main === module) {
  main();
}
