-- ============================================================================
-- DROP AND RECREATE TABLES WITH UPDATED DATA
-- ============================================================================
-- This script drops all existing tables and recreates them with fresh data
-- from toolsSubscription6.json with updated category/subcategory values
-- ============================================================================

BEGIN;

-- ============================================================================
-- DROP ALL EXISTING TABLES AND DEPENDENCIES
-- ============================================================================

-- Drop views first (they depend on tables)
DROP VIEW IF EXISTS subscriptions_full CASCADE;
DROP VIEW IF EXISTS subscriptions_expiring_soon CASCADE;
DROP VIEW IF EXISTS active_subscriptions_monthly_cost CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS calculate_total_monthly_cost() CASCADE;
DROP FUNCTION IF EXISTS get_category_breakdown() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop all relationship tables first (they have foreign keys)
DROP TABLE IF EXISTS subscription_account_emails CASCADE;
DROP TABLE IF EXISTS subscription_promo_codes CASCADE;
DROP TABLE IF EXISTS subscription_api_keys CASCADE;
DROP TABLE IF EXISTS subscription_alternatives CASCADE;
DROP TABLE IF EXISTS subscription_tags CASCADE;

-- Drop main tables
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;

-- ============================================================================
-- RECREATE SCHEMA WITH UPDATED STRUCTURE
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE SUBSCRIPTIONS TABLE (Updated)
-- ============================================================================
CREATE TABLE subscriptions (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic information
  name VARCHAR(255) NOT NULL,
  plan VARCHAR(100) DEFAULT 'Free',
  logo_url TEXT,
  fallback_icon VARCHAR(10) DEFAULT '🔧',

  -- Cost and billing
  cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'USD',
  billing_cycle VARCHAR(20) NOT NULL DEFAULT 'Monthly',

  -- Categorization (Updated with new values)
  category VARCHAR(50) NOT NULL DEFAULT 'Other',
  subcategory VARCHAR(50),

  -- Content and links
  description TEXT,
  url TEXT,
  notes TEXT,

  -- Status and lifecycle
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  auto_renew BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  renewal_date TIMESTAMPTZ,
  last_used TIMESTAMPTZ,

  -- Account and authentication
  account_email VARCHAR(255),
  secret_key TEXT,

  -- Usage tracking (Updated)
  usage_frequency VARCHAR(20) DEFAULT 'monthly',
  usage_importance VARCHAR(10) NOT NULL DEFAULT 'medium',

  -- Metadata flags (from AI Tools Tracker)
  safe_for_work BOOLEAN DEFAULT true,
  china_region_only BOOLEAN DEFAULT false,
  a16z_rank INTEGER,

  -- Usage flags (Added in latest migration)
  iam_using_it BOOLEAN NOT NULL DEFAULT false,
  no_subscription BOOLEAN NOT NULL DEFAULT true,
  not_in_a16z BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_billing_cycle CHECK (billing_cycle IN ('Monthly', 'Yearly', 'Weekly', 'Quarterly', 'Free')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'paused', 'canceled')),
  CONSTRAINT valid_usage_importance CHECK (usage_importance IN ('high', 'medium', 'low')),
  CONSTRAINT valid_usage_frequency CHECK (usage_frequency IN ('daily', 'weekly', 'monthly', 'rarely'))
);

-- ============================================================================
-- RELATIONSHIP TABLES
-- ============================================================================

-- Tags for subscriptions (many-to-many relationship)
CREATE TABLE subscription_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate tags per subscription
  UNIQUE(subscription_id, tag)
);

-- Alternative services/competitors
CREATE TABLE subscription_alternatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  service_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API access keys (encrypted storage recommended for production)
CREATE TABLE subscription_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  key_name VARCHAR(100) NOT NULL,
  key_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate key names per subscription
  UNIQUE(subscription_id, key_name)
);

-- Promotion codes history
CREATE TABLE subscription_promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  promo_code VARCHAR(100) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Account emails history
CREATE TABLE subscription_account_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- USER SETTINGS TABLE
-- ============================================================================
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- Will be linked to auth.users when authentication is added

  -- Store view mode, filters, and URL state as JSONB for flexibility
  view_mode JSONB DEFAULT '{"type": "grid", "sortBy": "name", "sortOrder": "asc"}'::jsonb,
  filters JSONB DEFAULT '{}'::jsonb,
  url_state JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One settings record per user
  UNIQUE(user_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Subscriptions indexes
CREATE INDEX idx_subscriptions_category ON subscriptions(category);
CREATE INDEX idx_subscriptions_subcategory ON subscriptions(subcategory);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_billing_cycle ON subscriptions(billing_cycle);
CREATE INDEX idx_subscriptions_usage_importance ON subscriptions(usage_importance);
CREATE INDEX idx_subscriptions_usage_frequency ON subscriptions(usage_frequency);
CREATE INDEX idx_subscriptions_renewal_date ON subscriptions(renewal_date);
CREATE INDEX idx_subscriptions_cost ON subscriptions(cost);
CREATE INDEX idx_subscriptions_name ON subscriptions(name);

-- Full-text search index for subscriptions
CREATE INDEX idx_subscriptions_search ON subscriptions USING GIN (
  to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(notes, ''))
);

