'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

export default function HomePage() {
    return (
        <>
            <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .animate-fade-up   { animation: fadeUp 0.7s ease both; }
        .animate-fade-in   { animation: fadeIn 0.7s ease both; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }

        .shimmer-text {
          background: linear-gradient(
            90deg,
            #67e8f9 0%,
            #a5f3fc 30%,
            #fb923c 50%,
            #a5f3fc 70%,
            #67e8f9 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .card-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(103, 232, 249, 0.08);
        }

        .glow-btn {
          position: relative;
          overflow: hidden;
        }
        .glow-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% -20%, rgba(255,255,255,0.15) 0%, transparent 60%);
        }
        .glow-btn:hover::after {
          background: radial-gradient(circle at 50% -20%, rgba(255,255,255,0.25) 0%, transparent 60%);
        }
      `}</style>

            <main className="font-body bg-[#0c0c0e] text-white min-h-screen overflow-x-hidden">
                {/* ── HERO ──────────────────────────────────────────────────── */}
                <section className="relative pt-24 pb-20 px-6 text-center overflow-hidden">
                    {/* Warm background glow */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px]" />
                        <div className="absolute top-[60px] left-1/3 w-[300px] h-[300px] bg-orange-400/8 rounded-full blur-[100px]" />
                    </div>

                    <div className="relative max-w-6xl mx-auto mb-14 flex items-center justify-between">
                        <Link
                            href="/"
                            className="text-2xl font-black bg-gradient-to-r from-cyan-300 via-cyan-400 to-magenta-400 bg-clip-text text-transparent"
                        >
                            ZUNNO
                        </Link>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/pricing"
                                className="hidden sm:inline-block px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:border-white/20 font-semibold text-sm transition-colors"
                            >
                                Upgrade
                            </Link>
                            <SignedOut>
                                <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                                    <button className="px-4 py-2 rounded-xl border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400 hover:text-black font-semibold text-sm transition-all">
                                        Log in
                                    </button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <Link
                                    href="/dashboard"
                                    className="px-4 py-2 rounded-xl border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400 hover:text-black font-semibold text-sm transition-all"
                                >
                                    Dashboard
                                </Link>
                            </SignedIn>
                        </div>
                    </div>

                    <div className="relative max-w-4xl mx-auto">
                        {/* Badge */}
                        <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm text-gray-400 mb-8">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Social media scheduling made simple
                        </div>

                        {/* Headline */}
                        <h1 className="font-display animate-fade-up delay-100 text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
                            Write it. <span className="shimmer-text">Schedule it.</span>
                            <br />
                            Post it.
                        </h1>

                        {/* Subheadline */}
                        <p className="animate-fade-up delay-200 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Zunno helps solo creators and indie builders stay consistent on social
                            media — without the agency-level complexity or price tag.
                        </p>

                        {/* CTAs */}
                        <div className="animate-fade-up delay-300 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <SignedOut>
                                <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                                    <button className="glow-btn w-full sm:w-auto px-8 py-4 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-base transition-colors">
                                        Start for free →
                                    </button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <Link
                                    href="/compose"
                                    className="glow-btn w-full sm:w-auto px-8 py-4 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-base transition-colors text-center"
                                >
                                    Go to Compose →
                                </Link>
                            </SignedIn>
                            <Link
                                href="/pricing"
                                className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-semibold text-base transition-colors text-center"
                            >
                                See pricing
                            </Link>
                        </div>

                        {/* Social proof hint */}
                        <p className="animate-fade-up delay-400 text-sm text-gray-600 mt-8">
                            Free to start · No credit card required · Cancel anytime
                        </p>
                    </div>

                    {/* Floating platform badges */}
                    <div className="animate-fade-in delay-500 relative max-w-lg mx-auto mt-16">
                        <div className="flex items-center justify-center gap-4 flex-wrap">
                            {[
                                { name: 'X (Twitter)', color: '#fff', dot: 'bg-white' },
                                { name: 'Instagram', color: '#E1306C', dot: 'bg-pink-500' },
                                { name: 'LinkedIn', color: '#0A66C2', dot: 'bg-blue-500' },
                            ].map((p) => (
                                <div
                                    key={p.name}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm font-medium"
                                    style={{ color: p.color }}
                                >
                                    <span className={`w-2 h-2 rounded-full ${p.dot}`} />
                                    {p.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
                <section className="py-24 px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3">
                                How it works
                            </p>
                            <h2 className="font-display text-3xl md:text-5xl font-black">
                                Three steps to consistent posting
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    step: '01',
                                    title: 'Write your post',
                                    desc: 'Type your idea and let AI improve it instantly. Optimized for each platform automatically.',
                                    icon: '✍️',
                                    color: 'from-cyan-500/20 to-cyan-500/5',
                                    border: 'border-cyan-500/20',
                                },
                                {
                                    step: '02',
                                    title: 'Pick your platforms',
                                    desc: 'Choose X, Instagram, LinkedIn — or all three. Character limits handled for you.',
                                    icon: '📡',
                                    color: 'from-orange-400/20 to-orange-400/5',
                                    border: 'border-orange-400/20',
                                },
                                {
                                    step: '03',
                                    title: 'Post now or schedule',
                                    desc: 'Publish immediately or pick a time. Your content calendar keeps everything organized.',
                                    icon: '🚀',
                                    color: 'from-emerald-400/20 to-emerald-400/5',
                                    border: 'border-emerald-400/20',
                                },
                            ].map((item) => (
                                <div
                                    key={item.step}
                                    className={`card-hover relative rounded-2xl border ${item.border} bg-gradient-to-b ${item.color} p-6`}
                                >
                                    <div className="text-3xl mb-4">{item.icon}</div>
                                    <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
                                        Step {item.step}
                                    </p>
                                    <h3 className="font-display text-xl font-bold text-white mb-3">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FEATURES ──────────────────────────────────────────────── */}
                <section className="py-24 px-6 bg-white/[0.02]">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3">
                                Features
                            </p>
                            <h2 className="font-display text-3xl md:text-5xl font-black">
                                Everything you need,{' '}
                                <span className="text-gray-500">nothing you don&apos;t</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[
                                {
                                    icon: '✨',
                                    title: 'AI Writing Assistant',
                                    desc: 'Type a rough idea, hit Improve — Claude rewrites it into something people actually want to read.',
                                },
                                {
                                    icon: '📅',
                                    title: 'Visual Calendar',
                                    desc: 'See everything at a glance. Drag-free scheduling with a clean monthly view of all your posts.',
                                },
                                {
                                    icon: '⚡',
                                    title: 'Multi-platform posting',
                                    desc: 'One post, three platforms. X, Instagram, and LinkedIn — simultaneously, with platform-aware formatting.',
                                },
                                {
                                    icon: '🔗',
                                    title: 'Simple OAuth Connect',
                                    desc: 'Connect your accounts in seconds. No API keys, no developer jargon — just click and authorize.',
                                },
                                {
                                    icon: '🖼️',
                                    title: 'Image Attachments',
                                    desc: 'Add images to any post. Use the built-in prompt generator or paste any image URL.',
                                },
                                {
                                    icon: '📊',
                                    title: 'Post History',
                                    desc: 'See what went out, what&apos;s scheduled, and what failed — all in one clean dashboard.',
                                },
                            ].map((f) => (
                                <div
                                    key={f.title}
                                    className="card-hover rounded-2xl border border-white/8 bg-white/[0.03] p-6 hover:bg-white/[0.05]"
                                >
                                    <div className="text-2xl mb-4">{f.icon}</div>
                                    <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        {f.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── PRICING ───────────────────────────────────────────────── */}
                <section className="py-24 px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3">
                                Pricing
                            </p>
                            <h2 className="font-display text-3xl md:text-5xl font-black">
                                Simple, honest pricing
                            </h2>
                            <p className="text-gray-500 mt-4">
                                No per-seat fees. No platform lock-in. Just a flat rate that makes
                                sense.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                            {[
                                {
                                    name: 'Free',
                                    price: '$0',
                                    period: 'forever',
                                    desc: 'Get started and see if Zunno fits your workflow.',
                                    features: [
                                        'Connect 1 account per platform',
                                        '5 AI improvements per day',
                                        'Post now or schedule',
                                        'Calendar view',
                                    ],
                                    cta: 'Get started free',
                                    highlight: false,
                                },
                                {
                                    name: 'Pro',
                                    price: '$30',
                                    period: 'per month',
                                    desc: 'For creators who post consistently and want AI on their side.',
                                    features: [
                                        'Everything in Free',
                                        'Unlimited AI improvements',
                                        'All 3 platforms',
                                        'Priority scheduling',
                                        'Post history & analytics',
                                    ],
                                    cta: 'Start Pro',
                                    highlight: true,
                                },
                                {
                                    name: 'Premium',
                                    price: '$50',
                                    period: 'per month',
                                    desc: 'For power users who need the full toolkit.',
                                    features: [
                                        'Everything in Pro',
                                        'Image generation credits',
                                        'Early access to new features',
                                        'Priority support',
                                    ],
                                    cta: 'Start Premium',
                                    highlight: false,
                                },
                            ].map((plan) => (
                                <div
                                    key={plan.name}
                                    className={`card-hover rounded-2xl border p-7 ${
                                        plan.highlight
                                            ? 'border-cyan-400/40 bg-cyan-400/5 relative'
                                            : 'border-white/10 bg-white/[0.03]'
                                    }`}
                                >
                                    {plan.highlight && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-cyan-400 text-black text-xs font-bold">
                                            Most popular
                                        </div>
                                    )}
                                    <p className="text-sm font-bold text-gray-400 mb-1">
                                        {plan.name}
                                    </p>
                                    <div className="flex items-end gap-1 mb-1">
                                        <span className="font-display text-4xl font-black text-white">
                                            {plan.price}
                                        </span>
                                        <span className="text-gray-500 text-sm mb-1.5">
                                            /{plan.period}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-6">{plan.desc}</p>

                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((f) => (
                                            <li
                                                key={f}
                                                className="flex items-start gap-2 text-sm text-gray-300"
                                            >
                                                <span className="text-cyan-400 mt-0.5 shrink-0">
                                                    ✓
                                                </span>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    <SignedOut>
                                        <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                                            <button
                                                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                                                    plan.highlight
                                                        ? 'bg-cyan-400 hover:bg-cyan-300 text-black'
                                                        : 'border border-white/10 hover:border-white/20 text-white hover:bg-white/5'
                                                }`}
                                            >
                                                {plan.cta}
                                            </button>
                                        </SignInButton>
                                    </SignedOut>
                                    <SignedIn>
                                        <Link
                                            href="/dashboard"
                                            className={`block w-full py-3 rounded-xl font-semibold text-sm transition-all text-center ${
                                                plan.highlight
                                                    ? 'bg-cyan-400 hover:bg-cyan-300 text-black'
                                                    : 'border border-white/10 hover:border-white/20 text-white hover:bg-white/5'
                                            }`}
                                        >
                                            Go to Dashboard
                                        </Link>
                                    </SignedIn>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FINAL CTA ─────────────────────────────────────────────── */}
                <section className="py-24 px-6">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] px-8 py-16 overflow-hidden">
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-cyan-500/15 rounded-full blur-[60px]" />
                            </div>
                            <div className="relative">
                                <h2 className="font-display text-3xl md:text-5xl font-black mb-4">
                                    Ready to stay consistent?
                                </h2>
                                <p className="text-gray-400 mb-8 text-lg">
                                    Join creators who stopped copy-pasting into Twitter and started
                                    actually growing.
                                </p>
                                <SignedOut>
                                    <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                                        <button className="glow-btn px-10 py-4 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-base transition-colors">
                                            Start for free — no card needed
                                        </button>
                                    </SignInButton>
                                </SignedOut>
                                <SignedIn>
                                    <Link
                                        href="/compose"
                                        className="glow-btn inline-block px-10 py-4 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-base transition-colors"
                                    >
                                        Write your first post →
                                    </Link>
                                </SignedIn>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
