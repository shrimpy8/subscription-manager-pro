-- Drop promo columns from subscriptions
-- Created: 2025-10-07
-- Description: Remove inline promotion fields no longer used by UI/Sync

-- Safety: wrap in transaction
BEGIN;

-- Ensure table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'subscriptions'
  ) THEN
    RAISE EXCEPTION 'Table public.subscriptions does not exist';
  END IF;
END $$;

-- Drop dependent views first
DROP VIEW IF EXISTS public.subscriptions_expiring_soon;
DROP VIEW IF EXISTS public.subscriptions_full;

-- Drop columns if they exist
ALTER TABLE public.subscriptions
  DROP COLUMN IF EXISTS promo_code,
  DROP COLUMN IF EXISTS promo_discount;

-- Recreate views without the dropped columns
-- Expiring soon (within next 30 days)
CREATE VIEW public.subscriptions_expiring_soon AS
SELECT
  s.*,
  (s.renewal_date - NOW()) as days_until_renewal
FROM public.subscriptions s
WHERE
  s.status = 'active'
  AND s.renewal_date BETWEEN NOW() AND (NOW() + INTERVAL '30 days')
ORDER BY s.renewal_date ASC;

-- Subscription with all related data (simplified denormalized view)
CREATE VIEW public.subscriptions_full AS
SELECT
  s.*,
  '[]'::json as tags,
  '[]'::json as alternatives,
  '[]'::json as api_keys,
  '[]'::json as emails,
  '[]'::json as promotions
FROM public.subscriptions s;

-- Optional: document schema change
COMMENT ON TABLE public.subscriptions IS 'Subscriptions table (promo_code and promo_discount dropped on 2025-10-07)';

COMMIT;


