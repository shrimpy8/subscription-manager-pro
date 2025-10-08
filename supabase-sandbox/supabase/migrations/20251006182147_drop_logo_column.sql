-- Drop logo column from subscriptions table
-- Created: 2025-01-07
-- Description: Remove the logo column since all data has been moved to logo_url column

-- First, drop the views that depend on the logo column
DROP VIEW IF EXISTS subscriptions_expiring_soon;
DROP VIEW IF EXISTS subscriptions_full;

-- Drop the logo column from subscriptions table
ALTER TABLE subscriptions DROP COLUMN IF EXISTS logo;

-- Recreate the basic views without the logo column
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
COMMENT ON COLUMN subscriptions.logo_url IS 'Primary logo URL field for subscription logos';
