import { NextRequest, NextResponse } from 'next/server';
import { Subscription } from '@/types/subscription';
import { z } from 'zod';
import { findSubscription, findSubscriptionIndex, updateSubscription, addSubscription } from '@/lib/subscription-store';

// Define valid actions
const actionSchema = z.object({
  action: z.enum(['pause', 'duplicate', 'cancel', 'reactivate']),
});

/**
 * POST /api/subscriptions/[id]/actions
 * Perform actions on a specific subscription (pause, duplicate, etc.)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const resolvedParams = await params;

    const validationResult = actionSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const { action } = validationResult.data;
    const subscriptionIndex = findSubscriptionIndex(resolvedParams.id);

    if (subscriptionIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const subscription = findSubscription(resolvedParams.id)!;
    let result: Subscription | Subscription[] = subscription;

    switch (action) {
      case 'pause': {
        const updated = { ...subscription, status: subscription.status === 'paused' ? 'active' : 'paused' } as Subscription;
        updateSubscription(subscriptionIndex, updated);
        result = updated;
        break;
      }

      case 'duplicate': {
        const duplicated: Subscription = {
          ...subscription,
          id: `sub-${Date.now()}`,
          name: `${subscription.name} (Copy)`,
          status: 'active',
          start_date: new Date(),
          renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };
        addSubscription(duplicated);
        result = duplicated;
        break;
      }

      case 'cancel': {
        const updated = { ...subscription, status: 'canceled' } as Subscription;
        updateSubscription(subscriptionIndex, updated);
        result = updated;
        break;
      }

      case 'reactivate': {
        const updated = { ...subscription, status: 'active' } as Subscription;
        updateSubscription(subscriptionIndex, updated);
        result = updated;
        break;
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Subscription ${action}ed successfully`
    });
  } catch (error) {
    console.error('Error performing action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}
