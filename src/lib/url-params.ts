export function isUuidLike(id: string): boolean {
  return /^[a-zA-Z0-9_-]{6,64}$/.test(id)
}

export function coerceEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback
}

export function coerceNumber(value: unknown, fallback: number, opts: { min?: number; max?: number } = {}): number {
  const n = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : NaN
  if (!Number.isFinite(n)) return fallback
  if (opts.min !== undefined && n < opts.min) return opts.min
  if (opts.max !== undefined && n > opts.max) return opts.max
  return n
}


