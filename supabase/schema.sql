-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (linked to Supabase Auth)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Sites table
CREATE TABLE public.sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subdomain text UNIQUE NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  content_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  deployed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Custom domains table (for future use)
CREATE TABLE public.custom_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  hostname text UNIQUE NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  verified_at timestamptz
);

-- AI Generations table
CREATE TABLE public.ai_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  prompt text NOT NULL,
  model text NOT NULL,
  output jsonb NOT NULL,
  version text NOT NULL,
  site_version_id uuid REFERENCES public.site_versions(id),
  created_at timestamptz DEFAULT now()
);

-- Site Versions table (for rollback)
CREATE TABLE public.site_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  content_json jsonb NOT NULL,
  created_by_user_id uuid REFERENCES public.profiles(id),
  created_by_type text NOT NULL DEFAULT 'user' CHECK (created_by_type IN ('user', 'ai', 'system')),
  change_summary text,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Prompt Recipes table
CREATE TABLE public.prompt_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  template_id text NOT NULL,
  original_prompt text NOT NULL,
  theme_preset text NOT NULL,
  seed_content jsonb,
  is_public boolean DEFAULT false,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Site Analytics table
CREATE TABLE public.site_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  path text,
  referrer text,
  country text,
  device_type text,
  viewed_at timestamptz DEFAULT now()
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id text UNIQUE NOT NULL,
  stripe_customer_id text,
  stripe_price_id text,
  status text NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'unpaid', 'trialing')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_sites_user_id ON public.sites(user_id);
CREATE INDEX idx_sites_subdomain ON public.sites(subdomain);
CREATE INDEX idx_sites_status ON public.sites(status);
CREATE INDEX idx_site_versions_site_id ON public.site_versions(site_id);
CREATE INDEX idx_ai_generations_site_id ON public.ai_generations(site_id);
CREATE INDEX idx_site_analytics_site_id ON public.site_analytics(site_id);
CREATE INDEX idx_site_analytics_viewed_at ON public.site_analytics(viewed_at);
CREATE INDEX idx_custom_domains_hostname ON public.custom_domains(hostname);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- Row Level Security Policies

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Sites
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sites"
ON public.sites
FOR ALL
USING (auth.uid() = user_id);

-- Custom Domains
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own custom domains"
ON public.custom_domains
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.sites s
    WHERE s.id = custom_domains.site_id
      AND s.user_id = auth.uid()
  )
);

-- Site Versions
ALTER TABLE public.site_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read versions of own sites"
ON public.site_versions
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.sites s
    WHERE s.id = site_versions.site_id
      AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert versions for own sites"
ON public.site_versions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.sites s
    WHERE s.id = site_versions.site_id
      AND s.user_id = auth.uid()
  )
);

-- AI Generations
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read generations of own sites"
ON public.ai_generations
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.sites s
    WHERE s.id = ai_generations.site_id
      AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert generations for own sites"
ON public.ai_generations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.sites s
    WHERE s.id = ai_generations.site_id
      AND s.user_id = auth.uid()
  )
);

-- Prompt Recipes
ALTER TABLE public.prompt_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own recipes"
ON public.prompt_recipes
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read public recipes"
ON public.prompt_recipes
FOR SELECT
USING (is_public = true);

-- Site Analytics
ALTER TABLE public.site_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics"
ON public.site_analytics
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can read analytics for own sites"
ON public.site_analytics
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.sites s
    WHERE s.id = site_analytics.site_id
      AND s.user_id = auth.uid()
  )
);

-- Subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own subscriptions"
ON public.subscriptions
FOR ALL
USING (auth.uid() = user_id);

-- Function to handle profile creation on signup
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

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on sites
CREATE TRIGGER update_sites_updated_at
BEFORE UPDATE ON public.sites
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update updated_at on subscriptions
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
