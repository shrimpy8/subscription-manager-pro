-- Add usage/status flags to subscriptions
-- Created: 2025-10-07
-- Description: Add iam_using_it, no_subscription, not_in_a16z to public.subscriptions

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

-- Add columns if they do not exist
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS iam_using_it boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS no_subscription boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS not_in_a16z boolean NOT NULL DEFAULT true;

-- Optional: document schema change
COMMENT ON COLUMN public.subscriptions.iam_using_it IS 'User indicates they are actively using the tool';
COMMENT ON COLUMN public.subscriptions.no_subscription IS 'Indicates user does not have a subscription';
COMMENT ON COLUMN public.subscriptions.not_in_a16z IS 'Indicates tool is not present in a16z ranking';

COMMIT;


