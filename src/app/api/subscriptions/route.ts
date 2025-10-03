import { NextRequest, NextResponse } from 'next/server';
import { Subscription } from '@/types/subscription';
import { sampleSubscriptions } from '@/lib/sample-data';

// Mock data store (in production, this would be a database)
let subscriptions: Subscription[] = [...sampleSubscriptions];

/**
 * GET /api/subscriptions
 * Retrieve all subscriptions
 */
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: subscriptions,
      count: subscriptions.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/subscriptions
 * Create a new subscription
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Apply favicon logic for AI tools
    let logo = body.logo;
    if (body.category === 'AI Tools' && body.url && !logo) {
      try {
        const domain = new URL(body.url).hostname;
        logo = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      } catch (error) {
        // If URL parsing fails, keep original logo or use fallback
        logo = body.logo || '';
      }
    }
    
    const subscription: Subscription = {
      id: `sub-${Date.now()}`,
      ...body,
      logo: logo,
      startDate: new Date(body.startDate || Date.now()),
      renewalDate: new Date(body.renewalDate || Date.now() + 30 * 24 * 60 * 60 * 1000)
    };

    subscriptions.push(subscription);

    return NextResponse.json({
      success: true,
      data: subscription,
      message: 'Subscription created successfully'
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/subscriptions
 * Update multiple subscriptions (bulk operation)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriptions: updatedSubscriptions } = body;

    if (!Array.isArray(updatedSubscriptions)) {
      return NextResponse.json(
        { success: false, error: 'Invalid data format' },
        { status: 400 }
      );
    }

    subscriptions = updatedSubscriptions;

    return NextResponse.json({
      success: true,
      data: subscriptions,
      message: 'Subscriptions updated successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update subscriptions' },
      { status: 500 }
    );
  }
}
