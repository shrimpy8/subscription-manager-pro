# Code Review: Issue Fixes

> Auto-generated code review. Each issue includes a surgical fix for Sonnet to apply.
> Fixes are ordered by severity: Critical > High > Medium > Low.

## Summary
- Critical: 5
- High: 4
- Medium: 5
- Low: 3
- Total: 17

---

## Critical Issues

### C-1: Hardcoded Supabase Anon Key in Simple Proxy
**File:** `src/app/api/supabase-proxy-simple/route.ts` (line 4)
**Problem:** The Supabase anon key is hardcoded as a string literal instead of reading from environment variables. If credentials are rotated, this file will silently use the old key.
**Fix:**
```typescript
// OLD (line 4)
const SUPABASE_ANON_KEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'

// NEW
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}
```
**Why:** Hardcoded credentials bypass credential rotation. The `CREDENTIAL_ROTATION_GUIDE.md` in docs even documents rotation procedures, but this file would break the process.

---

### C-2: Hardcoded Fallback Credentials in Supabase Proxy
**File:** `src/app/api/supabase-proxy/route.ts` (lines 3-4)
**Problem:** Both `SUPABASE_URL` and `SUPABASE_ANON_KEY` have hardcoded fallback values using `||`. If env vars are accidentally unset in production, the app silently falls back to local dev credentials instead of failing fast.
**Fix:**
```typescript
// OLD (lines 3-4)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:55421'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'

// NEW
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing required Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY')
}
```
**Why:** Silent fallback to dev credentials in production is a data-leak risk. Fail-fast is the correct behavior for missing config.

---

### C-3: Service Role Key Falls Back to Empty String
**File:** `src/app/api/ai-tools/[id]/subscribe/route.ts` (lines 4-5) and `src/app/api/ai-tools/[id]/using/route.ts` (lines 4-5)
**Problem:** `SERVICE_KEY` falls back to `''` when the env var is missing. This sends requests to Supabase with an empty Bearer token, which depending on Supabase RLS config may either fail silently or bypass row-level security. The URL also has a hardcoded fallback.
**Fix (apply to BOTH files):**
```typescript
// OLD (lines 4-5)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:55421'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// NEW
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
}
```
**Why:** Service role keys have elevated privileges. An empty key silently degrades auth guarantees rather than failing fast.

---

### C-4: Supabase Proxy is an Open Relay
**File:** `src/app/api/supabase-proxy/route.ts` (lines 6-180)
**Problem:** The proxy accepts an arbitrary `endpoint` query parameter and forwards it to Supabase with the anon key. Any client can call any Supabase REST endpoint (including admin functions, RPC calls, etc.) through this proxy. There is no allowlist of permitted endpoints.
**Fix:**
```typescript
// NEW — add at the top of the file, after the env var declarations
const ALLOWED_ENDPOINTS = [
  '/rest/v1/subscriptions',
] as const

function isAllowedEndpoint(endpoint: string): boolean {
  return ALLOWED_ENDPOINTS.some(allowed => endpoint.startsWith(allowed))
}

// Then add this check at the start of each handler (GET, POST, DELETE, PATCH):
// Example for GET (line 8, after getting endpoint):
const endpoint = searchParams.get('endpoint') || '/rest/v1/subscriptions'
if (!isAllowedEndpoint(endpoint)) {
  return NextResponse.json(
    { success: false, error: 'Endpoint not allowed' },
    { status: 403 }
  )
}
```
**Why:** Without an allowlist, the proxy acts as a server-side request forgery (SSRF) vector. An attacker can probe internal Supabase endpoints, call RPC functions, or access tables they shouldn't.

---

### C-5: Server-Side Route Uses Relative Fetch URL
**File:** `src/app/api/subscriptions/route.ts` (line 151)
**Problem:** The POST handler calls `fetch('/api/supabase-proxy?endpoint=...')` — a relative URL. In a server-side Next.js API route, there is no browser origin to resolve against. This either fails silently or hits localhost in unexpected ways during SSR/serverless deployment.
**Fix:**
```typescript
// OLD (line 151)
const response = await fetch('/api/supabase-proxy?endpoint=/rest/v1/subscriptions', {

// NEW — add at top of file
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Then update line 151:
const response = await fetch(`${APP_URL}/api/supabase-proxy?endpoint=/rest/v1/subscriptions`, {
```
Note: Also add `NEXT_PUBLIC_APP_URL` to `.env.example`:
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
**Why:** Relative fetch URLs in server-side code are undefined behavior in Node.js and will break in production deployments (Vercel, Docker, etc.).

