import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client (needs service role key for admin operations)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Workflows can take longer

export async function POST(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { workflowId, inputs } = await request.json();

        if (!workflowId) {
            return NextResponse.json({ error: 'Missing workflowId' }, { status: 400 });
        }

        // Get the workflow - allow user's own workflows OR public workflows
        const { data: workflow, error: workflowError } = await supabaseAdmin
            .from('workflows')
            .select('*')
            .eq('id', workflowId)
            .or(`user_id.eq.${userId},is_public.eq.true`)
            .single();

        if (workflowError || !workflow) {
            return NextResponse.json({ error: 'Workflow not found or not accessible' }, { status: 404 });
        }

        // Check and increment workflow usage
        const month = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

        // Get current usage
        const { data: usage } = await supabaseAdmin
            .from('user_usage')
            .select('*')
            .eq('user_id', userId)
            .eq('month', month)
            .single();

        const currentRuns = usage?.workflow_runs || 0;

        // Check if user is a developer (free Pro access - unlimited)
        const devUserIds = process.env.DEV_USER_IDS?.split(',').map(id => id.trim()) || [];
        const isDev = devUserIds.includes(userId);

        if (!isDev) {
            // Get user's subscription tier (check new table first, fallback to users table)
            const { data: subscription } = await supabaseAdmin
                .from('user_subscriptions')
                .select('tier, status')
                .eq('user_id', userId)
                .eq('status', 'active')
                .single();

            let tier = subscription?.tier || 'free';

            // Fallback: check users table for backward compatibility
            if (!subscription) {
                const { data: user } = await supabaseAdmin
                    .from('users')
                    .select('subscription_status')
                    .eq('id', userId)
                    .single();

                if (user?.subscription_status === 'pro' || user?.subscription_status === 'premium') {
                    tier = user.subscription_status;
                }
            }

            // Get limits based on tier
            const limits: Record<string, number> = {
                free: 10,      // Sweet spot for trial
                pro: 300,      // Daily active users
                premium: 1000, // Power users
            };

            const userLimit = limits[tier] || limits.free;

            // Also check credits
            const { data: credits } = await supabaseAdmin
                .from('user_credits')
                .select('credits')
                .eq('user_id', userId)
                .single();

            const availableCredits = credits?.credits || 0;

            // Allow execution if:
            // 1. Under monthly limit, OR
            // 2. Has available credits
            if (currentRuns >= userLimit && availableCredits === 0) {
                return NextResponse.json(
                    {
                        error: `Monthly limit reached (${currentRuns}/${userLimit}) and no credits available. Please upgrade or purchase credits.`,
                        upgrade: tier === 'free',
                    },
                    { status: 429 }
                );
            }

            // If using credits, decrement them instead of counting toward monthly limit
            if (currentRuns >= userLimit && availableCredits > 0) {
                await supabaseAdmin
                    .from('user_credits')
                    .update({
                        credits: availableCredits - 1,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('user_id', userId);
            } else {
                // Use monthly allowance
                await supabaseAdmin
                    .from('user_usage')
                    .upsert({
                        user_id: userId,
                        month,
                        workflow_runs: currentRuns + 1,
                        updated_at: new Date().toISOString(),
                    }, {
                        onConflict: 'user_id,month'
                    });
            }
        }

        // Create execution record
        const { data: execution, error: execError } = await supabaseAdmin
            .from('workflow_executions')
            .insert({
                workflow_id: workflowId,
                user_id: userId,
                status: 'running',
                input_data: inputs || {},
            })
            .select()
            .single();

        if (execError) {
            console.error('Failed to create execution:', execError);
            return NextResponse.json({ error: 'Failed to create execution' }, { status: 500 });
        }

        // Execute workflow steps
        const context: Record<string, any> = { 
            user_input: inputs || {},
            ...inputs // Spread inputs into context for easy access
        };
        const stepResults: any[] = [];
        let totalTokens = 0;

        try {
            for (let i = 0; i < workflow.steps.length; i++) {
                const step = workflow.steps[i];
                
                try {
                    const result = await executeStep(step, context, userId);
                    
                    // Store result in context for next steps
                    // Use step.id or step.name as key
                    const outputKey = step.outputKey || step.id || `step_${i}`;
                    context[outputKey] = result.output;
                    
                    // Also store under step name if available
                    if (step.name) {
                        context[step.name] = result.output;
                    }

                    stepResults.push({
                        stepId: step.id || `step_${i}`,
                        stepName: step.name || `Step ${i + 1}`,
                        stepType: step.type,
                        output: result.output,
                        tokensUsed: result.tokensUsed || 0,
                        success: true,
                    });

                    totalTokens += result.tokensUsed || 0;

                } catch (error: any) {
                    console.error(`Step "${step.name || step.id}" failed:`, error);
                    
                    stepResults.push({
                        stepId: step.id || `step_${i}`,
                        stepName: step.name || `Step ${i + 1}`,
                        stepType: step.type,
                        error: error.message,
                        success: false,
                    });

                    // Mark execution as failed
                    await supabaseAdmin
                        .from('workflow_executions')
                        .update({
                            status: 'failed',
                            error_message: `Step "${step.name || step.id}" failed: ${error.message}`,
                            step_results: stepResults,
                            tokens_used: totalTokens,
                            completed_at: new Date().toISOString(),
                        })
                        .eq('id', execution.id);

                    return NextResponse.json({
                        error: `Step "${step.name || step.id}" failed: ${error.message}`,
                        stepResults,
                        executionId: execution.id,
                    }, { status: 500 });
                }
            }

            // Mark execution as completed
            const finalOutput = stepResults[stepResults.length - 1]?.output;

            await supabaseAdmin
                .from('workflow_executions')
                .update({
                    status: 'completed',
                    output_data: { result: finalOutput },
                    step_results: stepResults,
                    tokens_used: totalTokens,
                    completed_at: new Date().toISOString(),
                })
                .eq('id', execution.id);

            return NextResponse.json({
                success: true,
                executionId: execution.id,
                output: finalOutput,
                stepResults,
                tokensUsed: totalTokens,
            });

        } catch (error: any) {
            // Catch any unexpected errors
            await supabaseAdmin
                .from('workflow_executions')
                .update({
                    status: 'failed',
                    error_message: error.message,
                    step_results: stepResults,
                    tokens_used: totalTokens,
                    completed_at: new Date().toISOString(),
                })
                .eq('id', execution.id);

            throw error;
        }

    } catch (error: any) {
        console.error('Workflow execution error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error?.message },
            { status: 500 }
        );
    }
}

// Execute a single step based on its type
async function executeStep(
    step: any,
    context: Record<string, any>,
    _userId: string
): Promise<{ output: any; tokensUsed: number }> {
    // Resolve input variables from context
    const resolvedInputs: Record<string, string> = {};
    
    if (step.inputs) {
        for (const [key, source] of Object.entries(step.inputs)) {
            const value = resolveVariable(source as string, context);
            resolvedInputs[key] = value;
        }
    }

    switch (step.type) {
        case 'prompt_generation':
            return await executePromptGeneration(step, resolvedInputs, context);
        
        case 'text_transform':
            return executeTextTransform(step, resolvedInputs);
        
        case 'text_combine':
            return executeTextCombine(step, resolvedInputs);
        
        case 'variable_extract':
            return executeVariableExtract(step, resolvedInputs);
        
        default:
            throw new Error(`Unknown step type: ${step.type}`);
    }
}

// Resolve variables like "user_input.topic" or "step_1.research" or "{{variable_name}}"
function resolveVariable(source: string, context: Record<string, any>): string {
    if (!source) return '';
    
    // Handle template variables like {{variable_name}}
    if (source.includes('{{') && source.includes('}}')) {
        return source.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
            return context[varName]?.toString() || match;
        });
    }
    
    // Handle dot notation like "user_input.topic" or "step_1.output"
    if (source.includes('.')) {
        const parts = source.split('.');
        let value = context;
        
        for (const part of parts) {
            value = value?.[part];
            if (value === undefined || value === null) break;
        }
        
        return value?.toString() || '';
    }
    
    // Direct context lookup
    return context[source]?.toString() || source;
}

