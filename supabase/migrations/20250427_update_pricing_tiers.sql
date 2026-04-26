-- Update pricing tiers and credit allocations
-- Created: 2026-04-26

-- Update subscriptions table to support new tiers
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_tier_check,
  ADD CONSTRAINT subscriptions_plan_tier_check 
    CHECK (plan_tier IN ('indie', 'pro', 'agency'));

-- Update user_credits default values for new pricing tiers
-- This will be applied when new users are created or when they upgrade

-- Function to get monthly credits based on subscription tier
CREATE OR REPLACE FUNCTION public.get_monthly_credits_for_tier(tier text)
RETURNS integer AS $$
BEGIN
  CASE tier
    WHEN 'agency' THEN RETURN 500;
    WHEN 'pro' THEN RETURN 150;
    WHEN 'indie' THEN RETURN 50;
    ELSE RETURN 5; -- Free tier
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update reset_monthly_credits function to use new tier logic
CREATE OR REPLACE FUNCTION public.reset_monthly_credits()
RETURNS void AS $$
BEGIN
  UPDATE public.user_credits uc
  SET monthly_credits = (
    SELECT COALESCE(
      public.get_monthly_credits_for_tier(s.plan_tier),
      5 -- Default to free tier if no subscription
    )
    FROM public.subscriptions s
    WHERE s.user_id = uc.user_id AND s.status = 'active'
  ),
  last_reset_at = now()
  WHERE EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.user_id = uc.user_id AND s.status = 'active'
  );
  
  -- For users without active subscriptions, set to free tier
  UPDATE public.user_credits uc
  SET monthly_credits = 5,
      last_reset_at = now()
  WHERE NOT EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.user_id = uc.user_id AND s.status = 'active'
  );
END;
$$ LANGUAGE plpgsql;

-- Update get_available_credits function to use new tier logic
CREATE OR REPLACE FUNCTION public.get_available_credits(user_uuid uuid)
RETURNS integer AS $$
DECLARE
  monthly_credits integer;
  purchased_credits integer;
BEGIN
  -- Get or create user credits record
  SELECT uc.monthly_credits, uc.purchased_credits
  INTO monthly_credits, purchased_credits
  FROM public.user_credits uc
  WHERE uc.user_id = user_uuid;
  
  -- If no record exists, create one with free tier credits
  IF monthly_credits IS NULL THEN
    INSERT INTO public.user_credits (user_id, monthly_credits)
    VALUES (user_uuid, 5)
    RETURNING monthly_credits, purchased_credits INTO monthly_credits, purchased_credits;
  END IF;
  
  RETURN COALESCE(monthly_credits, 0) + COALESCE(purchased_credits, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment to document the new pricing tiers
COMMENT ON COLUMN public.subscriptions.plan_tier IS 'Subscription tier: indie ($5/mo, 50 credits), pro ($9/mo, 150 credits), agency ($19/mo, 500 credits)';
