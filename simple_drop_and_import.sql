-- Simple drop and recreate for Supabase Studio
-- Just run this in the SQL Editor

-- Drop all tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS subscription_account_emails CASCADE;
DROP TABLE IF EXISTS subscription_promo_codes CASCADE;
DROP TABLE IF EXISTS subscription_api_keys CASCADE;
DROP TABLE IF EXISTS subscription_alternatives CASCADE;
DROP TABLE IF EXISTS subscription_tags CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;

-- Drop views and functions
DROP VIEW IF EXISTS subscriptions_full CASCADE;
DROP VIEW IF EXISTS subscriptions_expiring_soon CASCADE;
DROP VIEW IF EXISTS active_subscriptions_monthly_cost CASCADE;
DROP FUNCTION IF EXISTS calculate_total_monthly_cost() CASCADE;
DROP FUNCTION IF EXISTS get_category_breakdown() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
