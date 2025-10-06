# Subscription Manager Pro API Documentation

## Overview

The Subscription Manager Pro API provides RESTful endpoints for managing subscriptions and AI tools. The API follows Stripe-level standards with pagination, request IDs, structured error responses, and comprehensive validation.

## Base URL

```
http://localhost:3001/api
```

## Authentication

Currently, the API operates in local-only mode without authentication. Future versions will include Supabase integration with proper authentication.

## Request/Response Format

### Success Response Format

```json
{
  "success": true,
  "data": {...},
  "has_more": false,
  "total_count": 10,
  "next_cursor": "cursor_123",
  "request_id": "req_1234567890_abcdef"
}
```

### Error Response Format

```json
{
  "error": {
    "type": "invalid_request_error",
    "code": "validation_failed",
    "message": "The 'name' parameter is required",
    "param": "name",
    "request_id": "req_1234567890_abcdef"
  }
}
```

## Headers

All API responses include:
- `X-Request-ID`: Unique identifier for debugging
- `Content-Type`: `application/json`

## Endpoints

### Subscriptions

#### GET /api/subscriptions

Retrieve subscriptions with pagination, filtering, and sorting.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 20 | Number of results (max: 100) |
| `offset` | integer | 0 | Number of results to skip |
| `starting_after` | string | - | Cursor for pagination |
| `status` | string | - | Filter by status (`active`, `paused`, `canceled`) |
| `category` | string | - | Filter by category |
| `cost_min` | number | - | Minimum cost filter |
| `cost_max` | number | - | Maximum cost filter |
| `sort` | string | `created_at` | Sort field |
| `order` | string | `asc` | Sort order (`asc`, `desc`) |

**Example Request:**
```bash
GET /api/subscriptions?limit=10&status=active&category=AI Tools&sort=cost&order=desc
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "sub_1234567890",
      "name": "ChatGPT Pro",
      "category": "AI Tools",
      "cost": 20.00,
      "billingCycle": "Monthly",
      "status": "active",
      "startDate": "2024-01-01T00:00:00.000Z",
      "renewalDate": "2024-02-01T00:00:00.000Z",
      "url": "https://chat.openai.com",
      "description": "AI-powered conversational assistant",
      "logo": "https://www.google.com/s2/favicons?domain=openai.com&sz=64"
    }
  ],
  "has_more": true,
  "total_count": 25,
  "next_cursor": "cursor_10",
  "request_id": "req_1234567890_abcdef"
}
```

#### POST /api/subscriptions

Create a new subscription.

**Request Body:**
```json
{
  "name": "ChatGPT Pro",
  "category": "AI Tools",
  "cost": 20.00,
  "billingCycle": "Monthly",
  "status": "active",
  "startDate": "2024-01-01T00:00:00.000Z",
  "renewalDate": "2024-02-01T00:00:00.000Z",
  "url": "https://chat.openai.com",
  "description": "AI-powered conversational assistant"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "sub_1234567890",
    "name": "ChatGPT Pro",
    "category": "AI Tools",
    "cost": 20.00,
    "billingCycle": "Monthly",
    "status": "active",
    "startDate": "2024-01-01T00:00:00.000Z",
    "renewalDate": "2024-02-01T00:00:00.000Z",
    "url": "https://chat.openai.com",
    "description": "AI-powered conversational assistant",
    "logo": "https://www.google.com/s2/favicons?domain=openai.com&sz=64"
  },
  "message": "Subscription created successfully",
  "request_id": "req_1234567890_abcdef"
}
```

#### PUT /api/subscriptions

Update multiple subscriptions (bulk operation).

**Request Body:**
```json
{
  "subscriptions": [
    {
      "id": "sub_1234567890",
      "name": "Updated Name",
      "cost": 25.00
    }
  ]
}
```

#### GET /api/subscriptions/{id}

Retrieve a specific subscription by ID.

**Example Request:**
```bash
GET /api/subscriptions/sub_1234567890
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "sub_1234567890",
    "name": "ChatGPT Pro",
    "category": "AI Tools",
    "cost": 20.00,
    "billingCycle": "Monthly",
    "status": "active",
    "startDate": "2024-01-01T00:00:00.000Z",
    "renewalDate": "2024-02-01T00:00:00.000Z",
    "url": "https://chat.openai.com",
    "description": "AI-powered conversational assistant",
    "logo": "https://www.google.com/s2/favicons?domain=openai.com&sz=64"
  },
  "request_id": "req_1234567890_abcdef"
}
```

#### PUT /api/subscriptions/{id}

Update a specific subscription.

**Request Body:**
```json
{
  "name": "Updated Name",
  "cost": 25.00,
  "status": "paused"
}
```

#### DELETE /api/subscriptions/{id}

