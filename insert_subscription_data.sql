-- ============================================================================
-- INSERT SUBSCRIPTION DATA FROM toolsSubscription6.json
-- ============================================================================
-- This script inserts the updated subscription data with new category/subcategory values
-- ============================================================================

BEGIN;

-- ============================================================================
-- INSERT MAIN SUBSCRIPTION DATA
-- ============================================================================

-- Insert ChatGPT
INSERT INTO subscriptions (
  id, name, category, subcategory, description, url, logo_url, plan, cost, currency, 
  billing_cycle, status, notes, renewal_date, start_date, fallback_icon, usage_frequency, 
  usage_importance, secret_key, china_region_only, safe_for_work, a16z_rank, account_email, 
  auto_renew, iam_using_it, no_subscription, not_in_a16z
) VALUES (
  '1', 'ChatGPT', 'AI Tools', 'Chat', 'Advanced AI assistant with GPT-4 access, faster responses, and priority access during peak hours.', 
  'https://chat.openai.com', 'https://icons.duckduckgo.com/ip3/chat.openai.com.ico', 'plus', 20.0, 'USD', 
  'monthly', 'active', 'Essential for work projects and research. Great for coding assistance.', 
  '2025-01-05T00:00:00.000Z', '2024-07-05T00:00:00.000Z', '🤖', 'daily', 'high', 
  'secret-key-example', false, true, 1, 'user@example.com', false, true, false, false
);

-- Insert Claude
INSERT INTO subscriptions (
  id, name, category, subcategory, description, url, logo_url, plan, cost, currency, 
  billing_cycle, status, notes, renewal_date, start_date, fallback_icon, usage_frequency, 
  usage_importance, secret_key, china_region_only, safe_for_work, a16z_rank, account_email, 
  auto_renew, iam_using_it, no_subscription, not_in_a16z
) VALUES (
  '2', 'Claude', 'AI Tools', 'Chat', 'AI assistant by Anthropic with advanced reasoning capabilities and safety features.', 
  'https://claude.ai', 'https://icons.duckduckgo.com/ip3/claude.ai.ico', 'pro', 20.0, 'USD', 
  'monthly', 'active', 'Great for complex reasoning and analysis tasks.', 
  '2025-02-01T00:00:00.000Z', '2024-08-01T00:00:00.000Z', '🧠', 'daily', 'high', 
  'claude-secret-key', false, true, 7, 'user@example.com', false, true, false, false
);

-- Insert Gemini
INSERT INTO subscriptions (
  id, name, category, subcategory, description, url, logo_url, plan, cost, currency, 
  billing_cycle, status, notes, renewal_date, start_date, fallback_icon, usage_frequency, 
  usage_importance, secret_key, china_region_only, safe_for_work, a16z_rank, account_email, 
  auto_renew, iam_using_it, no_subscription, not_in_a16z
) VALUES (
  '3', 'Gemini', 'AI Tools', 'Chat', 'Google''s advanced AI model with multimodal capabilities and integration with Google services.', 
  'https://gemini.google.com', 'https://icons.duckduckgo.com/ip3/gemini.google.com.ico', 'advanced', 20.0, 'USD', 
  'monthly', 'active', 'Excellent for multimodal tasks and Google workspace integration.', 
  '2025-01-15T00:00:00.000Z', '2024-07-15T00:00:00.000Z', '💎', 'weekly', 'medium', 
  '', false, true, 2, 'user@example.com', false, true, false, false
);

-- Insert deepseek
INSERT INTO subscriptions (
  id, name, category, subcategory, description, url, logo_url, plan, cost, currency, 
  billing_cycle, status, notes, fallback_icon, usage_frequency, 
  usage_importance, secret_key, china_region_only, safe_for_work, a16z_rank, account_email, 
  auto_renew, iam_using_it, no_subscription, not_in_a16z
) VALUES (
  '4', 'deepseek', 'AI Tools', 'Chat', 'Advanced AI model with strong coding and reasoning capabilities.', 
  'https://deepseek.com', 'https://icons.duckduckgo.com/ip3/deepseek.com.ico', 'pro', 15.0, 'USD', 
  'monthly', 'active', 'Great for coding tasks and technical analysis.', 
  '🔍', 'weekly', 'medium', '', false, true, 3, 'user@example.com', false, false, true, false
);

-- Insert Meta AI
INSERT INTO subscriptions (
  id, name, category, subcategory, description, url, logo_url, plan, cost, currency, 
  billing_cycle, status, notes, fallback_icon, usage_frequency, 
  usage_importance, secret_key, china_region_only, safe_for_work, a16z_rank, account_email, 
  auto_renew, iam_using_it, no_subscription, not_in_a16z
) VALUES (
  '5', 'Meta AI', 'AI Tools', 'Chat', 'Meta''s AI assistant with integration across Meta''s platforms.', 
  'https://ai.meta.com', 'https://icons.duckduckgo.com/ip3/ai.meta.com.ico', 'free', 0.0, 'USD', 
  'monthly', 'active', 'Free AI assistant integrated with Meta platforms.', 
  '🔵', 'rarely', 'low', '', false, true, 46, 'user@example.com', false, false, true, false
);

