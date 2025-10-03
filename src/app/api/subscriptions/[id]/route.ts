import { NextRequest, NextResponse } from 'next/server';
import { Subscription } from '@/types/subscription';

// Mock data store (in production, this would be a database)
const subscriptions: Subscription[] = [];

/**
 * GET /api/subscriptions/[id]
 * Retrieve a specific subscription by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const subscription = subscriptions.find(sub => sub.id === resolvedParams.id);

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/subscriptions/[id]
 * Update a specific subscription
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const resolvedParams = await params;
    const subscriptionIndex = subscriptions.findIndex(sub => sub.id === resolvedParams.id);

    if (subscriptionIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const updatedSubscription: Subscription = {
      ...subscriptions[subscriptionIndex],
      ...body,
      id: resolvedParams.id // Ensure ID doesn't change
    };

    subscriptions[subscriptionIndex] = updatedSubscription;

    return NextResponse.json({
      success: true,
      data: updatedSubscription,
      message: 'Subscription updated successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/subscriptions/[id]
 * Delete a specific subscription
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const subscriptionIndex = subscriptions.findIndex(sub => sub.id === resolvedParams.id);

    if (subscriptionIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const deletedSubscription = subscriptions[subscriptionIndex];
    subscriptions.splice(subscriptionIndex, 1);

    return NextResponse.json({
      success: true,
      data: deletedSubscription,
      message: 'Subscription deleted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete subscription' },
      { status: 500 }
    );
  }
}
