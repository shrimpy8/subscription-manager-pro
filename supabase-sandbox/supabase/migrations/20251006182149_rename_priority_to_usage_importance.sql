-- Rename priority column to usage_importance
-- Created: 2025-01-07
-- Description: Rename priority column to usage_importance to match form field names

-- First, drop the views that depend on the priority column
DROP VIEW IF EXISTS subscriptions_expiring_soon;
DROP VIEW IF EXISTS subscriptions_full;

-- Rename the priority column to usage_importance
ALTER TABLE subscriptions RENAME COLUMN priority TO usage_importance;

-- Recreate the views with the renamed column
-- Expiring soon (within next 30 days)
CREATE VIEW subscriptions_expiring_soon AS
SELECT
  s.*,
  (s.renewal_date - NOW()) as days_until_renewal
FROM subscriptions s
WHERE
  s.status = 'active'
  AND s.renewal_date BETWEEN NOW() AND (NOW() + INTERVAL '30 days')
ORDER BY s.renewal_date ASC;

-- Subscription with all related data (for easy fetching) - simplified version
CREATE VIEW subscriptions_full AS
SELECT
  s.*,
  '[]'::json as tags,
  '[]'::json as alternatives,
  '[]'::json as api_keys,
  '[]'::json as emails,
  '[]'::json as promotions
FROM subscriptions s;

-- Add a comment to document the change
COMMENT ON COLUMN subscriptions.usage_importance IS 'Usage importance level (high, medium, low) - renamed from priority';