Delete a specific subscription.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "sub_1234567890",
    "name": "ChatGPT Pro",
    "category": "AI Tools"
  },
  "message": "Subscription deleted successfully",
  "request_id": "req_1234567890_abcdef"
}
```

#### POST /api/subscriptions/{id}/actions

Perform actions on a specific subscription.

**Request Body:**
```json
{
  "action": "pause"
}
```

**Available Actions:**
- `pause` - Toggle pause status
- `duplicate` - Create a copy
- `cancel` - Cancel subscription
- `reactivate` - Reactivate subscription

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "sub_1234567890",
    "name": "ChatGPT Pro",
    "status": "paused"
  },
  "message": "Subscription paused successfully",
  "request_id": "req_1234567890_abcdef"
}
```

### Export

#### GET /api/subscriptions/export

Export subscriptions in various formats.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `format` | string | `json` | Export format (`json`, `csv`) |

**Example Request:**
```bash
GET /api/subscriptions/export?format=csv
```

**Example Response (CSV):**
```csv
id,name,category,cost,billingCycle,status,startDate,renewalDate,url,description
sub_1234567890,ChatGPT Pro,AI Tools,20.00,Monthly,active,2024-01-01T00:00:00.000Z,2024-02-01T00:00:00.000Z,https://chat.openai.com,AI-powered conversational assistant
```

## Data Models

### Subscription

```typescript
interface Subscription {
  id: string;
  name: string;
  plan: string;
  logo: string;
  cost: number;
  currency: string;
  billingCycle: 'Monthly' | 'Yearly' | 'Weekly' | 'Quarterly' | 'Free';
  category: SubscriptionCategory;
  subcategory?: string;
  description: string;
  url: string;
  status: 'active' | 'paused' | 'canceled';
  accountEmail?: string;
  promoCode?: string;
  promoDiscount?: number;
  notes: string;
  renewalDate: Date;
  startDate: Date;
  tags?: string[];
  priority: 'high' | 'medium' | 'low';
  usageFrequency: 'daily' | 'weekly' | 'monthly' | 'rarely';
  productivityScore?: number;
  alternativeServices?: string[];
  lastUsed?: Date;
  autoRenew: boolean;
  logoUrl?: string;
  fallbackIcon: string;
  safeForWork: boolean;
  chinaRegionOnly: boolean;
  a16zRank?: number;
  apiAccessKeys?: string[];
  secretKey?: string;
  previouslyUsedPromotionCode?: string[];
  latestPromotionCode?: string;
  accountEmailsUsedPreviously?: string[];
}
```

### SubscriptionCategory

```typescript
type SubscriptionCategory = 
  | 'AI Tools'
  | 'SaaS'
  | 'Entertainment'
  | 'Productivity'
  | 'Utilities'
  | 'Newsletter'
  | 'Streaming Service'
  | 'Online Learning'
  | 'Magazine'
  | 'Cloud Provider'
  | 'Development Tools'
  | 'Design Tools'
  | 'Communication'
  | 'Security'
  | 'Other';
```

## Error Codes

| Code | Description |
|------|-------------|
| `validation_failed` | Request validation failed |
| `subscription_not_found` | Subscription with given ID not found |
| `invalid_request_error` | Invalid request format or parameters |
| `api_error` | Internal server error |
| `not_found_error` | Resource not found |

## Rate Limiting

Currently, no rate limiting is implemented. Future versions will include rate limiting headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1234567890
```

## Testing

### Using curl

```bash
# Get all subscriptions
curl -X GET "http://localhost:3001/api/subscriptions"

# Get subscriptions with pagination
curl -X GET "http://localhost:3001/api/subscriptions?limit=5&offset=0"

# Create a subscription
curl -X POST "http://localhost:3001/api/subscriptions" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Subscription",
    "category": "AI Tools",
    "cost": 10.00,
    "billingCycle": "Monthly",
    "status": "active",
    "startDate": "2024-01-01T00:00:00.000Z",
    "renewalDate": "2024-02-01T00:00:00.000Z",
    "url": "https://example.com"
  }'

# Update a subscription
curl -X PUT "http://localhost:3001/api/subscriptions/sub_1234567890" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "cost": 15.00
  }'

# Delete a subscription
curl -X DELETE "http://localhost:3001/api/subscriptions/sub_1234567890"

# Perform action on subscription
curl -X POST "http://localhost:3001/api/subscriptions/sub_1234567890/actions" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "pause"
  }'
```

### Using the Test Script

A Node.js test script is available at `test-api-validation.js`:

```bash
node test-api-validation.js
```

## Future Enhancements

### Phase 2: Advanced Features
- [ ] Idempotency keys for safe retries
- [ ] Rate limiting with headers
- [ ] Expandable resources for related data
- [ ] Advanced sorting capabilities

### Phase 3: Developer Experience
- [ ] OpenAPI/Swagger specification
- [ ] Interactive API explorer
- [ ] SDK generation
- [ ] Postman collection

## Changelog

### v1.0.0 (2025-10-06)
- ✅ Initial API implementation
- ✅ Pagination support
- ✅ Request ID tracking
- ✅ Stripe-style error responses
- ✅ Comprehensive validation with Zod
- ✅ Filtering and sorting capabilities
- ✅ Export functionality (JSON/CSV)

## Support

For API support and questions, please refer to the project documentation or create an issue in the repository.