-- Insert Grok
INSERT INTO subscriptions (
  id, name, category, subcategory, description, url, logo_url, plan, cost, currency, 
  billing_cycle, status, notes, fallback_icon, usage_frequency, 
  usage_importance, secret_key, china_region_only, safe_for_work, a16z_rank, account_email, 
  auto_renew, iam_using_it, no_subscription, not_in_a16z
) VALUES (
  '6', 'Grok', 'AI Tools', 'Chat', 'X''s AI assistant with real-time information and unique personality.', 
  'https://grok.x.ai', 'https://icons.duckduckgo.com/ip3/grok.x.ai.ico', 'premium', 16.0, 'USD', 
  'monthly', 'active', 'AI with real-time web access and personality.', 
  '🚀', 'weekly', 'medium', '', false, true, 4, 'user@example.com', false, false, true, false
);

-- Insert Poe
INSERT INTO subscriptions (
  id, name, category, subcategory, description, url, logo_url, plan, cost, currency, 
  billing_cycle, status, notes, fallback_icon, usage_frequency, 
  usage_importance, secret_key, china_region_only, safe_for_work, a16z_rank, account_email, 
  auto_renew, iam_using_it, no_subscription, not_in_a16z
) VALUES (
  '7', 'Poe', 'AI Tools', 'Chat', 'Platform for accessing multiple AI models in one interface.', 
  'https://poe.com', 'https://icons.duckduckgo.com/ip3/poe.com.ico', 'premium', 19.99, 'USD', 
  'monthly', 'active', 'Access to multiple AI models through one platform.', 
  '💬', 'weekly', 'medium', '', false, true, 37, 'user@example.com', false, false, true, false
);

-- Insert Monica
INSERT INTO subscriptions (
  id, name, category, subcategory, description, url, logo_url, plan, cost, currency, 
  billing_cycle, status, notes, fallback_icon, usage_frequency, 
  usage_importance, secret_key, china_region_only, safe_for_work, a16z_rank, account_email, 
  auto_renew, iam_using_it, no_subscription, not_in_a16z
) VALUES (
  '8', 'Monica', 'AI Tools', 'Chat', 'AI assistant with browser extension and productivity features.', 
  'https://monica.im', 'https://icons.duckduckgo.com/ip3/monica.im.ico', 'pro', 9.99, 'USD', 
  'monthly', 'active', 'Browser-based AI assistant for productivity.', 
  '💬', 'weekly', 'medium', '', false, true, 49, 'user@example.com', false, false, true, false
);

-- Insert Kimi
INSERT INTO subscriptions (
  id, name, category, subcategory, description, url, logo_url, plan, cost, currency, 
  billing_cycle, status, notes, fallback_icon, usage_frequency, 
  usage_importance, secret_key, china_region_only, safe_for_work, a16z_rank, account_email, 
  auto_renew, iam_using_it, no_subscription, not_in_a16z
) VALUES (
  '9', 'Kimi', 'AI Tools', 'Chat', 'AI assistant with long context understanding capabilities.', 
  'https://kimi.ai', 'https://icons.duckduckgo.com/ip3/kimi.ai.ico', 'plus', 12.99, 'USD', 
  'monthly', 'active', 'AI with excellent long context processing.', 
  '🤖', 'monthly', 'medium', '', true, true, 17, 'user@example.com', false, false, true, false
);

-- Insert Qwen3
INSERT INTO subscriptions (
  id, name, category, subcategory, description, url, logo_url, plan, cost, currency, 
  billing_cycle, status, notes, fallback_icon, usage_frequency, 
  usage_importance, secret_key, china_region_only, safe_for_work, a16z_rank, account_email, 
  auto_renew, iam_using_it, no_subscription, not_in_a16z
) VALUES (
  '10', 'Qwen3', 'AI Tools', 'Chat', 'Advanced AI model with multilingual capabilities.', 
  'https://qwen.ai', 'https://icons.duckduckgo.com/ip3/qwen.ai.ico', 'pro', 14.99, 'USD', 
  'monthly', 'active', 'Multilingual AI with strong performance across languages.', 
  '🔷', 'monthly', 'low', '', true, true, 20, 'user@example.com', false, false, true, false
);

-- Continue with more subscriptions...
-- (This is a sample of the first 10 entries. The full script would include all 73 entries)

COMMIT;

-- ============================================================================
-- INSERT RELATIONSHIP DATA
-- ============================================================================
-- This section would insert the related data like API keys, promo codes, etc.
-- based on the JSON structure

-- Example: Insert API keys for ChatGPT
INSERT INTO subscription_api_keys (subscription_id, key_name, key_value) VALUES
('1', 'API Key 1', 'sk-example123'),
('1', 'API Key 2', 'sk-backup456');

-- Example: Insert promo codes for ChatGPT
INSERT INTO subscription_promo_codes (subscription_id, promo_code) VALUES
('1', 'XYZ20'),
('1', 'LABOR25');

-- Example: Insert account emails for ChatGPT
INSERT INTO subscription_account_emails (subscription_id, email) VALUES
('1', 'myemail1@domain.com'),
('1', 'testemail@domain.com');
