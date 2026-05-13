import { NextRequest, NextResponse } from 'next/server';
import { createSubscription } from '@/lib/supabase-data';
import { subscriptionCreateSchema } from '@/lib/validation/schemas';

const MAX_IMPORT_SIZE = 500;

export async function POST(request: NextRequest) {
  try {
    const { subscriptions } = await request.json();

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
        const validation = subscriptionCreateSchema.safeParse({
          name: sub.name || 'Unknown',
          category: sub.category || 'Other',
          cost: parseFloat(sub.cost) || 0,
          billing_cycle: sub.billing_cycle || 'Monthly',
          status: sub.status || 'active',
          usage_importance: sub.usage_importance || 'medium',
          usage_frequency: sub.usage_frequency || 'monthly',
        });

        if (!validation.success) {
          errors.push(`Validation failed for ${sub.name}: ${validation.error.issues[0]?.message}`);
          continue;
        }

        // Transform CSV data to Subscription format
        const subscription = {
          id: sub.id || `sub-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          name: sub.name || 'Unknown',
          category: sub.category || 'Other',
          subcategory: sub.subcategory || '',
          plan: sub.plan || 'Free',
          cost: parseFloat(sub.cost) || 0,
          currency: sub.currency || 'USD',
          billing_cycle: sub.billing_cycle || 'Monthly',
          status: sub.status || 'active',
          start_date: sub.start_date ? new Date(sub.start_date) : new Date(),
          renewal_date: sub.renewal_date ? new Date(sub.renewal_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          url: sub.url || '',
          description: sub.description || '',
          notes: sub.notes || '',
          account_email: sub.account_email || '',
          usage_importance: sub.usage_importance || 'medium',
          usage_frequency: sub.usage_frequency || 'monthly',
          logo: sub.logo || '',
          tags: sub.tags ? sub.tags.split(',').map((t: string) => t.trim()) : [],
          auto_renew: sub.auto_renew === 'true' || sub.auto_renew === true,
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
