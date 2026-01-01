'use client';

import { useRouter } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { Play, Zap, Share2, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Automate Your AI Workflows
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Chain multiple AI prompts together to create powerful content workflows. 
          No coding required.
        </p>
        
        <div className="flex gap-4 justify-center">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition">
                Get Started Free
              </button>
            </SignInButton>
          </SignedOut>
          
          <SignedIn>
            <button 
              onClick={() => router.push('/workflows')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </button>
          </SignedIn>
          
          <button 
            onClick={() => router.push('/workflows?public=true')}
            className="border-2 border-gray-300 px-8 py-3 rounded-lg text-lg font-medium hover:border-gray-400 transition"
          >
            Browse Templates
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Zap className="w-8 h-8 text-blue-600" />}
            title="Multi-Step Workflows"
            description="Chain prompts together to create complex content pipelines"
          />
          <FeatureCard 
            icon={<Play className="w-8 h-8 text-blue-600" />}
            title="One-Click Execution"
            description="Run your entire workflow with a single click. No copy-pasting between tools."
          />
          <FeatureCard 
            icon={<Share2 className="w-8 h-8 text-blue-600" />}
            title="Share & Clone"
            description="Browse public workflows and clone them to customize for your needs"
          />
        </div>
      </div>

      {/* Use Cases */}
      <div className="max-w-6xl mx-auto px-4 py-16 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12">
          Perfect For
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <UseCaseCard 
            title="Content Creators"
            items={[
              "Generate LinkedIn posts with proper character limits",
              "Create Twitter threads automatically",
              "Write blog post outlines and drafts"
            ]}
          />
          <UseCaseCard 
            title="Marketers"
            items={[
              "Build email campaigns from product features",
              "Generate ad copy variations",
              "Create SEO-optimized content"
            ]}
          />
          <UseCaseCard 
            title="Entrepreneurs"
            items={[
              "Write product descriptions",
              "Generate social media content calendars",
              "Create pitch decks and presentations"
            ]}
          />
          <UseCaseCard 
            title="Agencies"
            items={[
              "Standardize client deliverables",
              "Create reusable content templates",
              "Scale content production"
            ]}
          />
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Start Building Workflows Today
        </h2>
        <p className="text-gray-600 mb-8">
          Free tier includes 10 workflow runs per month. No credit card required.
        </p>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition">
              Get Started Free
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <div className="text-center p-6">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function UseCaseCard({ title, items }: any) {
  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <ul className="space-y-2">
        {items.map((item: string, i: number) => (
          <li key={i} className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

