import { NextRequest, NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from '@/lib/supabase-config'

if (!SUPABASE_SERVICE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 })
    }

    const json = await request.json().catch(() => ({} as { value?: boolean }))
    const value = typeof json.value === 'boolean' ? json.value : undefined
    if (typeof value === 'undefined') {
      return NextResponse.json({ success: false, error: 'Body must include { value: boolean }' }, { status: 400 })
    }

    const url = `${SUPABASE_URL}/rest/v1/subscriptions?id=eq.${encodeURIComponent(id)}`
    const resp = await fetch(url, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY!,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY!}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ iam_using_it: value })
    })

    if (!resp.ok) {
      const errText = await resp.text()
      return NextResponse.json({ success: false, error: errText || 'Supabase update failed' }, { status: resp.status })
    }

    const data = await resp.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Using PATCH error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
