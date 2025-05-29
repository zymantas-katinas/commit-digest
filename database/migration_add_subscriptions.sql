-- Migration: Add subscription and billing tables for Stripe integration
-- Run this script in your Supabase SQL Editor

-- Create plans table to define available subscription plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_usd DECIMAL(10, 2) NOT NULL,
  stripe_price_id TEXT UNIQUE,
  stripe_product_id TEXT,
  monthly_runs_limit INTEGER NOT NULL,
  max_repositories INTEGER NOT NULL,
  max_reports INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table to extend auth.users with additional data
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  current_plan_id UUID REFERENCES subscription_plans(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table to track Stripe subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES subscription_plans(id) NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create billing_events table for webhook events and audit trail
CREATE TABLE IF NOT EXISTS billing_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer_id ON user_profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_current_plan_id ON user_profiles(current_plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_billing_events_user_id ON billing_events(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_stripe_event_id ON billing_events(stripe_event_id);

-- Enable Row Level Security
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Subscription plans are readable by all authenticated users
CREATE POLICY "Subscription plans are viewable by authenticated users" ON subscription_plans
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can only access their own profile
CREATE POLICY "Users can manage their own profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);

-- Users can only access their own subscriptions
CREATE POLICY "Users can manage their own subscriptions" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Users can only access their own billing events
CREATE POLICY "Users can view their own billing events" ON billing_events
  FOR SELECT USING (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default plans
INSERT INTO subscription_plans (name, description, price_usd, monthly_runs_limit, max_repositories, max_reports, stripe_price_id, stripe_product_id) VALUES
  ('Free', 'Free tier with basic features', 0.00, 50, 1, 5, NULL, NULL),
  ('Pro', 'Professional plan with advanced features', 15.00, 500, 10, 50, NULL, NULL)
ON CONFLICT DO NOTHING;

-- Create function to get user's effective limits
CREATE OR REPLACE FUNCTION get_user_limits(p_user_id UUID)
RETURNS TABLE(
  monthly_runs_limit INTEGER,
  max_repositories INTEGER,
  max_reports INTEGER,
  plan_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(sp.monthly_runs_limit, 50) as monthly_runs_limit,
    COALESCE(sp.max_repositories, 1) as max_repositories,
    COALESCE(sp.max_reports, 5) as max_reports,
    COALESCE(sp.name, 'Free') as plan_name
  FROM user_profiles up
  LEFT JOIN subscription_plans sp ON up.current_plan_id = sp.id
  WHERE up.id = p_user_id
  
  UNION ALL
  
  -- Default to free plan if no profile exists
  SELECT 50, 1, 5, 'Free'
  WHERE NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = p_user_id)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to automatically create user profile on user creation
CREATE OR REPLACE FUNCTION create_user_profile_on_signup()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Get the free plan ID
  SELECT id INTO free_plan_id FROM subscription_plans WHERE name = 'Free' LIMIT 1;
  
  -- Insert user profile with free plan
  INSERT INTO user_profiles (id, current_plan_id)
  VALUES (NEW.id, free_plan_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile_on_signup();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_limits(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_profile_on_signup() TO authenticated;

-- Verify tables were created
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('subscription_plans', 'user_profiles', 'subscriptions', 'billing_events')
ORDER BY table_name; 