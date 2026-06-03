# CLAUDE.md — subscription-manager-pro

## Stack
- Next.js 14 App Router, TypeScript strict mode
- Supabase (Postgres + auth)
- Zod (input validation)
- Radix UI + shadcn/ui + Tailwind
- React Hook Form
- In-memory mock store (`src/lib/subscription-store.ts`) for dev/demo

## Commands
```bash
npm run dev        # start dev server (Turbopack)
npm run build      # type-check + build — run before marking done
npm run lint       # eslint
npx tsc --noEmit   # type check only
```

## Project Structure
```
src/
  app/
    api/           # Route handlers — each folder = one endpoint
      supabase-proxy/         # forwards to Supabase REST; has endpoint allowlist
      supabase-proxy-simple/  # lightweight proxy variant
      subscriptions/          # CRUD + export
      import-subscriptions/   # bulk import with per-item Zod validation
      ai-tools/               # service-role endpoints
  lib/
    supabase-config.ts        # SINGLE SOURCE for all Supabase env vars — import from here only
    subscription-store.ts     # shared in-memory mock store — import from here only
    subscription-persistence.ts  # CSV export logic
    api-helpers.ts            # resolveFaviconUrl(), generateRequestId()
    supabase.ts               # Supabase client factory
    supabase-production.ts    # production health/config checks
```

## Security Invariants (non-negotiable)

### Env var config — shared module, never inline
- All Supabase env vars are read **once** in `src/lib/supabase-config.ts` and exported as typed values
- `SUPABASE_URL` exported as `string` (fail-fast throw at module load if missing)
- `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_KEY` exported as `string | undefined`; consuming files must throw if their required key is `undefined`
- **Never** call `process.env.NEXT_PUBLIC_SUPABASE_URL` (or any Supabase var) outside `supabase-config.ts` — you will create an independent copy that drifts silently

### Supabase proxy — endpoint allowlist required
- Both proxy routes (`supabase-proxy` and `supabase-proxy-simple`) enforce `ALLOWED_ENDPOINTS`
- Any URL not on the allowlist → 403 before forwarding — this prevents SSRF
- When adding a new Supabase table route, add it to `ALLOWED_ENDPOINTS` in both proxy files

### In-memory store — single module
- All route handlers share the same store via `src/lib/subscription-store.ts`
- **Never** declare a local `subscriptions` array inside a route file — it won't be visible to other handlers and state will diverge silently between requests

### Body size enforcement
- Use `request.text()` + `.length` check before `JSON.parse()` in all POST/PUT handlers
- `Content-Length` is optional in HTTP — never use it as the size guard
- Limit: 10 MB (`10 * 1024 * 1024` bytes); return 413 if exceeded

### Bulk import — per-item Zod validation
- `import-subscriptions` validates every item in the batch with `subscriptionCreateSchema.safeParse()`
- Reject items that fail; do not silently skip or coerce — return which items failed and why

### Error responses — never leak internals
- Never include `error.message` or stack traces in API responses sent to the client
- Use a generic message: `"An error occurred"` or a domain-specific code string
- Logging the full error server-side is fine; surfacing it in the response is not

### Dev-only logging
- Console logs of request bodies, Supabase keys, or internal state must be guarded by `if (process.env.NODE_ENV === 'development')`

## TypeScript Patterns

### Env var narrowing
Module-level `if (!x) throw` does **not** narrow `x` inside function bodies defined later in the same file. Use one of:
- Temp-var pattern (preferred for exports): `const _url = process.env.X; if (!_url) throw ...; export const URL: string = _url`
- Non-null assertion in consumers: `SUPABASE_ANON_KEY!` — safe only when the consuming file's module-level throw guarantees the key is set

### Type imports
When a type is only used as a type annotation, use `import type` to avoid accidental runtime coupling.

