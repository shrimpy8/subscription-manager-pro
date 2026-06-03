import { NextRequest, NextResponse } from 'next/server'

export function middleware(_request: NextRequest) {
  const response = NextResponse.next()

  // Core security headers (client-only phase)
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  // Limit powerful features by default; expand as needed
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  )
  // HSTS (effective on HTTPS in production)
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

  // Content Security Policy (env-guarded; conservative but functional)
  const isDev = process.env.NODE_ENV !== 'production'
  // Development allows unsafe-inline + unsafe-eval for hot-reload and dev tools.
  // Production drops unsafe-inline from script-src; unsafe-inline in style-src is kept
  // because Next.js SSR injects critical CSS via inline <style> tags at runtime.
  const scriptSrc = isDev ? "'self' 'unsafe-inline' 'unsafe-eval'" : "'self'"
  const connectSrc = isDev ? "'self' http://127.0.0.1:55421 http://localhost:55421 http://10.0.0.57:55421" : "'self'"
  const cspDirectives = [
    "default-src 'self'",
    "img-src 'self' data: https: https://www.google.com/s2",
    // unsafe-inline required for Next.js SSR inline critical styles
    "style-src 'self' 'unsafe-inline'",
    `script-src ${scriptSrc}`,
    `connect-src ${connectSrc}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ]
  if (!isDev) {
    cspDirectives.push("upgrade-insecure-requests")
  }
  const csp = cspDirectives.join('; ')
  response.headers.set('Content-Security-Policy', csp)

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}


