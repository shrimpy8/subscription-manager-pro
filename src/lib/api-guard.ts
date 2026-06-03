import { NextRequest, NextResponse } from 'next/server'

/**
 * assertWriteAllowed — CSRF / same-origin guard for mutating API endpoints.
 *
 * Checks:
 * 1. Origin or Referer host must match the request host (same-origin enforcement).
 * 2. Non-DELETE requests must declare Content-Type: application/json.
 * 3. If SUBSCRIPTION_API_TOKEN env var is set, requires Authorization: Bearer <token>.
 *
 * Returns a 403 NextResponse to short-circuit the handler, or null to allow the request.
 */
export function assertWriteAllowed(request: NextRequest, method?: string): NextResponse | null {
  const requestMethod = method ?? request.method

  // --- 1. Same-origin check via Origin or Referer ---
  const host = request.headers.get('host')
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  const requiredTokenForOriginBypass = process.env.SUBSCRIPTION_API_TOKEN

  if (origin) {
    try {
      const originHost = new URL(origin).host
      if (originHost !== host) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    } catch {
      // Malformed Origin header
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  } else if (referer) {
    try {
      const refererHost = new URL(referer).host
      if (refererHost !== host) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    } catch {
      // Malformed Referer header
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  } else {
    // Neither Origin nor Referer present.
    // Allow only when a token is configured AND the request provides a valid Bearer token —
    // this permits authenticated server-to-server calls while blocking bare cross-origin requests.
    if (!requiredTokenForOriginBypass) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const authHeader = request.headers.get('authorization') ?? ''
    const providedToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    if (providedToken !== requiredTokenForOriginBypass) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  // --- 2. Content-Type check for mutating non-DELETE requests ---
  // GET and HEAD requests carry no body, so Content-Type is irrelevant.
  // DELETE requests also typically have no body.
  if (requestMethod !== 'DELETE' && requestMethod !== 'GET' && requestMethod !== 'HEAD') {
    const contentType = request.headers.get('content-type') ?? ''
    if (!contentType.startsWith('application/json')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  // --- 3. Optional bearer token check ---
  const requiredToken = process.env.SUBSCRIPTION_API_TOKEN
  if (requiredToken) {
    const authHeader = request.headers.get('authorization') ?? ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    if (token !== requiredToken) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  return null
}
