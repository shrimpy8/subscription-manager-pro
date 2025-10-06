import { NextRequest } from 'next/server';
import { Subscription } from '@/types/subscription';
import { subscriptionCreateSchema, subscriptionsBulkSchema } from '@/lib/validation/schemas';
import { sampleSubscriptions } from '@/lib/sample-data';
import { 
  generateRequestId, 
  createSuccessResponse, 
  createErrorResponse,
  parsePaginationParams,
  parseFilterParams,
  applyPagination,
  applyFilters,
  applySorting,
  PaginatedResponse
} from '@/lib/api-helpers';

// Mock data store (in production, this would be a database)
let subscriptions: Subscription[] = [...sampleSubscriptions];

/**
 * GET /api/subscriptions
 * Retrieve subscriptions with pagination, filtering, and sorting
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse pagination and filter parameters
    const pagination = parsePaginationParams(searchParams);
    const filters = parseFilterParams(searchParams);
    
    // Apply filters
    let filteredData = applyFilters(subscriptions as unknown as Record<string, unknown>[], filters);
    
    // Apply sorting
    filteredData = applySorting(filteredData, filters.sort, filters.order);
    
    // Apply pagination
    const { data, has_more, next_cursor } = applyPagination(filteredData, pagination);
    
    const response: PaginatedResponse<Subscription> = {
      success: true,
      data: data as unknown as Subscription[],
      has_more,
      total_count: filteredData.length,
      next_cursor,
      request_id: requestId
    };
    
    return createSuccessResponse(response, requestId);
  } catch {
    return createErrorResponse(
      'api_error',
      'internal_server_error',
      'Failed to fetch subscriptions',
      undefined,
      requestId,
      500
    );
  }
}

/**
 * POST /api/subscriptions
 * Create a new subscription
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    const json = await request.json();
    const parsed = subscriptionCreateSchema.safeParse(json);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return createErrorResponse(
        'invalid_request_error',
        'validation_failed',
        firstError.message,
        firstError.path.join('.'),
        requestId,
        400
      );
    }
    const body = parsed.data;
    
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
      name: body.name,
      category: body.category,
      subcategory: body.subcategory || '',
      plan: body.plan || '',
      cost: body.cost ?? 0,
      currency: body.currency || 'USD',
      billingCycle: body.billingCycle,
      status: body.status,
      startDate: new Date(body.startDate || Date.now()),
      renewalDate: new Date(body.renewalDate || Date.now() + 30 * 24 * 60 * 60 * 1000),
      url: body.url || '',
      description: body.description || '',
      notes: body.notes || '',
      accountEmail: body.accountEmail || '',
      priority: body.priority,
      usageFrequency: body.usageFrequency,
      logo: logo,
      tags: [],
      autoRenew: body.autoRenew ?? true,
      // defaults for optional analytics-related fields
      alternativeServices: [],
    };

    subscriptions.push(subscription);

    return createSuccessResponse({
      success: true,
      data: subscription,
      message: 'Subscription created successfully',
      request_id: requestId
    }, requestId, 201);
  } catch {
    return createErrorResponse(
      'api_error',
      'internal_server_error',
      'Failed to create subscription',
      undefined,
      requestId,
      500
    );
  }
}

/**
 * PUT /api/subscriptions
 * Update multiple subscriptions (bulk operation)
 */
export async function PUT(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    const json = await request.json();
    const parsed = subscriptionsBulkSchema.safeParse(json);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return createErrorResponse(
        'invalid_request_error',
        'validation_failed',
        firstError.message,
        firstError.path.join('.'),
        requestId,
        400
      );
    }
    subscriptions = parsed.data.subscriptions as Subscription[];

    return createSuccessResponse({
      success: true,
      data: subscriptions,
      message: 'Subscriptions updated successfully',
      request_id: requestId
    }, requestId);
  } catch {
    return createErrorResponse(
      'api_error',
      'internal_server_error',
      'Failed to update subscriptions',
      undefined,
      requestId,
      500
    );
  }
}
