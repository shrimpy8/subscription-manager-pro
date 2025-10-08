-- Recreate the schema after tables were dropped
-- Run this first, then import the data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE subscriptions (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic information
  name VARCHAR(255) NOT NULL,
  plan VARCHAR(100) DEFAULT 'free',
  logo_url TEXT,
  fallback_icon VARCHAR(10) DEFAULT '🔧',

  -- Cost and billing
  cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'USD',
  billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly',
  latest_promocode VARCHAR(100),


  -- Categorization
  category VARCHAR(50) NOT NULL DEFAULT 'Tools',
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

  -- Usage tracking
  usage_frequency VARCHAR(20) DEFAULT 'monthly',
  usage_importance VARCHAR(10) NOT NULL DEFAULT 'medium',

  -- Metadata flags
  safe_for_work BOOLEAN DEFAULT true,
  china_region_only BOOLEAN DEFAULT false,
  a16z_rank INTEGER,

  -- Usage flags
  iam_using_it BOOLEAN NOT NULL DEFAULT false,
  no_subscription BOOLEAN NOT NULL DEFAULT true,
  not_in_a16z BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_billing_cycle CHECK (billing_cycle IN ('monthly', 'yearly', 'one-time', 'pay-per-use')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'paused', 'canceled', 'trial', 'expired')),
  CONSTRAINT valid_usage_importance CHECK (usage_importance IN ('high', 'medium', 'low', 'critical')),
  CONSTRAINT valid_usage_frequency CHECK (usage_frequency IN ('daily', 'weekly', 'monthly', 'occasionally','rarely')),
  CONSTRAINT valid_plan CHECK (plan IN ('advanced','creator','enterprise','free', 'individual','max','personal','plus','premium','pro','professional','standard','starter','team', 'ultra', 'unlimited'))
);

-- ============================================================================
-- RELATIONSHIP TABLES
-- ============================================================================

-- Tags for subscriptions
CREATE TABLE subscription_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subscription_id, tag)
);

-- Alternative services
CREATE TABLE subscription_alternatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  service_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API access keys
CREATE TABLE subscription_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  key_name VARCHAR(100) NOT NULL,
  key_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subscription_id, key_name)
);

-- Promotion codes history
CREATE TABLE subscription_previous_promocodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  promo_code VARCHAR(100) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Account emails history
CREATE TABLE subscription_previous_accountemails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- User settings
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  view_mode JSONB DEFAULT '{"type": "grid", "sortBy": "name", "sortOrder": "asc"}'::jsonb,
  filters JSONB DEFAULT '{}'::jsonb,
  url_state JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX idx_subscriptions_category ON subscriptions(category);
CREATE INDEX idx_subscriptions_subcategory ON subscriptions(subcategory);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_billing_cycle ON subscriptions(billing_cycle);
CREATE INDEX idx_subscriptions_usage_importance ON subscriptions(usage_importance);
CREATE INDEX idx_subscriptions_usage_frequency ON subscriptions(usage_frequency);
CREATE INDEX idx_subscriptions_renewal_date ON subscriptions(renewal_date);
CREATE INDEX idx_subscriptions_cost ON subscriptions(cost);
CREATE INDEX idx_subscriptions_name ON subscriptions(name);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
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
-- CREATE VIEWS
-- ============================================================================

-- View for subscriptions expiring soon
CREATE VIEW public.subscriptions_expiring_soon AS
SELECT
  s.*,
  (s.renewal_date - NOW()) as days_until_renewal
FROM public.subscriptions s
WHERE
  s.status = 'active'
  AND s.renewal_date BETWEEN NOW() AND (NOW() + INTERVAL '30 days')
ORDER BY s.renewal_date ASC;

-- View for subscriptions with all related data (simplified denormalized view)
CREATE VIEW public.subscriptions_full AS
SELECT
  s.*,
  '[]'::json as tags,
  '[]'::json as alternatives,
  '[]'::json as api_keys,
  '[]'::json as emails,
  '[]'::json as promotions
FROM public.subscriptions s;
