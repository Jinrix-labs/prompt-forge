-- Workflows table
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    steps JSONB NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow executions table
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed'
    input_data JSONB,
    output_data JSONB,
    step_results JSONB,
    tokens_used INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- User usage tracking table (monthly workflow runs)
CREATE TABLE IF NOT EXISTS user_usage (
    user_id TEXT NOT NULL,
    month TEXT NOT NULL, -- Format: 'YYYY-MM'
    workflow_runs INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, month)
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    user_id TEXT PRIMARY KEY,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    tier TEXT NOT NULL DEFAULT 'pro', -- 'pro' or 'premium'
    status TEXT NOT NULL, -- 'active', 'canceled', 'past_due', etc.
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User credits table
CREATE TABLE IF NOT EXISTS user_credits (
    user_id TEXT PRIMARY KEY,
    credits INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_is_public ON workflows(is_public);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_user_id ON workflow_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_month ON user_usage(month);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id ON user_subscriptions(stripe_customer_id);

-- Row Level Security (RLS) policies
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- Policies for workflows
CREATE POLICY "Users can view their own workflows"
    ON workflows FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view public workflows"
    ON workflows FOR SELECT
    USING (is_public = true);

CREATE POLICY "Users can create their own workflows"
    ON workflows FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own workflows"
    ON workflows FOR UPDATE
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own workflows"
    ON workflows FOR DELETE
    USING (auth.uid()::text = user_id);

-- Policies for workflow_executions
CREATE POLICY "Users can view their own executions"
    ON workflow_executions FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own executions"
    ON workflow_executions FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

-- Policies for user_usage
CREATE POLICY "Users can view their own usage"
    ON user_usage FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own usage"
    ON user_usage FOR UPDATE
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own usage"
    ON user_usage FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

-- Policies for user_subscriptions
CREATE POLICY "Users can view their own subscription"
    ON user_subscriptions FOR SELECT
    USING (auth.uid()::text = user_id);

-- Policies for user_credits
CREATE POLICY "Users can view their own credits"
    ON user_credits FOR SELECT
    USING (auth.uid()::text = user_id);