---

## High Issues

### H-1: Isolated In-Memory Mock Data Stores
**File:** `src/app/api/subscriptions/[id]/route.ts` (line 8), `src/app/api/subscriptions/[id]/actions/route.ts` (line 12), `src/app/api/subscriptions/export/route.ts` (line 5)
**Problem:** Each route file declares its own `const subscriptions: Subscription[] = []`. These are completely independent arrays — a subscription created via POST in `route.ts` won't appear in GET `/[id]`, export, or actions. The main `route.ts` imports `sampleSubscriptions` but the others start empty.
**Fix:**
Create a shared data module:
```typescript
// NEW FILE: src/lib/subscription-store.ts
import { Subscription } from '@/types/subscription';
import { sampleSubscriptions } from '@/lib/sample-data';

let subscriptions: Subscription[] = [...sampleSubscriptions];

export function getSubscriptions(): Subscription[] {
  return subscriptions;
}

export function setSubscriptions(subs: Subscription[]): void {
  subscriptions = subs;
}

export function findSubscription(id: string): Subscription | undefined {
  return subscriptions.find(sub => sub.id === id);
}

export function findSubscriptionIndex(id: string): number {
  return subscriptions.findIndex(sub => sub.id === id);
}

export function addSubscription(sub: Subscription): void {
  subscriptions.push(sub);
}

export function removeSubscription(index: number): Subscription {
  return subscriptions.splice(index, 1)[0];
}

export function updateSubscription(index: number, sub: Subscription): void {
  subscriptions[index] = sub;
}
```
Then update each route file to import from `@/lib/subscription-store` instead of declaring local arrays:
```typescript
// In each route file, REMOVE:
const subscriptions: Subscription[] = [];
// Or:
let subscriptions: Subscription[] = [...sampleSubscriptions];

// REPLACE with:
import { getSubscriptions, findSubscription, findSubscriptionIndex, addSubscription, removeSubscription, updateSubscription, setSubscriptions } from '@/lib/subscription-store';
```
And update each handler to use the imported functions instead of direct array access.
**Why:** The current architecture means GET, PUT, DELETE, export, and actions all operate on different empty arrays. No CRUD operation works end-to-end through the API.

---

### H-2: Import Endpoint Has No Per-Item Validation
**File:** `src/app/api/import-subscriptions/route.ts` (lines 18-66)
**Problem:** The import endpoint accepts an unbounded array of subscriptions with no schema validation on individual items. It trusts `sub.cost`, `sub.status`, `sub.billing_cycle` etc. without validating against the Zod schema used everywhere else. Malformed data (negative cost, invalid status, XSS in name) goes straight to the database.
**Fix:**
```typescript
// OLD (line 19-21) — add validation inside the loop
for (const sub of subscriptions) {
  try {
    // Transform CSV data to Subscription format

// NEW
import { subscriptionCreateSchema } from '@/lib/validation/schemas';

// Add near line 8, after the Array.isArray check:
const MAX_IMPORT_SIZE = 500;
if (subscriptions.length > MAX_IMPORT_SIZE) {
  return NextResponse.json(
    { success: false, error: `Import limited to ${MAX_IMPORT_SIZE} subscriptions at a time` },
    { status: 400 }
  );
}

// Then inside the loop, add validation before creating subscription (after line 21):
    const validation = subscriptionCreateSchema.safeParse({
      name: sub.name || 'Unknown',
      category: sub.category || 'Other',
      cost: parseFloat(sub.cost) || 0,
      billing_cycle: sub.billing_cycle || 'Monthly',
      status: sub.status || 'active',
      usage_importance: sub.usage_importance || 'medium',
      usage_frequency: sub.usage_frequency || 'monthly',
    });
    if (!validation.success) {
      errors.push(`Validation failed for ${sub.name}: ${validation.error.issues[0]?.message}`);
      continue;
    }
```
**Why:** Unvalidated bulk import is a common injection vector. The individual subscription POST endpoint validates with Zod, but the import endpoint bypasses it entirely.

---