## CSV Export
- Double-quote escaping: `.replace(/"/g, '""')` must be followed by newline escaping: `.replace(/\n/g, '\\n').replace(/\r/g, '\\r')`
- Logic lives in `subscription-persistence.ts` — do not inline CSV generation in route handlers

## String Utilities
- Use `String.prototype.substring(start, end)` — **not** `substr(start, length)` which is deprecated
- `generateRequestId()` and `generateId()` in `api-helpers.ts` / `utils.ts` use `substring` — keep it that way

## Quality Gates (Before Commit)
- `npm run build` passes (catches type errors)
- `npm run lint` passes
- No `process.env` calls for Supabase vars outside `supabase-config.ts`
- No local state arrays inside route handlers (use subscription-store)
- No `error.message` in API responses
- Body size check present in all POST/PUT handlers

## Security Patterns Learned (2026-06-03)

### 1. Origin/Referer guard must not allow bare requests
`assertWriteAllowed()` must treat requests with **neither** `Origin` nor `Referer` as unauthorized when `SUBSCRIPTION_API_TOKEN` is not configured — return 403 immediately. Bare requests are not same-origin browser requests; they are unauthenticated API calls from curl, scripts, or server-to-server callers. The only safe exception: token IS configured AND the request carries a valid `Authorization: Bearer <token>`. Anything else is rejected.

### 2. Proxy allowlists use exact path match, not `startsWith`
`endpoint.startsWith('/rest/v1/subscriptions')` silently permits `/rest/v1/subscriptions_backup`, `/rest/v1/subscriptions/rogue`, and any other path sharing that prefix. Use `endpoint === '/rest/v1/subscriptions'` (or `ALLOWED_ENDPOINTS.includes(endpoint)`). Additionally: restrict the set of allowed HTTP methods explicitly, and reject query params matching an `DISALLOWED_QUERY_PATTERNS` regex (`rpc`, `from`, `join`, `table`) to block RPC calls and cross-table references through the proxy.

### 3. Persistence-first ordering for dual-store writes
When a mutation must update both a remote store (Supabase) and an in-memory local store, **always write to the remote store first**. If the remote write fails, return HTTP 500 — do **not** update the local store. Writing local first and then logging-but-swallowing Supabase errors returns success to the client for a partially-failed operation, leaving two sources of truth silently out of sync.

### 4. Body size caps must use byte length, not string length
`raw.length` counts JavaScript string code units (UTF-16), not encoded bytes. For a 1 MB byte cap, use `Buffer.byteLength(raw, 'utf8')` before comparing against `MAX_IMPORT_BODY_BYTES`. A string with multi-byte UTF-8 characters can have a smaller `.length` than its actual byte size, so a JS-length check can allow payloads that exceed the intended byte limit.

### 5. Zod validation must run before filtering, not after
If a CSV `tags` field is split and `.filter(Boolean)` is applied before passing to Zod, empty entries are silently dropped instead of triggering `.min(1)`. Remove pre-validation filters — let Zod constraints catch invalid values and return a proper validation error. Example: `"tag1,,tag2".split(',')` → trim each segment → pass the raw array (including `""`) into Zod; `z.string().min(1)` then rejects the empty entry explicitly.

### 6. GET endpoints that return sensitive data need the same auth guard as mutations
Export, debug API routes, and any read endpoint returning stored user data must be protected by the same origin/token guard as write endpoints. The only adjustment for GET/HEAD: skip the `Content-Type: application/json` requirement (browsers don't send it for non-body requests). Do not skip the Origin/Referer/token check itself.

### 7. Debug pages must be gated by `NODE_ENV !== 'development'`
Any Next.js page or route that exists only for development debugging must call `notFound()` at the top of the default export component when `process.env.NODE_ENV !== 'development'`. Never ship pages that inspect localStorage, Supabase connectivity, or internal state to production builds. Add a shared `isDevelopmentRouteEnabled()` helper so future debug pages use the same gate consistently.
