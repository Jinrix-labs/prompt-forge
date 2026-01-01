import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Only allow admins or dev users to seed templates
const ADMIN_USER_IDS = process.env.DEV_USER_IDS?.split(',').map(id => id.trim()) || [];

const templates = [
    {
        name: 'LinkedIn Post Generator',
        description: 'Generate professional LinkedIn posts with a 3,000 character limit',
        is_public: true,
        steps: [
            {
                id: 'step_1',
                name: 'Generate LinkedIn Post',
                type: 'prompt_generation',
                config: {
                    model: 'claude',
                    promptTemplate: 'Write a professional LinkedIn post about: {{topic}}\n\nRequirements:\n- Engaging and professional tone\n- Include a hook in the first line\n- Add value with insights or tips\n- End with a question to encourage engagement\n- Use appropriate hashtags',
                    maxCharacters: 3000,
                },
                inputs: {
                    topic: 'user_input.topic',
                },
                outputKey: 'linkedin_post',
            },
        ],
    },
    {
        name: 'Twitter Thread Creator',
        description: 'Create a Twitter thread with multiple tweets, each under 280 characters',
        is_public: true,
        steps: [
            {
                id: 'step_1',
                name: 'Create Thread Outline',
                type: 'prompt_generation',
                config: {
                    model: 'claude',
                    promptTemplate: 'Create an outline for a Twitter thread about: {{topic}}\n\nProvide 3-5 key points that can each be explained in a single tweet.',
                    maxWords: 50,
                },
                inputs: {
                    topic: 'user_input.topic',
                },
                outputKey: 'outline',
            },
            {
                id: 'step_2',
                name: 'Write Tweet 1',
                type: 'prompt_generation',
                config: {
                    model: 'claude',
                    promptTemplate: 'Write the first tweet of a thread about: {{topic}}\n\nBased on this outline: {{step_1.outline}}\n\nMake it engaging and hook the reader.',
                    maxCharacters: 280,
                },
                inputs: {
                    topic: 'user_input.topic',
                    outline: 'step_1.outline',
                },
                outputKey: 'tweet_1',
            },
            {
                id: 'step_3',
                name: 'Write Tweet 2',
                type: 'prompt_generation',
                config: {
                    model: 'claude',
                    promptTemplate: 'Write the second tweet continuing the thread about: {{topic}}\n\nOutline: {{step_1.outline}}\n\nContinue from the first tweet naturally.',
                    maxCharacters: 280,
                },
                inputs: {
                    topic: 'user_input.topic',
                    outline: 'step_1.outline',
                },
                outputKey: 'tweet_2',
            },
        ],
    },
    {
        name: 'Blog Post Outliner',
        description: 'Generate a comprehensive blog post outline with sections and key points',
        is_public: true,
        steps: [
            {
                id: 'step_1',
                name: 'Generate Outline',
                type: 'prompt_generation',
                config: {
                    model: 'claude',
                    promptTemplate: 'Create a detailed blog post outline for: {{topic}}\n\nInclude:\n- Compelling title\n- Introduction hook\n- 3-5 main sections with sub-points\n- Conclusion\n- Call to action',
                },
                inputs: {
                    topic: 'user_input.topic',
                },
                outputKey: 'outline',
            },
        ],
    },
    {
        name: 'Product Description Writer',
        description: 'Create SEO-friendly product descriptions optimized for meta tags (150 characters)',
        is_public: true,
        steps: [
            {
                id: 'step_1',
                name: 'Write Product Description',
                type: 'prompt_generation',
                config: {
                    model: 'claude',
                    promptTemplate: 'Write a compelling product description for: {{product_name}}\n\nKey features: {{features}}\n\nMake it SEO-friendly and include the most important benefits.',
                    maxCharacters: 150,
                },
                inputs: {
                    product_name: 'user_input.product_name',
                    features: 'user_input.features',
                },
                outputKey: 'description',
            },
        ],
    },
    {
        name: 'Email Subject Line Generator',
        description: 'Generate multiple email subject lines under 60 characters for A/B testing',
        is_public: true,
        steps: [
            {
                id: 'step_1',
                name: 'Generate Subject Lines',
                type: 'prompt_generation',
                config: {
                    model: 'claude',
                    promptTemplate: 'Generate 5 email subject lines for: {{email_purpose}}\n\nTarget audience: {{audience}}\n\nEach subject line must be under 60 characters, engaging, and action-oriented.',
                    maxCharacters: 60,
                },
                inputs: {
                    email_purpose: 'user_input.email_purpose',
                    audience: 'user_input.audience',
                },
                outputKey: 'subject_lines',
            },
        ],
    },
    {
        name: 'Social Media Caption Generator',
        description: 'Create engaging Instagram/Facebook captions with hashtags',
        is_public: true,
        steps: [
            {
                id: 'step_1',
                name: 'Generate Caption',
                type: 'prompt_generation',
                config: {
                    model: 'claude',
                    promptTemplate: 'Write an engaging social media caption for: {{content_description}}\n\nPlatform: {{platform}}\n\nInclude:\n- Hook in first line\n- Engaging body text\n- Relevant hashtags (5-10)\n- Call to action',
                },
                inputs: {
                    content_description: 'user_input.content_description',
                    platform: 'user_input.platform',
                },
                outputKey: 'caption',
            },
        ],
    },
    {
        name: 'SEO Meta Description Writer',
        description: 'Create SEO-optimized meta descriptions (160 characters) for web pages',
        is_public: true,
        steps: [
            {
                id: 'step_1',
                name: 'Write Meta Description',
                type: 'prompt_generation',
                config: {
                    model: 'claude',
                    promptTemplate: 'Write an SEO-optimized meta description for a page about: {{page_topic}}\n\nTarget keyword: {{keyword}}\n\nMake it compelling, include the keyword naturally, and encourage clicks.',
                    maxCharacters: 160,
                },
                inputs: {
                    page_topic: 'user_input.page_topic',
                    keyword: 'user_input.keyword',
                },
                outputKey: 'meta_description',
            },
        ],
    },
    {
        name: 'Content Repurposer',
        description: 'Transform long-form content into multiple short-form pieces',
        is_public: true,
        steps: [
            {
                id: 'step_1',
                name: 'Extract Key Points',
                type: 'prompt_generation',
                config: {
                    model: 'claude',
                    promptTemplate: 'Extract the 5 most important key points from this content:\n\n{{content}}',
                },
                inputs: {
                    content: 'user_input.content',
                },
                outputKey: 'key_points',
            },
            {
                id: 'step_2',
                name: 'Create Twitter Post',
                type: 'prompt_generation',
                config: {
                    model: 'claude',
                    promptTemplate: 'Create a Twitter post (280 chars max) based on these key points:\n\n{{step_1.key_points}}',
                    maxCharacters: 280,
                },
                inputs: {
                    key_points: 'step_1.key_points',
                },
                outputKey: 'twitter_post',
            },
            {
                id: 'step_3',
                name: 'Create LinkedIn Post',
                type: 'prompt_generation',
                config: {
                    model: 'claude',
                    promptTemplate: 'Create a LinkedIn post (3,000 chars max) based on these key points:\n\n{{step_1.key_points}}',
                    maxCharacters: 3000,
                },
                inputs: {
                    key_points: 'step_1.key_points',
                },
                outputKey: 'linkedin_post',
            },
        ],
    },
];

