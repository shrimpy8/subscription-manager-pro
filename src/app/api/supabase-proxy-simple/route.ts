import { NextRequest, NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase-config'
import { assertWriteAllowed } from '@/lib/api-guard'

if (!SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Must mirror the allowlist in supabase-proxy/route.ts — SSRF prevention
const ALLOWED_ENDPOINTS = [
  '/rest/v1/subscriptions',
] as const

const ALLOWED_METHODS = new Set(['GET', 'POST', 'PATCH', 'DELETE'])

// Disallowed query param keys that reference other tables or RPC calls
const DISALLOWED_QUERY_PATTERNS = /\b(rpc|from|join|table)\b/i

function isAllowedEndpoint(endpoint: string): boolean {
  // Exact match only — no subpath traversal
  return ALLOWED_ENDPOINTS.some((allowed) => endpoint === allowed)
}

function isAllowedQuery(query: string): boolean {
  return !DISALLOWED_QUERY_PATTERNS.test(query)
}

export async function POST(request: NextRequest) {
  if (!ALLOWED_METHODS.has('POST')) {
    return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 })
  }
  const guard = assertWriteAllowed(request, 'POST');
  if (guard) return guard;

  try {
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint') || '/rest/v1/subscriptions'

    if (!isAllowedEndpoint(endpoint)) {
      return NextResponse.json(
        { success: false, error: 'Endpoint not allowed' },
        { status: 403 }
      )
    }

    // Reject query params that reference other tables or RPC
    const queryParam = searchParams.get('query') || ''
    if (queryParam && !isAllowedQuery(queryParam)) {
      return NextResponse.json({ success: false, error: 'Query not allowed' }, { status: 403 })
    }

    const url = `${SUPABASE_URL}${endpoint}`

    const body = await request.text()
    if (process.env.NODE_ENV === 'development') {
      console.log('Simple proxy received body length:', body.length)
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY!}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: body
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { success: false, error: `Supabase request failed: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('Simple proxy error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
