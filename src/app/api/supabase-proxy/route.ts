import { NextRequest, NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase-config'

if (!SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

const ALLOWED_ENDPOINTS = [
  '/rest/v1/subscriptions',
] as const

const ALLOWED_METHODS = new Set(['GET', 'POST', 'PATCH', 'DELETE'])

// Disallowed query param keys that reference other tables or RPC calls
const DISALLOWED_QUERY_PATTERNS = /\b(rpc|from|join|table)\b/i

function isAllowedEndpoint(endpoint: string): boolean {
  // Exact match only — no subpath traversal (e.g. /rest/v1/subscriptions/other_table blocked)
  return ALLOWED_ENDPOINTS.some((allowed) => endpoint === allowed)
}

function isAllowedQuery(query: string): boolean {
  // Reject query strings that reference RPC calls or other tables
  return !DISALLOWED_QUERY_PATTERNS.test(query)
}

export async function GET(request: NextRequest) {
  if (!ALLOWED_METHODS.has('GET')) {
    return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 })
  }
  try {
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint') || '/rest/v1/subscriptions'

    if (!isAllowedEndpoint(endpoint)) {
      return NextResponse.json(
        { success: false, error: 'Endpoint not allowed' },
        { status: 403 }
      )
    }

    const query = searchParams.get('query') || 'select=id&limit=1'
    if (!isAllowedQuery(query)) {
      return NextResponse.json({ success: false, error: 'Query not allowed' }, { status: 403 })
    }
    const url = `${SUPABASE_URL}${endpoint}?${query}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY!}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
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
    console.error('Supabase proxy error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint') || '/rest/v1/subscriptions'

    if (!isAllowedEndpoint(endpoint)) {
      return NextResponse.json(
        { success: false, error: 'Endpoint not allowed' },
        { status: 403 }
      )
    }

    const url = `${SUPABASE_URL}${endpoint}`

    const body = await request.text()
    if (process.env.NODE_ENV === 'development') {
      console.log('Proxy received body length:', body.length)
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

    // Handle empty responses
    let data = null
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text()
      if (text.trim()) {
        data = JSON.parse(text)
      }
    }
    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('Supabase proxy error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  if (!ALLOWED_METHODS.has('DELETE')) {
    return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 })
  }
  try {
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint') || '/rest/v1/subscriptions'

    if (!isAllowedEndpoint(endpoint)) {
      return NextResponse.json(
        { success: false, error: 'Endpoint not allowed' },
        { status: 403 }
      )
    }

    const query = searchParams.get('query') || 'select=id&limit=1'
    if (!isAllowedQuery(query)) {
      return NextResponse.json({ success: false, error: 'Query not allowed' }, { status: 403 })
    }
    const url = `${SUPABASE_URL}${endpoint}?${query}`

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY!}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { success: false, error: `Supabase request failed: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    // Handle empty responses (common with DELETE operations)
    let data = null
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text()
      if (text.trim()) {
        data = JSON.parse(text)
      }
    }
    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('Supabase proxy error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  if (!ALLOWED_METHODS.has('PATCH')) {
    return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 })
  }
  try {
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint') || '/rest/v1/subscriptions'

    if (!isAllowedEndpoint(endpoint)) {
      return NextResponse.json(
        { success: false, error: 'Endpoint not allowed' },
        { status: 403 }
      )
    }

    const query = searchParams.get('query') || ''
    if (query && !isAllowedQuery(query)) {
      return NextResponse.json({ success: false, error: 'Query not allowed' }, { status: 403 })
    }
    const url = `${SUPABASE_URL}${endpoint}${query ? `?${query}` : ''}`

    const body = await request.text()

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY!}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Prefer': 'return=representation'
      },
      body
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { success: false, error: `Supabase request failed: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const contentType = response.headers.get('content-type')
    const data = contentType && contentType.includes('application/json') ? await response.json() : null
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Supabase proxy PATCH error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
