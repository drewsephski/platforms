-- Revenue-generating features: AI Credits, Template Marketplace, Custom Domain Billing
-- Created: 2026-04-26

-- ============================================
-- AI CREDITS SYSTEM
-- ============================================

-- Track credits per generation
ALTER TABLE public.ai_generations 
  ADD COLUMN IF NOT EXISTS credits_used integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS generation_type text 
    CHECK (generation_type IN ('full_site', 'section_edit', 'content_refresh'));

-- User credit balance table
CREATE TABLE IF NOT EXISTS public.user_credits (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  monthly_credits integer DEFAULT 3,
  purchased_credits integer DEFAULT 0,
  free_tier_used integer DEFAULT 0,
  last_reset_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Credit purchase history
CREATE TABLE IF NOT EXISTS public.credit_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  credits_added integer NOT NULL,
  price_cents integer NOT NULL,
  stripe_payment_intent_id text,
  created_at timestamptz DEFAULT now()
);

-- Indexes for credit tables
CREATE INDEX IF NOT EXISTS idx_credit_purchases_user ON public.credit_purchases(user_id);

-- Function to calculate total available credits
CREATE OR REPLACE FUNCTION public.get_available_credits(user_uuid uuid)
RETURNS integer AS $$
DECLARE
  monthly_credits integer;
  purchased_credits integer;
  is_pro boolean;
BEGIN
  -- Check if user has active subscription
  SELECT EXISTS(
    SELECT 1 FROM public.subscriptions s 
    WHERE s.user_id = user_uuid AND s.status = 'active'
  ) INTO is_pro;
  
  -- Get or create user credits record
  SELECT uc.monthly_credits, uc.purchased_credits
  INTO monthly_credits, purchased_credits
  FROM public.user_credits uc
  WHERE uc.user_id = user_uuid;
  
  -- If no record exists, create one with appropriate monthly credits
  IF monthly_credits IS NULL THEN
    INSERT INTO public.user_credits (user_id, monthly_credits)
    VALUES (user_uuid, CASE WHEN is_pro THEN 50 ELSE 3 END)
    RETURNING monthly_credits, purchased_credits INTO monthly_credits, purchased_credits;
  END IF;
  
  RETURN COALESCE(monthly_credits, 0) + COALESCE(purchased_credits, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct credits
CREATE OR REPLACE FUNCTION public.deduct_credits(
  user_uuid uuid,
  amount integer,
  generation_type text
)
RETURNS boolean AS $$
DECLARE
  available integer;
  monthly integer;
  purchased integer;
BEGIN
  -- Get current balances
  SELECT monthly_credits, purchased_credits
  INTO monthly, purchased
  FROM public.user_credits
  WHERE user_id = user_uuid;
  
  available := COALESCE(monthly, 0) + COALESCE(purchased, 0);
  
  -- Check if enough credits
  IF available < amount THEN
    RETURN false;
  END IF;
  
  -- Deduct from purchased first, then monthly
  IF COALESCE(purchased, 0) >= amount THEN
    UPDATE public.user_credits
    SET purchased_credits = purchased_credits - amount,
        updated_at = now()
    WHERE user_id = user_uuid;
  ELSE
    UPDATE public.user_credits
    SET monthly_credits = GREATEST(0, monthly_credits - (amount - COALESCE(purchased, 0))),
        purchased_credits = GREATEST(0, purchased_credits - amount + monthly),
        updated_at = now()
    WHERE user_id = user_uuid;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly credits (run via cron or webhook)
CREATE OR REPLACE FUNCTION public.reset_monthly_credits()
RETURNS void AS $$
BEGIN
  UPDATE public.user_credits 
  SET monthly_credits = CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.subscriptions s 
      WHERE s.user_id = user_credits.user_id AND s.status = 'active'
    ) THEN 50 
    ELSE 3 
  END,
  last_reset_at = now();
END;
$$ LANGUAGE plpgsql;

-- Function to add purchased credits to user's account
CREATE OR REPLACE FUNCTION public.add_purchased_credits(
  user_uuid uuid,
  credits_to_add integer
)
RETURNS void AS $$
BEGIN
  UPDATE public.user_credits
  SET purchased_credits = purchased_credits + credits_to_add,
      updated_at = now()
  WHERE user_id = user_uuid;
  
  -- If no rows updated, insert new record
  IF NOT FOUND THEN
    INSERT INTO public.user_credits (user_id, purchased_credits, monthly_credits)
    VALUES (user_uuid, credits_to_add, 3);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for user_credits
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credits"
ON public.user_credits
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits"
ON public.user_credits
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credits"
ON public.user_credits
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for credit_purchases
ALTER TABLE public.credit_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credit purchases"
ON public.credit_purchases
FOR SELECT
USING (auth.uid() = user_id);

-- ============================================
-- TEMPLATE MARKETPLACE
-- ============================================

-- Add marketplace fields to prompt_recipes
ALTER TABLE public.prompt_recipes 
  ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending' 
    CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS submitted_for_review_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS price_cents integer,
  ADD COLUMN IF NOT EXISTS sales_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS preview_image_url text;

-- Set existing public templates to approved (seed data)
UPDATE public.prompt_recipes 
SET approval_status = 'approved' 
WHERE is_public = true AND approval_status = 'pending';

