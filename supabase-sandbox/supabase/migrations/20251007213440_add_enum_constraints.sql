-- Add comprehensive enum constraints for data validation
-- This ensures only valid values can be inserted/updated

BEGIN;

-- Drop existing constraints if they exist
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS valid_billing_cycle;
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS valid_status;
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS valid_usage_frequency;
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS valid_usage_importance;

-- Add comprehensive enum constraints
ALTER TABLE subscriptions 
  ADD CONSTRAINT valid_billing_cycle CHECK (billing_cycle IN (
    'one-time', 'pay-per-use', 'monthly', 'yearly'
  ));

ALTER TABLE subscriptions 
  ADD CONSTRAINT valid_status CHECK (status IN (
    'active', 'paused', 'canceled', 'trial', 'expired'
  ));

ALTER TABLE subscriptions 
  ADD CONSTRAINT valid_usage_frequency CHECK (usage_frequency IN (
    'daily', 'weekly', 'monthly', 'occasionally', 'rarely'
  ));

ALTER TABLE subscriptions 
  ADD CONSTRAINT valid_usage_importance CHECK (usage_importance IN (
    'high', 'low', 'medium', 'critical'
  ));

-- Add plan constraint (optional, since plans can be flexible)
-- ALTER TABLE subscriptions 
--   ADD CONSTRAINT valid_plan CHECK (plan IN (
--     'advanced', 'enterprise', 'free', 'creator', 'individual', 'max', 
--     'personal', 'premium', 'plus', 'pro', 'professional', 'standard', 
--     'starter', 'team', 'ultra', 'unlimited'
--   ));

COMMIT;
