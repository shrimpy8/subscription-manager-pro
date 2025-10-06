import { NextResponse } from 'next/server';

/**
 * Generate a unique request ID for API tracking
 */
export function generateRequestId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `req_${timestamp}_${random}`;
}

/**
 * Stripe-style error response format
 */
export interface APIError {
  error: {
    type: 'invalid_request_error' | 'api_error' | 'authentication_error' | 'not_found_error';
    code: string;
    message: string;
    param?: string;
    request_id?: string;
  };
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  type: APIError['error']['type'],
  code: string,
  message: string,
  param?: string,
  requestId?: string,
  status: number = 400
): NextResponse {
  const errorResponse: APIError = {
    error: {
      type,
      code,
      message,
      param,
      request_id: requestId
    }
  };

  const response = NextResponse.json(errorResponse, { status });
  
  if (requestId) {
    response.headers.set('X-Request-ID', requestId);
  }
  
  return response;
}

/**
 * Create a success response with request ID
 */
export function createSuccessResponse(
  data: unknown,
  requestId?: string,
  status: number = 200,
  additionalHeaders?: Record<string, string>
): NextResponse {
  const response = NextResponse.json(data, { status });
  
  if (requestId) {
    response.headers.set('X-Request-ID', requestId);
  }
  
  if (additionalHeaders) {
    Object.entries(additionalHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
  
  return response;
}

/**
 * Pagination parameters interface
 */
export interface PaginationParams {
  limit?: number;
  offset?: number;
  starting_after?: string;
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  has_more: boolean;
  total_count?: number;
  next_cursor?: string;
  request_id?: string;
}

/**
 * Parse and validate pagination parameters
 */
export function parsePaginationParams(searchParams: URLSearchParams): PaginationParams {
  const limit = searchParams.get('limit');
  const offset = searchParams.get('offset');
  const starting_after = searchParams.get('starting_after');

  return {
    limit: limit ? Math.min(Math.max(parseInt(limit, 10), 1), 100) : 20, // Default 20, max 100
    offset: offset ? Math.max(parseInt(offset, 10), 0) : 0, // Default 0, min 0
    starting_after: starting_after || undefined
  };
}

/**
 * Parse and validate filter parameters
 */
export function parseFilterParams(searchParams: URLSearchParams) {
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const cost_min = searchParams.get('cost_min');
  const cost_max = searchParams.get('cost_max');
  const sort = searchParams.get('sort');
  const order = searchParams.get('order');

  return {
    status: status || undefined,
    category: category || undefined,
    cost_min: cost_min ? parseFloat(cost_min) : undefined,
    cost_max: cost_max ? parseFloat(cost_max) : undefined,
    sort: sort || 'created_at',
    order: (order === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc'
  };
}

/**
 * Apply pagination to data array
 */
export function applyPagination<T>(
  data: T[],
  pagination: PaginationParams
): { data: T[]; has_more: boolean; next_cursor?: string } {
  const { limit = 20, offset = 0 } = pagination;
  
  const startIndex = offset;
  const endIndex = startIndex + limit;
  
  const paginatedData = data.slice(startIndex, endIndex);
  const has_more = endIndex < data.length;
  const next_cursor = has_more ? `cursor_${endIndex}` : undefined;
  
  return {
    data: paginatedData,
    has_more,
    next_cursor
  };
}

/**
 * Apply filters to subscription data
 */
export function applyFilters<T extends Record<string, unknown>>(
  data: T[],
  filters: ReturnType<typeof parseFilterParams>
): T[] {
  return data.filter(item => {
    if (filters.status && (item.status as string) !== filters.status) return false;
    if (filters.category && (item.category as string) !== filters.category) return false;
    if (filters.cost_min !== undefined && (item.cost as number) < filters.cost_min) return false;
    if (filters.cost_max !== undefined && (item.cost as number) > filters.cost_max) return false;
    return true;
  });
}

/**
 * Apply sorting to data array
 */
export function applySorting<T>(
  data: T[],
  sort: string,
  order: 'asc' | 'desc'
): T[] {
  return [...data].sort((a, b) => {
    const aValue = (a as Record<string, unknown>)[sort];
    const bValue = (b as Record<string, unknown>)[sort];
    
    // Handle unknown types by converting to strings for comparison
    const aStr = String(aValue);
    const bStr = String(bValue);
    
    if (aStr < bStr) return order === 'asc' ? -1 : 1;
    if (aStr > bStr) return order === 'asc' ? 1 : -1;
    return 0;
  });
}
