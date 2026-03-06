-- Enable RLS on all tables
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that use auth.uid() (won't work with Clerk)
DROP POLICY IF EXISTS "Users can view their own workflows" ON workflows;
DROP POLICY IF EXISTS "Users can view public workflows" ON workflows;
DROP POLICY IF EXISTS "Users can create their own workflows" ON workflows;
DROP POLICY IF EXISTS "Users can update their own workflows" ON workflows;
DROP POLICY IF EXISTS "Users can delete their own workflows" ON workflows;
DROP POLICY IF EXISTS "Users can view their own executions" ON workflow_executions;
DROP POLICY IF EXISTS "Users can create their own executions" ON workflow_executions;
DROP POLICY IF EXISTS "Users can view their own usage" ON user_usage;
DROP POLICY IF EXISTS "Users can update their own usage" ON user_usage;
DROP POLICY IF EXISTS "Users can insert their own usage" ON user_usage;
DROP POLICY IF EXISTS "Users can view their own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can view their own credits" ON user_credits;

-- IMPORTANT: Your API routes use service_role key which BYPASSES RLS
-- So these policies only affect direct anon key access (which you shouldn't use)

-- Block all anon access - API routes use service role so they'll work fine
CREATE POLICY "Block anon workflows" ON workflows FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "Block anon executions" ON workflow_executions FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "Block anon usage" ON user_usage FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "Block anon subscriptions" ON user_subscriptions FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "Block anon credits" ON user_credits FOR ALL USING (false) WITH CHECK (false);
