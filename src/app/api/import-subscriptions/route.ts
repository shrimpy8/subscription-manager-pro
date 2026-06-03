import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSubscription } from '@/lib/supabase-data';
import { assertWriteAllowed } from '@/lib/api-guard';

const MAX_IMPORT_SIZE = 500;
const MAX_IMPORT_BODY_BYTES = 1_000_000; // 1 MB — sufficient for CSV payloads

/**
 * Comprehensive per-row import schema.
 * - Validates all fields that will be persisted.
 * - Strips caller-provided `id` fields (server generates IDs).
 * - Rejects invalid URLs, emails, and dates.
 */
const subscriptionImportRowSchema = z.object({
  // id is intentionally omitted — server generates it
  name: z.string().min(1).max(200),
  category: z.union([
    z.literal('AI Tools'),
    z.literal('SaaS'),
    z.literal('Entertainment'),
    z.literal('Productivity'),
    z.literal('Utilities'),
    z.literal('Newsletter'),
    z.literal('Streaming Service'),
    z.literal('Online Learning'),
    z.literal('Magazine'),
    z.literal('Cloud Provider'),
    z.literal('Development Tools'),
    z.literal('Design Tools'),
    z.literal('Communication'),
    z.literal('Security'),
    z.literal('Other'),
  ]).default('Other'),
  subcategory: z.string().max(100).optional().default(''),
  plan: z.string().max(100).optional().default(''),
  cost: z.number().min(0).max(99999).default(0),
  currency: z.string().min(1).max(10).default('USD'),
  billing_cycle: z.enum(['Monthly', 'Yearly', 'Weekly', 'Quarterly', 'Free']).default('Monthly'),
  status: z.enum(['active', 'paused', 'canceled']).default('active'),
  start_date: z.string().optional().transform((val, ctx) => {
    if (!val) return undefined;
    const d = new Date(val);
    if (isNaN(d.getTime())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid start_date' });
      return z.NEVER;
    }
    return d;
  }),
  renewal_date: z.string().optional().transform((val, ctx) => {
    if (!val) return undefined;
    const d = new Date(val);
    if (isNaN(d.getTime())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid renewal_date' });
      return z.NEVER;
    }
    return d;
  }),
  url: z.string().max(2048).optional().default('').refine(
    (val) => val === '' || (() => { try { new URL(val); return true; } catch { return false; } })(),
    { message: 'Invalid URL' }
  ),
  description: z.string().max(2000).optional().default(''),
  notes: z.string().max(2000).optional().default(''),
  account_email: z.string().max(320).optional().default('').refine(
    (val) => val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    { message: 'Invalid account_email' }
  ),
  usage_importance: z.enum(['high', 'medium', 'low']).default('medium'),
  usage_frequency: z.enum(['daily', 'weekly', 'monthly', 'rarely']).default('monthly'),
  logo: z.string().max(2048).optional().default(''),
  tags: z.union([
    // CSV string: split on comma and trim — do NOT filter empty strings so Zod .min(1) rejects them
    z.string().transform((val) => val.split(',').map((t) => t.trim())).pipe(
      z.array(
        z.string().min(1, 'Tag must not be empty').max(50, 'Tag too long').regex(/^[^\x00-\x1f]+$/, 'Tag contains invalid characters')
      ).max(20, 'Too many tags')
    ),
    // Array input: reject empty strings and validate content
    z.array(
      z.string().min(1, 'Tag must not be empty').max(50, 'Tag too long').regex(/^[^\x00-\x1f]+$/, 'Tag contains invalid characters')
    ).max(20, 'Too many tags'),
  ]).optional().default([]),
  auto_renew: z.union([
    z.boolean(),
    z.string().transform((val) => val === 'true'),
  ]).optional().default(true),
}).strict();

export async function POST(request: NextRequest) {
  const guard = assertWriteAllowed(request, 'POST');
  if (guard) return guard;

  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, 'utf8') > MAX_IMPORT_BODY_BYTES) {
      return NextResponse.json(
        { success: false, error: 'Request body too large' },
        { status: 413 }
      );
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON' },
        { status: 400 }
      );
    }

    const { subscriptions } = parsed as { subscriptions?: unknown };

    if (!subscriptions || !Array.isArray(subscriptions)) {
      return NextResponse.json(
        { success: false, error: 'Invalid subscriptions data' },
        { status: 400 }
      );
    }

    if (subscriptions.length > MAX_IMPORT_SIZE) {
      return NextResponse.json(
        { success: false, error: `Import limited to ${MAX_IMPORT_SIZE} subscriptions at a time` },
        { status: 400 }
      );
    }

    let successCount = 0;
    const errors: string[] = [];

    for (const sub of subscriptions) {
      try {
        // Strip any caller-supplied id — server always generates IDs
        const { id: _ignored, ...subWithoutId } = sub as Record<string, unknown>;
        void _ignored;

        const validation = subscriptionImportRowSchema.safeParse({
          ...subWithoutId,
          cost: typeof subWithoutId.cost === 'string' ? parseFloat(subWithoutId.cost as string) || 0 : subWithoutId.cost,
        });

        if (!validation.success) {
          errors.push(`Validation failed for ${String(sub.name ?? 'unknown')}: ${validation.error.issues[0]?.message}`);
          continue;
        }

        const validated = validation.data;

        // Transform validated CSV data to Subscription format
        const subscription = {
          id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          name: validated.name,
          category: validated.category,
          subcategory: validated.subcategory ?? '',
          plan: validated.plan ?? 'Free',
          cost: validated.cost,
          currency: validated.currency,
          billing_cycle: validated.billing_cycle,
          status: validated.status,
          start_date: validated.start_date ?? new Date(),
          renewal_date: validated.renewal_date ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          url: validated.url ?? '',
          description: validated.description ?? '',
          notes: validated.notes ?? '',
          account_email: validated.account_email ?? '',
          usage_importance: validated.usage_importance,
          usage_frequency: validated.usage_frequency,
          logo: validated.logo ?? '',
          tags: Array.isArray(validated.tags) ? validated.tags : [],
          auto_renew: validated.auto_renew ?? true,
          alternative_services: [],
          account_emails_used_previously: [],
          previously_used_promotion_code: undefined,
          latest_promocode: undefined,
          secret_key: undefined,
          promo_code: undefined,
          promo_discount: undefined,
          safe_for_work: true,
          china_region_only: false,
          a16z_rank: undefined,
          last_used: undefined,
          fallback_icon: '📦'
        };

        const result = await createSubscription(subscription);
        if (result.success) {
          successCount++;
        } else {
          errors.push(`Failed to create ${sub.name}: ${result.error?.message}`);
        }
      } catch (error) {
        errors.push(`Error processing ${sub.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: successCount > 0,
      count: successCount,
      total: subscriptions.length,
      errors: errors.slice(0, 10)
    });

  } catch (error) {
    console.error('Import failed:', error)
    return NextResponse.json(
      { success: false, error: 'Import failed' },
      { status: 500 }
    );
  }
}
