import { NextRequest, NextResponse } from 'next/server';
import { Subscription } from '@/types/subscription';
import { subscriptionCreateSchema } from '@/lib/validation/schemas';
import { resolveFaviconUrl } from '@/lib/api-helpers';
import { findSubscription, findSubscriptionIndex, updateSubscription, removeSubscription } from '@/lib/subscription-store';

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
    const subscription = findSubscription(resolvedParams.id);

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
    console.error('Error fetching subscription:', error);
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

    const validationResult = subscriptionCreateSchema.safeParse({
      ...body,
      id: resolvedParams.id
    });

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

    const validatedData = validationResult.data;
    const subscriptionIndex = findSubscriptionIndex(resolvedParams.id);

    if (subscriptionIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const logo = resolveFaviconUrl(validatedData.category, validatedData.url, validatedData.logo);

    const existing = findSubscription(resolvedParams.id)!;
    const updatedSubscription: Subscription = {
      ...existing,
      ...validatedData,
      logo: logo,
      start_date: validatedData.start_date ? new Date(validatedData.start_date) : existing.start_date,
      renewal_date: validatedData.renewal_date ? new Date(validatedData.renewal_date) : existing.renewal_date,
      id: resolvedParams.id
    };

    updateSubscription(subscriptionIndex, updatedSubscription);

    return NextResponse.json({
      success: true,
      data: updatedSubscription,
      message: 'Subscription updated successfully'
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
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
    const subscriptionIndex = findSubscriptionIndex(resolvedParams.id);

    if (subscriptionIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const deletedSubscription = removeSubscription(subscriptionIndex);

    return NextResponse.json({
      success: true,
      data: deletedSubscription,
      message: 'Subscription deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete subscription' },
      { status: 500 }
    );
  }
}