// Execute prompt generation step (reuses your existing prompt generation logic)
async function executePromptGeneration(
    step: any,
    inputs: Record<string, string>,
    context: Record<string, any>
): Promise<{ output: any; tokensUsed: number }> {
    const config = step.config || {};
    
    // Build prompt from template or use direct input
    let prompt = config.promptTemplate || inputs.prompt || inputs.userInput || '';
    
    // Replace template variables
    for (const [key, value] of Object.entries(inputs)) {
        prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
        prompt = prompt.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
    }

    // Also replace from context
    for (const [key, value] of Object.entries(context)) {
        if (typeof value === 'string') {
            prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
        }
    }

    // Add length constraints to the prompt
    if (config.maxCharacters || config.maxWords) {
        prompt += '\n\nIMPORTANT CONSTRAINTS:\n';
        
        if (config.maxCharacters) {
            prompt += `- Your response MUST be under ${config.maxCharacters} characters (including spaces).\n`;
        }
        
        if (config.maxWords) {
            prompt += `- Your response MUST be under ${config.maxWords} words.\n`;
        }
        
        prompt += '- Do NOT include any preamble, explanation, or meta-commentary.\n';
        prompt += '- Start your response immediately with the requested content.\n';
    }

    const model = config.model || 'claude';
    const useClaude = model === 'claude' || model === 'claude-haiku';

    if (useClaude) {
        if (!process.env.ANTHROPIC_API_KEY) {
            throw new Error('ANTHROPIC_API_KEY not configured');
        }

        const requestBody = {
            model: config.modelName || 'claude-3-haiku-20240307',
            max_tokens: config.maxTokens || 1000,
            messages: [
                {
                    role: 'user' as const,
                    content: prompt,
                },
            ],
        };

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Claude API error: ${errorText}`);
        }

        const data = await response.json();
        let output = '';
        
        for (const block of data.content || []) {
            if (block.type === 'text') {
                output = block.text.trim();
                break;
            }
        }

        // Enforce hard limits (in case AI didn't follow instructions)
        if (config.maxCharacters && output.length > config.maxCharacters) {
            output = output.substring(0, config.maxCharacters).trim();
            // Remove trailing incomplete word if truncated
            const lastSpace = output.lastIndexOf(' ');
            if (lastSpace > config.maxCharacters - 20) {
                output = output.substring(0, lastSpace);
            }
        }

        if (config.maxWords) {
            const words = output.split(/\s+/);
            if (words.length > config.maxWords) {
                output = words.slice(0, config.maxWords).join(' ');
            }
        }

        const tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);

        return { output, tokensUsed };
    } else {
        // Groq
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY not configured');
        }

        const requestBody = {
            model: config.modelName || 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: config.systemPrompt || 'You are a helpful assistant.' },
                { role: 'user', content: prompt },
            ],
            max_tokens: config.maxTokens || 1000,
            temperature: config.temperature || 0.7,
        };

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Groq API error: ${errorText}`);
        }

        const data = await response.json();
        let output = data.choices?.[0]?.message?.content?.trim() || '';

        // Enforce hard limits for Groq too (in case AI didn't follow instructions)
        if (config.maxCharacters && output.length > config.maxCharacters) {
            output = output.substring(0, config.maxCharacters).trim();
            // Remove trailing incomplete word if truncated
            const lastSpace = output.lastIndexOf(' ');
            if (lastSpace > config.maxCharacters - 20) {
                output = output.substring(0, lastSpace);
            }
        }

        if (config.maxWords) {
            const words = output.split(/\s+/);
            if (words.length > config.maxWords) {
                output = words.slice(0, config.maxWords).join(' ');
            }
        }

        return { output, tokensUsed: 0 }; // Groq doesn't always return token counts
    }
}

