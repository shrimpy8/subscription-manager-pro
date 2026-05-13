const _url = process.env.NEXT_PUBLIC_SUPABASE_URL
if (!_url) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

export const SUPABASE_URL: string = _url
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
