import { NextRequest, NextResponse } from 'next/server';
import { Subscription } from '@/types/subscription';

// Mock data store (in production, this would be a database)
let subscriptions: Subscription[] = [];

/**
 * POST /api/subscriptions/[id]/actions
 * Perform actions on a specific subscription (pause, duplicate, etc.)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action } = body;
    const subscriptionIndex = subscriptions.findIndex(sub => sub.id === params.id);

    if (subscriptionIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const subscription = subscriptions[subscriptionIndex];
    let result: Subscription | Subscription[] = subscription;

    switch (action) {
      case 'pause':
        subscriptions[subscriptionIndex] = {
          ...subscription,
          status: subscription.status === 'paused' ? 'active' : 'paused'
        };
        result = subscriptions[subscriptionIndex];
        break;

      case 'duplicate':
        const duplicated: Subscription = {
          ...subscription,
          id: `sub-${Date.now()}`,
          name: `${subscription.name} (Copy)`,
          status: 'active',
          startDate: new Date(),
          renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };
        subscriptions.push(duplicated);
        result = duplicated;
        break;

      case 'cancel':
        subscriptions[subscriptionIndex] = {
          ...subscription,
          status: 'canceled'
        };
        result = subscriptions[subscriptionIndex];
        break;

      case 'reactivate':
        subscriptions[subscriptionIndex] = {
          ...subscription,
          status: 'active'
        };
        result = subscriptions[subscriptionIndex];
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Subscription ${action}ed successfully`
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}