### H-3: Request Body Logged in Proxy Routes
**File:** `src/app/api/supabase-proxy/route.ts` (line 53), `src/app/api/supabase-proxy-simple/route.ts` (line 15), `src/app/api/subscriptions/route.ts` (line 149)
**Problem:** `console.log('Proxy received body:', body)` logs the full request body, which may contain subscription data including `account_email`, `secret_key`, `api_access_keys`, and `promo_code` fields. In production, these logs persist and are visible to anyone with log access.
**Fix:**
```typescript
// OLD — in supabase-proxy/route.ts line 53
console.log('Proxy received body:', body)

// NEW
// Remove the line entirely, or if debug logging is needed:
if (process.env.NODE_ENV === 'development') {
  console.log('Proxy received body length:', body.length)
}
```
Apply the same pattern to:
- `src/app/api/supabase-proxy-simple/route.ts` line 15
- `src/app/api/subscriptions/route.ts` lines 149, 159, 168
**Why:** Logging request bodies violates the principle of never logging PII/secrets. The subscription model includes fields like `secret_key`, `api_access_keys`, and `account_email`.

---

### H-4: Internal Error Details Leaked to Client
**File:** `src/app/api/subscriptions/route.ts` (line 179), `src/app/api/supabase-proxy/route.ts` (line 38), and multiple other route files
**Problem:** Error messages include `error instanceof Error ? error.message : 'Unknown error'` which leaks internal error details (stack traces, Supabase error messages, network errors) to API clients.
**Fix:**
```typescript
// OLD (example from subscriptions/route.ts line 175-183)
    } catch (dbError) {
      console.error('Database save error:', JSON.stringify(dbError, null, 2));
      return createErrorResponse(
        'api_error',
        'database_save_failed',
        `Failed to save subscription to database: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`,
        undefined,
        requestId,
        500
      );
    }

// NEW
    } catch (dbError) {
      console.error('Database save error:', dbError);
      return createErrorResponse(
        'api_error',
        'database_save_failed',
        'Failed to save subscription to database',
        undefined,
        requestId,
        500
      );
    }
```
Apply the same pattern (remove `error.message` from client-facing responses) in:
- `src/app/api/supabase-proxy/route.ts` lines 38, 88, 135, 177
- `src/app/api/supabase-proxy-simple/route.ts` line 43
- `src/app/api/ai-tools/[id]/subscribe/route.ts` line 41
- `src/app/api/ai-tools/[id]/using/route.ts` line 41
- `src/app/api/import-subscriptions/route.ts` line 77
**Why:** Internal error messages can reveal database schema, connection strings, or internal service names to attackers.

---

## Medium Issues

### M-1: DRY Violation — Favicon Logic Duplicated
**File:** `src/app/api/subscriptions/route.ts` (lines 89-97) and `src/app/api/subscriptions/[id]/route.ts` (lines 81-89)
**Problem:** The exact same favicon URL generation logic is copy-pasted in both the POST (create) and PUT (update) handlers.
**Fix:**
```typescript
// NEW — add to src/lib/api-helpers.ts
export function resolveFaviconUrl(category: string, url?: string, existingLogo?: string): string {
  if (existingLogo) return existingLogo;
  if (category === 'AI Tools' && url) {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return '';
    }
  }
  return '';
}
```
Then in both route files, replace the duplicated block with:
```typescript
const logo = resolveFaviconUrl(body.category, body.url, body.logo);
```
**Why:** Duplicated logic drifts over time. If the favicon provider URL changes, two files need updating instead of one.

---

### M-2: DRY Violation — Supabase Config Repeated Across 4 Files
**File:** `src/app/api/supabase-proxy/route.ts`, `src/app/api/supabase-proxy-simple/route.ts`, `src/app/api/ai-tools/[id]/subscribe/route.ts`, `src/app/api/ai-tools/[id]/using/route.ts`
**Problem:** Each file independently declares `SUPABASE_URL` and key constants. Some have different fallback values (port 55421 vs 54321), creating inconsistency.
**Fix:**
```typescript
// NEW FILE: src/lib/supabase-config.ts
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}
```
Then replace the local declarations in all 4 files with:
```typescript
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY } from '@/lib/supabase-config'
```
**Why:** Different fallback ports (55421 vs 54321) across files suggest copy-paste drift. A single source of truth prevents config inconsistency.

---

