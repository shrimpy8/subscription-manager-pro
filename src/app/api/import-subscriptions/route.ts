import { NextRequest, NextResponse } from 'next/server';
import { createSubscription } from '@/lib/supabase-data';

export async function POST(request: NextRequest) {
  try {
    const { subscriptions } = await request.json();
    
    if (!subscriptions || !Array.isArray(subscriptions)) {
      return NextResponse.json(
        { success: false, error: 'Invalid subscriptions data' },
        { status: 400 }
      );
    }
    
    let successCount = 0;
    const errors: string[] = [];
    
    // Process each subscription
    for (const sub of subscriptions) {
      try {
        // Transform CSV data to Subscription format
        const subscription = {
          id: sub.id || `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
      errors: errors.slice(0, 10) // Limit error messages
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Import failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
