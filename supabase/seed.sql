-- Subscription Manager Pro - Sample Data Seed
-- Created: 2025-10-06
-- Description: Sample data for testing schema and validating structure

-- ============================================================================
-- SAMPLE SUBSCRIPTIONS
-- ============================================================================

-- ChatGPT subscription with all relationships
DO $$
DECLARE
  chatgpt_id UUID;
  claude_id UUID;
  spotify_id UUID;
  netflix_id UUID;
  github_id UUID;
  notion_id UUID;
BEGIN
  -- ChatGPT
  INSERT INTO subscriptions (
    name, plan, cost, currency, billing_cycle,
    category, subcategory, description, url,
    status, usage_importance, usage_frequency,
    account_email, auto_renew,
    start_date, renewal_date,
    logo_url, fallback_icon,
    safe_for_work, china_region_only, a16z_rank,
    latest_promocode, notes
  ) VALUES (
    'ChatGPT', 'Plus', 20.00, 'USD', 'Monthly',
    'AI Tools', 'Chat', 'Advanced AI assistant with GPT-4 access, faster responses, and priority access during peak hours.',
    'https://chat.openai.com',
    'active', 'high', 'daily',
    'user@example.com', true,
    '2024-07-05', '2025-01-05',
    'https://icons.duckduckgo.com/ip3/chat.openai.com.ico', '🤖',
    true, false, 1,
    'THANKS2025', 'Essential for work projects and research. Great for coding assistance.'
  ) RETURNING id INTO chatgpt_id;

  INSERT INTO subscription_tags (subscription_id, tag) VALUES
    (chatgpt_id, 'AI'),
    (chatgpt_id, 'Productivity'),
    (chatgpt_id, 'Work');

  INSERT INTO subscription_api_keys (subscription_id, key_name, key_value) VALUES
    (chatgpt_id, 'Primary', 'sk-example123'),
    (chatgpt_id, 'Backup', 'sk-backup456');

  INSERT INTO subscription_previous_promocodes (subscription_id, promo_code, used_at) VALUES
    (chatgpt_id, 'XYZ20', '2024-07-05'),
    (chatgpt_id, 'LABOR25', '2024-09-01');

  INSERT INTO subscription_previous_accountemails (subscription_id, email, used_at) VALUES
    (chatgpt_id, 'myemail1@domain.com', '2024-07-05'),
    (chatgpt_id, 'testemail@domain.com', '2024-08-15');

  INSERT INTO subscription_alternatives (subscription_id, service_name) VALUES
    (chatgpt_id, 'Claude'),
    (chatgpt_id, 'Gemini'),
    (chatgpt_id, 'Perplexity');

  -- Claude
  INSERT INTO subscriptions (
    name, plan, cost, currency, billing_cycle,
    category, subcategory, description, url,
    status, usage_importance, usage_frequency,
    account_email, auto_renew,
    start_date, renewal_date,
    logo_url, fallback_icon,
    safe_for_work, china_region_only,
    secret_key, notes
  ) VALUES (
    'Claude', 'Pro', 20.00, 'USD', 'Monthly',
    'AI Tools', 'Chat', 'AI assistant by Anthropic with advanced reasoning capabilities and safety features.',
    'https://claude.ai',
    'active', 'high', 'daily',
    'user@example.com', true,
    '2024-08-01', '2025-02-01',
    'https://icons.duckduckgo.com/ip3/claude.ai.ico', '🧠',
    true, false,
    'claude-secret-key', 'Great for complex reasoning and analysis tasks.'
  ) RETURNING id INTO claude_id;

  INSERT INTO subscription_tags (subscription_id, tag) VALUES
    (claude_id, 'AI'),
    (claude_id, 'Productivity'),
    (claude_id, 'Research');

  INSERT INTO subscription_api_keys (subscription_id, key_name, key_value) VALUES
    (claude_id, 'Production', 'claude-api-key-123');

  INSERT INTO subscription_alternatives (subscription_id, service_name) VALUES
    (claude_id, 'ChatGPT'),
    (claude_id, 'Gemini');

  -- Spotify
  INSERT INTO subscriptions (
    name, plan, cost, currency, billing_cycle,
    category, description, url,
    status, usage_importance, usage_frequency,
    account_email, auto_renew,
    start_date, renewal_date,
    logo_url, fallback_icon,
    safe_for_work, promo_discount, notes
  ) VALUES (
    'Spotify', 'Premium', 9.99, 'USD', 'Monthly',
    'Entertainment', 'Music streaming service with ad-free listening and offline downloads.',
    'https://spotify.com',
    'active', 'medium', 'daily',
    'user@example.com', true,
    '2024-01-01', '2025-01-01',
    'https://icons.duckduckgo.com/ip3/spotify.com.ico', '🎵',
    true, 10.00, 'Student discount applied'
  ) RETURNING id INTO spotify_id;

  INSERT INTO subscription_tags (subscription_id, tag) VALUES
    (spotify_id, 'Music'),
    (spotify_id, 'Entertainment');

  INSERT INTO subscription_previous_promocodes (subscription_id, promo_code, used_at) VALUES
    (spotify_id, 'STUDENT2024', '2024-01-01');

  INSERT INTO subscription_alternatives (subscription_id, service_name) VALUES
    (spotify_id, 'Apple Music'),
    (spotify_id, 'YouTube Music'),
    (spotify_id, 'Tidal');

  -- Netflix
  INSERT INTO subscriptions (
    name, plan, cost, currency, billing_cycle,
    category, description, url,
    status, usage_importance, usage_frequency,
    account_email, auto_renew,
    start_date, renewal_date,
    logo_url, fallback_icon,
    safe_for_work, notes
  ) VALUES (
    'Netflix', 'Standard', 15.49, 'USD', 'Monthly',
    'Streaming Service', 'Video streaming platform with movies and TV shows.',
    'https://netflix.com',
    'active', 'low', 'weekly',
    'family@example.com', true,
    '2023-06-01', '2024-12-01',
    'https://icons.duckduckgo.com/ip3/netflix.com.ico', '🎬',
    true, 'Shared with family'
  ) RETURNING id INTO netflix_id;

  INSERT INTO subscription_alternatives (subscription_id, service_name) VALUES
    (netflix_id, 'Hulu'),
    (netflix_id, 'Disney+'),
    (netflix_id, 'Prime Video');

  -- GitHub
  INSERT INTO subscriptions (
    name, plan, cost, currency, billing_cycle,
    category, description, url,
    status, usage_importance, usage_frequency,
    account_email, auto_renew,
    start_date, renewal_date,
    logo_url, fallback_icon,
    safe_for_work, notes
  ) VALUES (
    'GitHub', 'Pro', 4.00, 'USD', 'Monthly',
    'Development Tools', 'Code hosting platform with collaboration features.',
    'https://github.com',
    'active', 'high', 'daily',
    'dev@example.com', true,
    '2023-01-01', '2025-01-01',
    'https://icons.duckduckgo.com/ip3/github.com.ico', '💻',
    true, 'Essential for work'
  ) RETURNING id INTO github_id;

  INSERT INTO subscription_tags (subscription_id, tag) VALUES
    (github_id, 'Development'),
    (github_id, 'Work'),
    (github_id, 'Essential');

  -- Notion
  INSERT INTO subscriptions (
    name, plan, cost, currency, billing_cycle,
    category, description, url,
    status, usage_importance, usage_frequency,
    account_email, auto_renew,
    start_date, renewal_date,
    logo_url, fallback_icon,
    safe_for_work, last_used
  ) VALUES (
    'Notion', 'Plus', 10.00, 'USD', 'Monthly',
    'Productivity', 'All-in-one workspace for notes, tasks, and databases.',
    'https://notion.so',
    'active', 'high', 'daily',
    'user@example.com', true,
    '2024-03-01', '2025-03-01',
    'https://icons.duckduckgo.com/ip3/notion.so.ico', '📝',
    true, NOW() - INTERVAL '2 hours'
  ) RETURNING id INTO notion_id;

  INSERT INTO subscription_tags (subscription_id, tag) VALUES
    (notion_id, 'Productivity'),
    (notion_id, 'Work'),
    (notion_id, 'Organization');

  -- Paused subscription
  INSERT INTO subscriptions (
    name, plan, cost, currency, billing_cycle,
    category, description, url,
    status, usage_importance, usage_frequency,
    account_email, auto_renew,
    start_date, renewal_date,
    logo_url, fallback_icon,
    safe_for_work, notes
  ) VALUES (
    'Adobe Creative Cloud', 'Individual', 54.99, 'USD', 'Monthly',
    'Design Tools', 'Suite of creative applications for design and media.',
    'https://adobe.com',
    'paused', 'medium', 'rarely',
    'user@example.com', false,
    '2023-05-01', '2024-11-01',
    'https://icons.duckduckgo.com/ip3/adobe.com.ico', '🎨',
    true, 'Paused - not using frequently enough'
  );

END $$;

-- ============================================================================
-- USER SETTINGS
-- ============================================================================

INSERT INTO user_settings (
  user_id,
  view_mode,
  filters,
  url_state
) VALUES (
  NULL, -- No auth yet, so NULL user_id
  '{"type": "grid", "sortBy": "cost", "sortOrder": "desc"}'::jsonb,
  '{"status": "active", "category": "all"}'::jsonb,
  '{}'::jsonb
);
