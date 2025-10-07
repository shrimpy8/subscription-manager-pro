import { NextRequest, NextResponse } from 'next/server';
import { Subscription } from '@/types/subscription';
import { z } from 'zod';
import { ZodError } from 'zod';

// Define valid actions
const actionSchema = z.object({
  action: z.enum(['pause', 'duplicate', 'cancel', 'reactivate']),
});

// Mock data store (in production, this would be a database)
const subscriptions: Subscription[] = [];

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
    
    // Validate the incoming action using Zod
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
    const subscriptionIndex = subscriptions.findIndex(sub => sub.id === resolvedParams.id);

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
          start_date: new Date(),
          renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
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
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Subscription ${action}ed successfully`
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}