export async function POST() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only allow admins to seed templates
        if (!ADMIN_USER_IDS.includes(userId)) {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        const results = [];
        let created = 0;
        let skipped = 0;

        for (const template of templates) {
            try {
                // Check if template already exists
                const { data: existing } = await supabaseAdmin
                    .from('workflows')
                    .select('id, name')
                    .eq('name', template.name)
                    .eq('is_public', true)
                    .single();

                if (existing) {
                    results.push({ name: template.name, status: 'skipped', reason: 'already exists' });
                    skipped++;
                    continue;
                }

                // Insert template
                const { data, error } = await supabaseAdmin
                    .from('workflows')
                    .insert({
                        user_id: userId, // Use admin user ID
                        name: template.name,
                        description: template.description,
                        steps: template.steps,
                        is_public: template.is_public,
                    })
                    .select()
                    .single();

                if (error) {
                    results.push({ name: template.name, status: 'error', error: error.message });
                } else {
                    results.push({ name: template.name, status: 'created', id: data.id });
                    created++;
                }
            } catch (error: any) {
                results.push({ name: template.name, status: 'error', error: error.message });
            }
        }

        return NextResponse.json({
            success: true,
            created,
            skipped,
            total: templates.length,
            results,
        });
    } catch (error: any) {
        console.error('Seed templates error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

