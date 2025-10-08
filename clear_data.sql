-- Clear all data from tables (keep the table structure)
BEGIN;

TRUNCATE subscription_api_keys, subscription_promo_codes, subscription_account_emails, subscription_alternatives, subscription_tags, subscriptions RESTART IDENTITY CASCADE;

COMMIT;
