# Sandbox Import: Application/UI Impact Analysis

Date: 2025-10-07

## Scope
We imported `public/toolsSubscription2.json` into an isolated local Supabase sandbox using normalized mappings and relationship tables. This document captures application/UI impact and recommended follow-ups.

## What changed (DB)
- `subscriptions` populated with 73 rows; relationship tables populated as present in JSON:
  - `subscription_api_keys` (21 rows)
  - `subscription_previous_accountemails` (2 rows)
  - `subscription_previous_promocodes` (11 rows)
- New boolean flags in `subscriptions` are in use:
  - `iam_using_it`, `no_subscription`, `not_in_a16z`

## App/UI impact
### No breaking changes
- UI does not currently rely on promo fields (removed), or the new flags; build is clean.
- Existing pages render from local storage or API as before; sandbox DB is isolated.

### Optional UI enhancements (follow-up)
- Filters/toggles for the new flags:
  - “Show tools I’m using” (`iam_using_it=true`)
  - “Exclude non-subscribed tools” (`no_subscription=false`)
  - “Hide non-a16z tools” (`not_in_a16z=false`)
- Display badge/pill indicators for the flags on cards/rows.
- Import button/flow (admin-only) to run importer in-app or via CLI.

### Data normalization assumptions
- `status`, `usage_frequency`, `usage_importance` lowercased to match enums.
- `china_region_only` coerced to boolean.
- `start_date`/`renewal_date` fallback to DB defaults when null.
- JSON `id` replaced by generated UUID v4 for DB primary keys.

## Developer impact
- Scripts added:
  - `scripts/import-dry-run.js` — normalization + validation (no writes).
  - `scripts/import-to-sandbox.js` — generates SQL to import into sandbox.
  - Output SQL: `scripts/import-to-sandbox.sql` (safe to run in Studio).
- Local sandbox lives at `supabase-sandbox/supabase/` with isolated ports.

## Risks and mitigations
- Risk: Divergent data defaults between JSON and DB (dates, booleans).
  - Mitigation: Explicit normalization; document defaults.
- Risk: Duplicate rows if importer is re-run without truncate.
  - Mitigation: Use `--truncate` option; future enhancement: upsert by (name,url).

## Links
- Import plan and tooling: HH2-189
- Schema alignment checklist: HH2-190
- Sandbox setup: HH2-191


