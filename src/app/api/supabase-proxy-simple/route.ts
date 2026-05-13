import { NextRequest, NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase-config'

if (!SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint') || '/rest/v1/subscriptions'

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
