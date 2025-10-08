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
    let filteredData = applyFilters(subscriptions, filters);
    
    // Apply sorting
    filteredData = applySorting(filteredData, filters.sort, filters.order);
    
    // Apply pagination
    const { data, has_more, next_cursor } = applyPagination(filteredData, pagination);
    
    const response: PaginatedResponse<Subscription> = {
      success: true,
      data: data as Subscription[],
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
      billing_cycle: body.billing_cycle,
      status: body.status,
      start_date: new Date(body.start_date || Date.now()),
      renewal_date: new Date(body.renewal_date || Date.now() + 30 * 24 * 60 * 60 * 1000),
      url: body.url || '',
      description: body.description || '',
      notes: body.notes || '',
      account_email: body.account_email || '',
      usage_importance: body.usage_importance,
      usage_frequency: body.usage_frequency,
      logo: logo,
      tags: [],
      auto_renew: body.auto_renew ?? true,
      // defaults for optional analytics-related fields
      alternative_services: [],
    };

    // Save to Supabase database using the proxy
    try {
      const supabaseData = {
        id: subscription.id,
        name: subscription.name,
        plan: subscription.plan,
        cost: subscription.cost,
        currency: subscription.currency,
        billing_cycle: subscription.billing_cycle,
        category: subscription.category,
        subcategory: subscription.subcategory,
        description: subscription.description,
        url: subscription.url,
        status: subscription.status,
        account_email: subscription.account_email,
        notes: subscription.notes,
        renewal_date: subscription.renewal_date.toISOString(),
        start_date: subscription.start_date.toISOString(),
        usage_importance: subscription.usage_importance,
        usage_frequency: subscription.usage_frequency,
        auto_renew: subscription.auto_renew,
        logo_url: subscription.logo
      };
      
      console.log('Sending to Supabase:', JSON.stringify(supabaseData, null, 2));
      
      const response = await fetch('/api/supabase-proxy?endpoint=/rest/v1/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(supabaseData)
      });

      console.log('Supabase response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Supabase error response:', errorText);
        throw new Error(`Database save failed: ${response.status} - ${errorText}`);
      }

      const dbResult = await response.json();
      console.log('Supabase result:', JSON.stringify(dbResult, null, 2));
      
      if (!dbResult.success) {
        throw new Error(dbResult.error || 'Database save failed');
      }
    } catch (dbError) {
      console.error('Database save error:', JSON.stringify(dbError, null, 2));
      return createErrorResponse(
        'api_error',
        'database_save_failed',
        `Failed to save subscription to database: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`,
        undefined,
        requestId,
        500
      );
    }

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
