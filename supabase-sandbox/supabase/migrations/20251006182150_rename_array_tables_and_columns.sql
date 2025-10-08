-- Rename array field tables and latest_promotion_code column
-- Created: 2025-01-07
-- Description: Rename array field tables and latest_promotion_code column to match form field names

-- First, drop the views that might depend on these tables
DROP VIEW IF EXISTS subscriptions_expiring_soon;
DROP VIEW IF EXISTS subscriptions_full;

-- Rename the array field tables
ALTER TABLE subscription_promo_codes RENAME TO subscription_previous_promocodes;
ALTER TABLE subscription_account_emails RENAME TO subscription_previous_accountemails;

-- Rename the latest_promotion_code column to latest_promocode
ALTER TABLE subscriptions RENAME COLUMN latest_promotion_code TO latest_promocode;

-- Recreate the views with the renamed tables and columns
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

-- Add comments to document the changes
COMMENT ON TABLE subscription_previous_promocodes IS 'Previous promotion codes used for subscriptions - renamed from subscription_promotions';
COMMENT ON TABLE subscription_previous_accountemails IS 'Previous account emails used for subscriptions - renamed from subscription_emails';
COMMENT ON COLUMN subscriptions.latest_promocode IS 'Latest promotion code used - renamed from latest_promotion_code';
