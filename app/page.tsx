'use client';

import { useRouter } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { FileText, MessageSquare, Mail, ShoppingBag, Sparkles, PenTool, Zap, Clock, CheckCircle, ArrowRight } from 'lucide-react';

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

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="mb-8">
            <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
              Create Content
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">
                In Seconds
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-8">
              No complex workflows. No technical jargon. Just pick a template, answer a few questions, and get professional content instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <SignedIn>
                <button
                  onClick={() => router.push('/templates')}
                  className="border-2 border-cyan-500 bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black font-bold px-8 py-4 rounded-lg transition-all text-lg flex items-center gap-2"
                >
                  Start Creating
                  <ArrowRight className="w-5 h-5" />
                </button>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="border-2 border-cyan-500 bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black font-bold px-8 py-4 rounded-lg transition-all text-lg flex items-center gap-2">
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </SignInButton>
              </SignedOut>
              <a
                href="https://www.producthunt.com/posts/zunno"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-orange-500 bg-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-black font-bold px-8 py-4 rounded-lg transition-all text-lg"
              >
                🚀 Support on Product Hunt
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16">
            <div>
              <div className="text-3xl font-black text-cyan-400 mb-2">6+</div>
              <div className="text-gray-400 text-sm">Templates</div>
            </div>
            <div>
              <div className="text-3xl font-black text-cyan-400 mb-2">30s</div>
              <div className="text-gray-400 text-sm">Average Time</div>
            </div>
            <div>
              <div className="text-3xl font-black text-cyan-400 mb-2">100%</div>
              <div className="text-gray-400 text-sm">No Code</div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-4xl font-black text-center text-white mb-12">
            Why Choose Zunno?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900/50 border-2 border-gray-800 rounded-lg p-6">
              <Zap className="w-10 h-10 text-cyan-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Lightning Fast</h3>
              <p className="text-gray-400">
                Get professional content in seconds. No waiting, no delays.
              </p>
            </div>
            <div className="bg-gray-900/50 border-2 border-gray-800 rounded-lg p-6">
              <Clock className="w-10 h-10 text-cyan-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Dead Simple</h3>
              <p className="text-gray-400">
                No technical knowledge needed. Just answer questions and get results.
              </p>
            </div>
            <div className="bg-gray-900/50 border-2 border-gray-800 rounded-lg p-6">
              <CheckCircle className="w-10 h-10 text-cyan-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Professional Quality</h3>
              <p className="text-gray-400">
                AI-powered content that's ready to use. No editing required.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-4xl font-black text-center text-white mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-fuchsia-500 flex items-center justify-center text-2xl font-black mb-4 mx-auto">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Pick a Template</h3>
              <p className="text-gray-400">
                Choose from blog posts, social media, emails, and more
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-fuchsia-500 flex items-center justify-center text-2xl font-black mb-4 mx-auto">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Answer Questions</h3>
              <p className="text-gray-400">
                Simple, plain-language questions. No technical jargon.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-fuchsia-500 flex items-center justify-center text-2xl font-black mb-4 mx-auto">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Get Your Content</h3>
              <p className="text-gray-400">
                Professional content ready to use. Copy and go!
              </p>
            </div>
          </div>
        </section>

        {/* Templates Preview Section */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">
              What can you create?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Choose from 6+ professional templates
            </p>
            <SignedIn>
              <button
                onClick={() => router.push('/templates')}
                className="border-2 border-cyan-500 bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black font-bold px-8 py-3 rounded-lg transition-all text-lg"
              >
                View All Templates
              </button>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="border-2 border-cyan-500 bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black font-bold px-8 py-3 rounded-lg transition-all text-lg">
                  View All Templates
                </button>
              </SignInButton>
            </SignedOut>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.slice(0, 6).map((template) => {
              const Icon = template.icon;
              return (
                <div
                  key={template.id}
                  className="bg-gray-900/50 border-2 border-gray-800 rounded-lg p-6"
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
                  <p className="text-gray-400 text-sm">{template.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 border-2 border-cyan-500/30 rounded-2xl p-12">
            <h2 className="text-4xl font-black text-white mb-4">
              Ready to Create?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Start creating professional content in seconds. No credit card required.
            </p>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="border-2 border-cyan-500 bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black font-bold px-8 py-4 rounded-lg transition-all text-lg">
                  Get Started Free
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <button
                onClick={() => router.push('/templates')}
                className="border-2 border-cyan-500 bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black font-bold px-8 py-4 rounded-lg transition-all text-lg"
              >
                Start Creating
              </button>
            </SignedIn>
          </div>
        </section>
      </div>
    </div>
  );
}
