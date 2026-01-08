'use client';

import { useRouter } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, useAuth } from '@clerk/nextjs';
import { FileText, MessageSquare, Mail, ShoppingBag, Sparkles, PenTool, ArrowLeft } from 'lucide-react';

const templates = [
  {
    id: 'blog-post',
    name: 'Blog Post',
    description: 'Write a complete blog post on any topic',
    icon: FileText,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'social-media',
    name: 'Social Media Post',
    description: 'Create engaging posts for Twitter, LinkedIn, or Instagram',
    icon: MessageSquare,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Draft professional emails for any purpose',
    icon: Mail,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'product-description',
    name: 'Product Description',
    description: 'Write compelling product descriptions',
    icon: ShoppingBag,
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'content-idea',
    name: 'Content Ideas',
    description: 'Generate creative content ideas and topics',
    icon: Sparkles,
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'article',
    name: 'Article',
    description: 'Write long-form articles and guides',
    icon: PenTool,
    color: 'from-indigo-500 to-purple-500',
  },
];

function TemplateCard({ template, onSelect }: { template: typeof templates[0], onSelect: () => void }) {
  const Icon = template.icon;
  return (
    <button
      onClick={onSelect}
      className="group relative bg-gray-900/50 border-2 border-gray-800 hover:border-cyan-500/50 rounded-lg p-6 text-left transition-all hover:scale-105"
    >
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
      <p className="text-gray-400 text-sm">{template.description}</p>
      <div className="mt-4 text-cyan-400 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
        Create →
      </div>
    </button>
  );
}

export default function TemplatesPage() {
  const router = useRouter();
  const { userId } = useAuth();

  const handleTemplateClick = (templateId: string) => {
    if (userId) {
      router.push(`/create/${templateId}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-6 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-bold">BACK TO HOME</span>
        </button>

        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-white mb-4">
            What do you want to create?
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Pick a template, answer a few questions, and get your content in seconds
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {templates.map((template) => (
            <div key={template.id}>
              <SignedIn>
                <TemplateCard 
                  template={template} 
                  onSelect={() => handleTemplateClick(template.id)} 
                />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <TemplateCard 
                    template={template} 
                    onSelect={() => {}} 
                  />
                </SignInButton>
              </SignedOut>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
