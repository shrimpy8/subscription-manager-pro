import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:55421'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 })
    }

    const json = await request.json().catch(() => ({} as Record<string, unknown>))
    const value = typeof json.value === 'boolean' ? json.value : undefined
    if (typeof value === 'undefined') {
      return NextResponse.json({ success: false, error: 'Body must include { value: boolean }' }, { status: 400 })
    }

    // value=false => subscribed; value=true => not subscribed
    const url = `${SUPABASE_URL}/rest/v1/subscriptions?id=eq.${encodeURIComponent(id)}`
    const resp = await fetch(url, {
      method: 'PATCH',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ no_subscription: value })
    })

    if (!resp.ok) {
      const errText = await resp.text()
      return NextResponse.json({ success: false, error: errText || 'Supabase update failed' }, { status: resp.status })
    }

    const data = await resp.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}