-- Relationship table indexes
CREATE INDEX idx_subscription_tags_subscription_id ON subscription_tags(subscription_id);
CREATE INDEX idx_subscription_tags_tag ON subscription_tags(tag);
CREATE INDEX idx_subscription_alternatives_subscription_id ON subscription_alternatives(subscription_id);
CREATE INDEX idx_subscription_api_keys_subscription_id ON subscription_api_keys(subscription_id);
CREATE INDEX idx_subscription_promo_codes_subscription_id ON subscription_promo_codes(subscription_id);
CREATE INDEX idx_subscription_account_emails_subscription_id ON subscription_account_emails(subscription_id);

-- User settings indexes
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp on subscriptions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Active subscriptions with monthly cost
CREATE VIEW active_subscriptions_monthly_cost AS
SELECT
  id,
  name,
  category,
  cost,
  currency,
  billing_cycle,
  CASE
    WHEN billing_cycle = 'Monthly' THEN cost
    WHEN billing_cycle = 'Yearly' THEN ROUND(cost / 12, 2)
    WHEN billing_cycle = 'Weekly' THEN ROUND(cost * 52 / 12, 2)
    WHEN billing_cycle = 'Quarterly' THEN ROUND(cost / 3, 2)
    ELSE 0
  END as monthly_cost,
  renewal_date,
  usage_importance,
  usage_frequency
FROM subscriptions
WHERE status = 'active';

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

-- Subscription with all related data (for easy fetching)
CREATE VIEW subscriptions_full AS
SELECT
  s.*,
  COALESCE(
    json_agg(DISTINCT jsonb_build_object('tag', st.tag))
    FILTER (WHERE st.tag IS NOT NULL),
    '[]'
  ) as tags,
  COALESCE(
    json_agg(DISTINCT jsonb_build_object('service', sa.service_name))
    FILTER (WHERE sa.service_name IS NOT NULL),
    '[]'
  ) as alternatives,
  COALESCE(
    json_agg(DISTINCT jsonb_build_object('name', sak.key_name, 'value', sak.key_value))
    FILTER (WHERE sak.key_name IS NOT NULL),
    '[]'
  ) as api_keys,
  COALESCE(
    json_agg(DISTINCT jsonb_build_object('code', spc.promo_code, 'used_at', spc.used_at))
    FILTER (WHERE spc.promo_code IS NOT NULL),
    '[]'
  ) as promo_codes,
  COALESCE(
    json_agg(DISTINCT jsonb_build_object('email', sae.email, 'used_at', sae.used_at))
    FILTER (WHERE sae.email IS NOT NULL),
    '[]'
  ) as account_emails
FROM subscriptions s
LEFT JOIN subscription_tags st ON s.id = st.subscription_id
LEFT JOIN subscription_alternatives sa ON s.id = sa.subscription_id
LEFT JOIN subscription_api_keys sak ON s.id = sak.subscription_id
LEFT JOIN subscription_promo_codes spc ON s.id = spc.subscription_id
LEFT JOIN subscription_account_emails sae ON s.id = sae.subscription_id
GROUP BY s.id;

-- ============================================================================
-- FUNCTIONS FOR ANALYTICS
-- ============================================================================

-- Calculate total monthly cost
CREATE OR REPLACE FUNCTION calculate_total_monthly_cost()
RETURNS DECIMAL(10,2) AS $$
  SELECT COALESCE(SUM(monthly_cost), 0)
  FROM active_subscriptions_monthly_cost;
$$ LANGUAGE SQL STABLE;

-- Get category breakdown
CREATE OR REPLACE FUNCTION get_category_breakdown()
RETURNS TABLE(category VARCHAR, count BIGINT, total_cost DECIMAL) AS $$
  SELECT
    category,
    COUNT(*) as count,
    SUM(monthly_cost) as total_cost
  FROM active_subscriptions_monthly_cost
  GROUP BY category
  ORDER BY total_cost DESC;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE subscriptions IS 'Core subscription data with comprehensive tracking';
COMMENT ON TABLE subscription_tags IS 'Many-to-many relationship for subscription tags';
COMMENT ON TABLE subscription_alternatives IS 'Alternative services for each subscription';
COMMENT ON TABLE subscription_api_keys IS 'API keys associated with subscriptions';
COMMENT ON TABLE subscription_promo_codes IS 'Historical record of used promotion codes';
COMMENT ON TABLE subscription_account_emails IS 'Historical record of account emails used';
COMMENT ON TABLE user_settings IS 'User preferences for view mode, filters, and UI state';

COMMENT ON VIEW active_subscriptions_monthly_cost IS 'All active subscriptions normalized to monthly cost';
COMMENT ON VIEW subscriptions_expiring_soon IS 'Subscriptions expiring within next 30 days';
COMMENT ON VIEW subscriptions_full IS 'Complete subscription data with all relationships';

COMMIT;

-- ============================================================================
-- DATA INSERTION SCRIPT
-- ============================================================================
-- This section contains the INSERT statements for the data from toolsSubscription6.json
-- Run this after the schema is created

-- Note: The actual data insertion would be done via a separate script or API call
-- since we need to process the JSON data and insert it properly with relationships