-- Create indexes for marketplace queries
CREATE INDEX IF NOT EXISTS idx_prompt_recipes_approval_status ON public.prompt_recipes(approval_status);
CREATE INDEX IF NOT EXISTS idx_prompt_recipes_public_approved ON public.prompt_recipes(is_public, approval_status) 
  WHERE is_public = true AND approval_status = 'approved';

-- Template sales tracking
CREATE TABLE IF NOT EXISTS public.template_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES public.prompt_recipes(id) ON DELETE CASCADE,
  buyer_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  creator_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  price_cents integer NOT NULL,
  platform_fee_cents integer NOT NULL,
  stripe_payment_intent_id text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_template_sales_creator ON public.template_sales(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_template_sales_buyer ON public.template_sales(buyer_user_id);

-- RLS Policies for template_sales
ALTER TABLE public.template_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own template purchases"
ON public.template_sales
FOR SELECT
USING (buyer_user_id = auth.uid() OR creator_user_id = auth.uid());

CREATE POLICY "Users can insert own sales"
ON public.template_sales
FOR INSERT
WITH CHECK (buyer_user_id = auth.uid());

-- Update prompt_recipes policy to allow reading approved public templates
DROP POLICY IF EXISTS "Anyone can read public recipes" ON public.prompt_recipes;

CREATE POLICY "Anyone can read approved public recipes"
ON public.prompt_recipes
FOR SELECT
USING (is_public = true AND approval_status = 'approved');

-- ============================================
-- CUSTOM DOMAIN BILLING
-- ============================================

-- Add billing fields to custom_domains
ALTER TABLE public.custom_domains 
  ADD COLUMN IF NOT EXISTS is_included_in_plan boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS billing_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS stripe_subscription_item_id text;

-- Function to count verified domains per user
CREATE OR REPLACE FUNCTION public.get_user_verified_domain_count(user_uuid uuid)
RETURNS integer AS $$
  SELECT COUNT(*)::integer 
  FROM public.custom_domains cd
  JOIN public.sites s ON s.id = cd.site_id
  WHERE s.user_id = user_uuid AND cd.verified = true;
$$ LANGUAGE sql STABLE;

-- Function to count billable domains (extras beyond 1 included with Pro)
CREATE OR REPLACE FUNCTION public.get_user_billable_domain_count(user_uuid uuid)
RETURNS integer AS $$
DECLARE
  total integer;
  is_pro boolean;
BEGIN
  -- Get total verified domains
  SELECT public.get_user_verified_domain_count(user_uuid) INTO total;
  
  -- Check if user has Pro subscription
  SELECT EXISTS(
    SELECT 1 FROM public.subscriptions s 
    WHERE s.user_id = user_uuid AND s.status = 'active'
  ) INTO is_pro;
  
  -- Pro gets 1 free, others pay for all
  IF is_pro THEN
    RETURN GREATEST(0, total - 1);
  ELSE
    RETURN total;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- AGENCY TIER (Phase 2)
-- ============================================

CREATE TABLE IF NOT EXISTS public.agency_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE,
  status text CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  max_sites integer DEFAULT 50,
  white_label boolean DEFAULT true,
  custom_css_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agency_subscriptions_user ON public.agency_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_agency_subscriptions_status ON public.agency_subscriptions(status);

-- RLS for agency subscriptions
ALTER TABLE public.agency_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own agency subscription"
ON public.agency_subscriptions
FOR SELECT
USING (user_id = auth.uid());

-- Trigger for agency updated_at
DROP TRIGGER IF EXISTS update_agency_subscriptions_updated_at ON public.agency_subscriptions;

CREATE TRIGGER update_agency_subscriptions_updated_at
BEFORE UPDATE ON public.agency_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- STRIPE WEBHOOK INTEGRATION
-- ============================================

-- Update subscriptions table to support additional features
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS plan_tier text DEFAULT 'pro' 
    CHECK (plan_tier IN ('pro', 'agency')),
  ADD COLUMN IF NOT EXISTS included_domains integer DEFAULT 1;

-- Function to handle credit reset on subscription payment
CREATE OR REPLACE FUNCTION public.handle_subscription_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Reset monthly credits for the user
  UPDATE public.user_credits
  SET monthly_credits = 50,
      last_reset_at = now()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to reset credits on subscription renewal
DROP TRIGGER IF EXISTS reset_credits_on_subscription_renewal ON public.subscriptions;

-- Note: In production, tie this to Stripe invoice.paid webhook instead
-- This is a placeholder for demonstration

-- ============================================
-- SEED: Create sample marketplace templates
-- ============================================

-- Seed approved templates if table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.prompt_recipes WHERE approval_status = 'approved' LIMIT 1) THEN
    -- These would be created from actual high-quality templates in practice
    -- For now, this is a placeholder for the seeding logic
    RAISE NOTICE 'No approved templates found. Seed templates manually or via admin UI.';
  END IF;
END $$;

-- ============================================
-- COMPLETION
-- ============================================

COMMENT ON TABLE public.user_credits IS 'Tracks AI credit balances per user';
COMMENT ON TABLE public.credit_purchases IS 'History of credit purchases';
COMMENT ON TABLE public.template_sales IS 'Records of template marketplace transactions';
COMMENT ON TABLE public.agency_subscriptions IS 'Agency tier subscriptions with white-label features';

-- Grant necessary permissions
GRANT ALL ON public.user_credits TO authenticated;
GRANT ALL ON public.credit_purchases TO authenticated;
GRANT ALL ON public.template_sales TO authenticated;
GRANT ALL ON public.agency_subscriptions TO authenticated;
