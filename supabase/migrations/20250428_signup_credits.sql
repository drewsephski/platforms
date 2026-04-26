-- Migration: Add user_credits creation to signup trigger
-- Created: 2026-04-27

-- Update handle_new_user function to also create user_credits
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );

  -- Create user credits with 5 free monthly credits
  INSERT INTO public.user_credits (user_id, monthly_credits, purchased_credits, free_tier_used)
  VALUES (
    new.id,
    5,  -- 5 free credits per month for new users
    0,  -- no purchased credits initially
    0   -- free tier not used yet
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also backfill user_credits for existing users who don't have them yet
INSERT INTO public.user_credits (user_id, monthly_credits, purchased_credits, free_tier_used)
SELECT 
  p.id,
  5,  -- 5 free credits
  0,  -- no purchased credits
  0   -- free tier not used
FROM public.profiles p
LEFT JOIN public.user_credits uc ON uc.user_id = p.id
WHERE uc.user_id IS NULL;