// Execute text transform step
function executeTextTransform(step: any, inputs: Record<string, string>): { output: string; tokensUsed: number } {
    const text = Object.values(inputs)[0] || '';
    const operation = step.config?.operation || 'trim';

    let output = text;

    switch (operation) {
        case 'uppercase':
            output = text.toUpperCase();
            break;
        case 'lowercase':
            output = text.toLowerCase();
            break;
        case 'trim':
            output = text.trim();
            break;
        case 'capitalize':
            output = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
            break;
        case 'extract':
            // Extract text between brackets or other patterns
            const pattern = step.config?.pattern || /\[([^\]]+)\]/;
            const match = text.match(pattern);
            output = match ? match[1] : text;
            break;
        case 'replace':
            // Replace pattern
            const find = step.config?.find || '';
            const replace = step.config?.replace || '';
            output = text.replace(new RegExp(find, 'g'), replace);
            break;
        default:
            output = text;
    }

    return { output, tokensUsed: 0 };
}

// Execute text combine step
function executeTextCombine(step: any, inputs: Record<string, string>): { output: string; tokensUsed: number } {
    const separator = step.config?.separator || '\n\n';
    const output = Object.values(inputs).filter(v => v).join(separator);

    return { output, tokensUsed: 0 };
}

// Execute variable extract step (extract structured data from text)
function executeVariableExtract(step: any, inputs: Record<string, string>): { output: any; tokensUsed: number } {
    const text = Object.values(inputs)[0] || '';
    const fields = step.config?.fields || [];
    
    // Simple extraction - can be enhanced with AI
    const output: Record<string, string> = {};
    
    for (const field of fields) {
        const pattern = step.config?.patterns?.[field] || new RegExp(`${field}:\\s*([^\\n]+)`, 'i');
        const match = text.match(pattern);
        output[field] = match ? match[1].trim() : '';
    }

    return { output, tokensUsed: 0 };
}

