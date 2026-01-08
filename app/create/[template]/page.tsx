'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';

const templateConfigs: Record<string, {
  name: string;
  questions: Array<{ key: string; label: string; placeholder: string; type: 'text' | 'textarea' }>;
  workflowId?: string; // We'll create workflows for each template
}> = {
  'blog-post': {
    name: 'Blog Post',
    questions: [
      { key: 'topic', label: 'What topic do you want to write about?', placeholder: 'e.g., How to use AI for productivity', type: 'textarea' },
      { key: 'audience', label: 'Who is your audience?', placeholder: 'e.g., Small business owners, Students, Tech professionals', type: 'text' },
      { key: 'tone', label: 'What tone should it have?', placeholder: 'e.g., Professional, Casual, Friendly, Educational', type: 'text' },
      { key: 'length', label: 'How long should it be?', placeholder: 'e.g., Short (500 words), Medium (1000 words), Long (2000+ words)', type: 'text' },
    ],
  },
  'social-media': {
    name: 'Social Media Post',
    questions: [
      { key: 'message', label: 'What\'s your message?', placeholder: 'What do you want to say?', type: 'textarea' },
      { key: 'platform', label: 'Which platform?', placeholder: 'Twitter, LinkedIn, Instagram, Facebook', type: 'text' },
      { key: 'tone', label: 'What tone?', placeholder: 'Professional, Casual, Funny, Inspirational', type: 'text' },
    ],
  },
  'email': {
    name: 'Email',
    questions: [
      { key: 'purpose', label: 'What\'s the purpose of this email?', placeholder: 'e.g., Follow-up, Introduction, Thank you, Request', type: 'text' },
      { key: 'recipient', label: 'Who is it for?', placeholder: 'e.g., Client, Colleague, Customer', type: 'text' },
      { key: 'message', label: 'What do you want to say?', placeholder: 'The main message or key points', type: 'textarea' },
      { key: 'tone', label: 'What tone?', placeholder: 'Professional, Friendly, Formal, Casual', type: 'text' },
    ],
  },
  'product-description': {
    name: 'Product Description',
    questions: [
      { key: 'product', label: 'What product or service?', placeholder: 'e.g., Project management software for remote teams', type: 'textarea' },
      { key: 'features', label: 'Key features or benefits?', placeholder: 'List the main features or benefits', type: 'textarea' },
      { key: 'audience', label: 'Who is it for?', placeholder: 'e.g., Small business owners, Freelancers', type: 'text' },
    ],
  },
  'content-idea': {
    name: 'Content Ideas',
    questions: [
      { key: 'topic', label: 'What topic or niche?', placeholder: 'e.g., Productivity, Marketing, Technology', type: 'text' },
      { key: 'format', label: 'What format?', placeholder: 'e.g., Blog posts, Social media, Videos, Podcasts', type: 'text' },
      { key: 'count', label: 'How many ideas?', placeholder: 'e.g., 5, 10, 20', type: 'text' },
    ],
  },
  'article': {
    name: 'Article',
    questions: [
      { key: 'topic', label: 'What topic?', placeholder: 'The main topic of your article', type: 'textarea' },
      { key: 'angle', label: 'What angle or perspective?', placeholder: 'e.g., Beginner guide, Expert analysis, How-to tutorial', type: 'text' },
      { key: 'audience', label: 'Who is your audience?', placeholder: 'e.g., Beginners, Experts, General audience', type: 'text' },
      { key: 'length', label: 'How long?', placeholder: 'e.g., Short (800 words), Medium (1500 words), Long (3000+ words)', type: 'text' },
    ],
  },
};

export default function CreateTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const { userId } = useAuth();
  const templateId = params.template as string;
  const config = templateConfigs[templateId];

  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  if (!config) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Template not found</p>
          <button
            onClick={() => router.push('/')}
            className="text-cyan-400 hover:text-cyan-300 underline"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Initialize inputs
  if (Object.keys(inputs).length === 0 && config.questions.length > 0) {
    const initial: Record<string, string> = {};
    config.questions.forEach(q => {
      initial[q.key] = '';
    });
    setInputs(initial);
  }

  async function generate() {
    if (!userId) {
      router.push('/sign-in');
      return;
    }

    // Check if all required fields are filled
    const emptyFields = config.questions.filter(q => !inputs[q.key]?.trim());
    if (emptyFields.length > 0) {
      alert(`Please fill in: ${emptyFields.map(f => f.label).join(', ')}`);
      return;
    }

    setGenerating(true);
    setResult(null);

    try {
      const res = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: buildPrompt(config, inputs),
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setResult(data.output || 'Generated content');
      } else {
        alert(data.error || 'Failed to generate content');
      }
    } catch (error: any) {
      console.error('Generate error:', error);
      alert('Failed to generate content');
    } finally {
      setGenerating(false);
    }
  }

  function buildPrompt(config: typeof templateConfigs[string], inputs: Record<string, string>): string {
    // Build a natural prompt based on template and inputs
    let prompt = `Create a ${config.name.toLowerCase()}`;
    
    config.questions.forEach(q => {
      if (inputs[q.key]) {
        prompt += `\n${q.label}: ${inputs[q.key]}`;
      }
    });

    prompt += '\n\nPlease create high-quality, engaging content based on the above information.';
    
    return prompt;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-6 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-bold">BACK</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">
            Create {config.name}
          </h1>
          <p className="text-gray-400">
            Answer a few questions and we'll create it for you
          </p>
        </div>

        {/* Form */}
        <div className="border-2 border-fuchsia-500/30 bg-gray-900/50 backdrop-blur p-6 mb-6">
          <div className="space-y-6">
            {config.questions.map((question) => (
              <div key={question.key}>
                <label className="block text-sm font-bold text-cyan-400 mb-2">
                  {question.label}
                </label>
                {question.type === 'textarea' ? (
                  <textarea
                    value={inputs[question.key] || ''}
                    onChange={(e) => setInputs({ ...inputs, [question.key]: e.target.value })}
                    placeholder={question.placeholder}
                    rows={4}
                    className="w-full px-4 py-3 bg-black border-2 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none resize-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={inputs[question.key] || ''}
                    onChange={(e) => setInputs({ ...inputs, [question.key]: e.target.value })}
                    placeholder={question.placeholder}
                    className="w-full px-4 py-3 bg-black border-2 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                  />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={generate}
            disabled={generating}
            className="mt-6 w-full flex items-center justify-center gap-2 border-2 border-cyan-500 bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black font-bold px-6 py-3 transition-all disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                CREATING...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                CREATE {config.name.toUpperCase()}
              </>
            )}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="border-2 border-cyan-500/30 bg-cyan-900/10 rounded-lg p-6">
            <h2 className="text-xl font-black text-cyan-400 mb-4">YOUR {config.name.toUpperCase()}</h2>
            <div className="bg-black/50 border border-gray-800 p-4 rounded">
              <pre className="whitespace-pre-wrap break-words text-white font-mono text-sm">
                {result}
              </pre>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(result);
                alert('Copied to clipboard!');
              }}
              className="mt-4 w-full border-2 border-cyan-500 bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black font-bold px-6 py-2 transition-all"
            >
              COPY
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