### M-3: Deprecated `substr` Usage
**File:** `src/lib/api-helpers.ts` (line 8), `src/app/api/import-subscriptions/route.ts` (line 23)
**Problem:** `Math.random().toString(36).substr(2, 9)` uses the deprecated `String.prototype.substr()` method.
**Fix:**
```typescript
// OLD
Math.random().toString(36).substr(2, 9)

// NEW
Math.random().toString(36).substring(2, 11)
```
Apply to both files.
**Why:** `substr` is deprecated in the ECMAScript spec. `substring` is the standard replacement. Note: `substring(2, 11)` produces the same 9-character result as `substr(2, 9)`.

---

### M-4: CSV Export Doesn't Escape Newlines
**File:** `src/app/api/subscriptions/export/route.ts` (line 63) and `src/lib/subscription-persistence.ts` (line 277)
**Problem:** The CSV generation escapes double quotes (`""`) but doesn't escape newline characters within fields. A subscription with a multi-line description or notes field will break CSV row boundaries.
**Fix:**
```typescript
// OLD (both files, in the map function)
.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))

// NEW
.map(row => row.map(field => `"${String(field).replace(/"/g, '""').replace(/\n/g, '\\n').replace(/\r/g, '\\r')}"`).join(','))
```
**Why:** Multi-line content in CSV fields without proper escaping produces malformed CSV that breaks parsers and downstream imports.

---

### M-5: `testSupabaseConnection` Has Excessive Logging
**File:** `src/lib/supabase.ts` (lines 52-101)
**Problem:** The test function logs URL, key presence, environment, response status, response data, and multiple error states. In production this creates noise and in some cases may log sensitive connection details.
**Fix:**
```typescript
// OLD (lines 54-57)
    console.log('Testing Supabase connection...')
    console.log('URL:', supabaseUrl)
    console.log('Key:', supabaseAnonKey ? 'Present' : 'Missing')
    console.log('Environment:', typeof window !== 'undefined' ? 'Browser' : 'Server')

// NEW
    if (process.env.NODE_ENV === 'development') {
      console.log('Testing Supabase connection...')
    }
```
Also remove or guard these lines behind `NODE_ENV === 'development'`:
- Line 62: `console.log('Testing via server-side proxy...')`
- Line 70: `console.log('Proxy response status:', proxyResponse.status)`
- Line 71: `console.log('Proxy response ok:', proxyResponse.ok)`
- Line 80: `console.log('Proxy response data:', proxyData)`
- Line 83: `console.log('Proxy connection successful!')`
**Why:** Excessive logging in production creates noise and can expose infrastructure details.

---

## Low Issues

### L-1: Unused `ZodError` Import
**File:** `src/app/api/subscriptions/[id]/route.ts` (line 4)
**Problem:** `ZodError` is imported and caught at line 109, but this code path is unreachable because `safeParse` is used above (line 54) which never throws. The catch at line 108-114 is dead code.
**Fix:**
```typescript
// OLD (line 4)
import { ZodError } from 'zod';

// NEW — remove the import entirely
// (delete line 4)

