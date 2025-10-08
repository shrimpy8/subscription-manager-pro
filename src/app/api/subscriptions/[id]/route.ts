import { NextRequest, NextResponse } from 'next/server';
import { Subscription } from '@/types/subscription';
import { subscriptionCreateSchema } from '@/lib/validation/schemas';
import { ZodError } from 'zod';

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
    
    // Validate the incoming data using Zod
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
    const subscriptionIndex = subscriptions.findIndex(sub => sub.id === resolvedParams.id);

    if (subscriptionIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Apply favicon logic for AI tools
    let logo = validatedData.logo;
    if (validatedData.category === 'AI Tools' && validatedData.url && !logo) {
      try {
        const domain = new URL(validatedData.url).hostname;
        logo = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      } catch {
        // If URL parsing fails, keep original logo or use fallback
        logo = validatedData.logo || '';
      }
    }

    const updatedSubscription: Subscription = {
      ...subscriptions[subscriptionIndex],
      ...validatedData,
      logo: logo,
      start_date: validatedData.start_date ? new Date(validatedData.start_date) : subscriptions[subscriptionIndex].start_date,
      renewal_date: validatedData.renewal_date ? new Date(validatedData.renewal_date) : subscriptions[subscriptionIndex].renewal_date,
      id: resolvedParams.id // Ensure ID doesn't change
    };

    subscriptions[subscriptionIndex] = updatedSubscription;

    return NextResponse.json({
      success: true,
      data: updatedSubscription,
      message: 'Subscription updated successfully'
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
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
    console.error('Error deleting subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete subscription' },
      { status: 500 }
    );
  }
}
