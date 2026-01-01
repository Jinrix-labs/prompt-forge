/**
 * Seed workflow templates into the database
 * Run this script to create public workflow templates that users can clone
 * 
 * Usage: 
 * 1. Set your environment variables
 * 2. Run: npx tsx scripts/seed-workflow-templates.ts
 * Or use the API endpoint: POST /api/workflows/seed-templates
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

async function seedTemplates() {
    console.log('🌱 Seeding workflow templates...\n');

    for (const template of templates) {
        try {
            // Check if template already exists
            const { data: existing } = await supabase
                .from('workflows')
                .select('id, name')
                .eq('name', template.name)
                .eq('is_public', true)
                .single();

            if (existing) {
                console.log(`⏭️  Skipping "${template.name}" (already exists)`);
                continue;
            }

            // Insert template (using a system user ID or null)
            const { data, error } = await supabase
                .from('workflows')
                .insert({
                    user_id: 'system', // Or use a specific admin user ID
                    name: template.name,
                    description: template.description,
                    steps: template.steps,
                    is_public: template.is_public,
                })
                .select()
                .single();

            if (error) {
                console.error(`❌ Error creating "${template.name}":`, error.message);
            } else {
                console.log(`✅ Created "${template.name}" (ID: ${data.id})`);
            }
        } catch (error: any) {
            console.error(`❌ Error with "${template.name}":`, error.message);
        }
    }

    console.log('\n✨ Seeding complete!');
}

// Run if called directly
if (require.main === module) {
    seedTemplates()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

export { seedTemplates, templates };