// Also remove the dead catch block at lines 108-114:
// OLD
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(

// NEW
  } catch (error) {
    return NextResponse.json(
```
Also apply to `src/app/api/subscriptions/[id]/actions/route.ts` which has the same unused import at line 4 and dead catch at lines 98-103.
**Why:** Dead code creates confusion about error handling flow.

---

### L-2: `supabaseAdmin` Backward Compat Uses `null as any`
**File:** `src/lib/supabase.ts` (line 49)
**Problem:** `export const supabaseAdmin = typeof window === 'undefined' ? getSupabaseAdmin() : null as any` uses `any` type assertion which defeats TypeScript safety.
**Fix:**
```typescript
// OLD (line 49)
export const supabaseAdmin = typeof window === 'undefined' ? getSupabaseAdmin() : null as any

// NEW
export const supabaseAdmin: ReturnType<typeof createClient> | null = typeof window === 'undefined' ? getSupabaseAdmin() : null
```
**Why:** `as any` hides type errors at call sites. A proper union type forces callers to null-check.

---

### L-3: DRY Violation — CSV Export Logic Duplicated
**File:** `src/app/api/subscriptions/export/route.ts` (lines 40-65) and `src/lib/subscription-persistence.ts` (lines 253-278)
**Problem:** The CSV generation logic (headers, row mapping, escaping) is duplicated between the API route and the client-side persistence module. They have slightly different header lists (API has 19 columns, persistence has 20 — persistence includes `a16z Rank`).
**Fix:**
```typescript
// In src/app/api/subscriptions/export/route.ts, replace the inline CSV logic with:
import { exportSubscriptionsToCSV } from '@/lib/subscription-persistence';

// Then in the GET handler, replace lines 18-65 with:
      const csvContent = exportSubscriptionsToCSV(subscriptions);
```
**Why:** Two CSV implementations with different column counts will produce inconsistent exports depending on whether the user exports from the API or the UI.

---

---

## Resolutions

All 17 issues fixed and validated via `npx tsc --noEmit` (0 errors). PR to be created from this branch.

### Critical Issues

| Issue | Status | Fix Summary |
|-------|--------|-------------|
| C-1 | ✅ Fixed | `supabase-proxy-simple/route.ts`: removed hardcoded anon key, reads from `SUPABASE_ANON_KEY` via shared `supabase-config.ts`; throws at module load if missing |
| C-2 | ✅ Fixed | `supabase-proxy/route.ts`: removed hardcoded URL/key fallbacks; imports from `supabase-config.ts`; throws if `SUPABASE_ANON_KEY` missing |
| C-3 | ✅ Fixed | Both `ai-tools/[id]/subscribe/route.ts` and `ai-tools/[id]/using/route.ts`: removed empty-string fallback for `SERVICE_KEY`; throws if `SUPABASE_SERVICE_ROLE_KEY` missing |
| C-4 | ✅ Fixed | `supabase-proxy/route.ts`: added `ALLOWED_ENDPOINTS` allowlist + `isAllowedEndpoint()` guard in all 4 handlers (GET/POST/DELETE/PATCH); returns 403 on unknown endpoints |
| C-5 | ✅ Fixed | `subscriptions/route.ts`: replaced relative `/api/supabase-proxy` with `${APP_URL}/api/supabase-proxy` where `APP_URL = process.env.NEXT_PUBLIC_APP_URL \|\| 'http://localhost:3000'` |

### High Issues

| Issue | Status | Fix Summary |
|-------|--------|-------------|
| H-1 | ✅ Fixed | Created `src/lib/subscription-store.ts` with `getSubscriptions`, `setSubscriptions`, `findSubscription`, `findSubscriptionIndex`, `addSubscription`, `removeSubscription`, `updateSubscription`; updated `subscriptions/route.ts`, `subscriptions/[id]/route.ts`, `subscriptions/[id]/actions/route.ts`, and `subscriptions/export/route.ts` to use the shared store |
| H-2 | ✅ Fixed | `import-subscriptions/route.ts`: added `MAX_IMPORT_SIZE = 500` early check; added `subscriptionCreateSchema.safeParse()` validation per item before processing |
| H-3 | ✅ Fixed | Removed `console.log('Proxy received body:', body)` and sibling body-logging statements from `supabase-proxy/route.ts`, `supabase-proxy-simple/route.ts`, and `subscriptions/route.ts`; dev-only logs now guarded with `process.env.NODE_ENV === 'development'` |
| H-4 | ✅ Fixed | Removed `error instanceof Error ? error.message : 'Unknown error'` from all client-facing `NextResponse` error bodies across: `supabase-proxy/route.ts`, `supabase-proxy-simple/route.ts`, `ai-tools/[id]/subscribe/route.ts`, `ai-tools/[id]/using/route.ts`, `subscriptions/route.ts` (database save error), and `import-subscriptions/route.ts` (outer catch); internal errors still logged to `console.error` |

### Medium Issues

| Issue | Status | Fix Summary |
|-------|--------|-------------|
| M-1 | ✅ Fixed | Added `resolveFaviconUrl(category, url?, existingLogo?)` to `src/lib/api-helpers.ts`; replaced duplicated favicon blocks in `subscriptions/route.ts` (POST) and `subscriptions/[id]/route.ts` (PUT) |
| M-2 | ✅ Fixed | Created `src/lib/supabase-config.ts` exporting `SUPABASE_URL` (typed `string`, throws if missing), `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_KEY`; all 4 proxy/ai-tools files now import from it |
| M-3 | ✅ Fixed | Replaced `.substr(2, 9)` with `.substring(2, 11)` in `src/lib/api-helpers.ts` (generateRequestId) and `src/app/api/import-subscriptions/route.ts` (id generation) |
| M-4 | ✅ Fixed | Added `.replace(/\n/g, '\\n').replace(/\r/g, '\\r')` to CSV field escaping in `src/lib/subscription-persistence.ts` (`exportSubscriptionsToCSV`) |
| M-5 | ✅ Fixed | Guarded all verbose `console.log` calls in `testSupabaseConnection` (`src/lib/supabase.ts`) with `process.env.NODE_ENV === 'development'` |

### Low Issues

| Issue | Status | Fix Summary |
|-------|--------|-------------|
| L-1 | ✅ Fixed | Removed unused `ZodError` import and the unreachable `catch (error) { if (error instanceof ZodError) {...} }` blocks from `subscriptions/[id]/route.ts` and `subscriptions/[id]/actions/route.ts` |
| L-2 | ✅ Fixed | `src/lib/supabase.ts` line 49: replaced `null as any` with `ReturnType<typeof createClient> \| null`; also added `!` non-null assertion where `supabaseUrl` is used inside `getSupabaseAdmin()` (line 42) |
| L-3 | ✅ Fixed | `subscriptions/export/route.ts`: replaced inline CSV generation with `exportSubscriptionsToCSV(subscriptions)` from `src/lib/subscription-persistence.ts`; both export paths now use a single implementation |

---

## Additional Fixes

Codebase scan after completing the 17 issues found sibling patterns in files not covered above.

### AF-1: Hardcoded Credentials in `supabase-production.ts`
**Files:** `src/lib/supabase-production.ts` (lines 172-173 and 207-209)
**Problem:** Same pattern as C-1/C-2 — `productionHealthCheck` used hardcoded localhost URL and publishable key fallbacks; `validateProductionConfig` used hardcoded URL, anon key, AND service role key fallbacks (all three credentials).
**Fix:**
- `productionHealthCheck`: reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from env; returns `{ status: 'unhealthy', error: 'Missing Supabase environment variables' }` immediately if either is absent instead of silently using hardcoded values
- `validateProductionConfig`: reads raw env vars without fallbacks; format checks remain unchanged (they already guarded with `if (process.env.X && ...)`)
**Status:** ✅ Fixed

### AF-2: Deprecated `.substr()` in `utils.ts`
**File:** `src/lib/utils.ts` (line 215)
**Problem:** `generateId()` used `.substr(2, 9)` — same pattern as M-3.
**Fix:** Changed to `.substring(2, 11)` to produce the same 9-character result.
**Status:** ✅ Fixed

---

## Repository Structure Observations

1. **Excessive debug/test pages in production routes:** The `src/app/` directory contains many debug/analysis pages that appear to be development artifacts and shouldn't ship to production:
   - `actual-form-fields-analysis/`, `check-localstorage/`, `column-name-mapping/`, `debug-localstorage/`, `field-conversion-analysis/`, `field-mapping-test/`, `form-database-mapping/`, `supabase-debug/`, `supabase-test/`, `test-page.tsx`, `test-simple/`, `ui-database-mapping/`, `updated-mapping-test/`
   - Consider moving these to a `__debug__/` directory excluded from production builds, or removing them entirely.

2. **Data processing scripts in `public/`:** The `public/` directory contains ~20 Python scripts (`add_nsfw_field.py`, `analyze_ai_tools.py`, `convert_to_snake_case.py`, etc.) and intermediate JSON files (`toolsSubscription2_before_array_modification.json`, etc.). These are development utilities that:
   - Are publicly accessible to anyone visiting the app
   - Bloat the production bundle
   - Should be moved to a `scripts/` or `tools/` directory outside `public/`

3. **Dual documentation directories:** Both `docs/` and `memory-bank/` contain project documentation with overlapping concerns. Consider consolidating into a single `docs/` directory.

4. **`project-docs/` directory:** Contains analysis documents (`security-analysis.md`, `error-handling-analysis.md`, etc.) that appear to be AI-generated review artifacts. These should either be in `docs/` or removed if outdated.

5. **Test files in `src/lib/`:** Files like `test-supabase.ts`, `test-supabase-data.ts`, `test-supabase-queries.ts`, `test-supabase-integration.ts`, `test-type-mapping.ts` should be in a `__tests__/` or `tests/` directory, not mixed with production library code.
