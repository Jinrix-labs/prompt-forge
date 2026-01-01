'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
export default function PricingPage() {
    const [loading, setLoading] = useState<string | null>(null);
    const [currentTier, setCurrentTier] = useState<string>('free');
    const [credits, setCredits] = useState<number>(0);

    useEffect(() => {
        loadUserData();
    }, []);

    async function loadUserData() {
        try {
            // Get subscription tier
            const subRes = await fetch('/api/user/subscription');
            if (subRes.ok) {
                const subData = await subRes.json();
                if (subData.tier) {
                    setCurrentTier(subData.tier);
                }
            }
            
            // Get credits
            const creditsRes = await fetch('/api/user/credits');
            if (creditsRes.ok) {
                const data = await creditsRes.json();
                setCredits(data.credits || 0);
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    }

    async function handleCheckout(priceId: string, type: 'subscription' | 'credits') {
        setLoading(priceId);
        try {
            const res = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId, type }),
            });

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || 'Failed to create checkout session');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(null);
        }
    }

    const subscriptionPlans = [
        {
            name: 'Free',
            price: '$0',
            period: 'forever',
            tier: 'free',
            limit: '10 workflow runs/month',
            features: [
                '10 workflow runs per month',
                'Basic AI models',
                'Public workflow library access',
            ],
        },
        {
            name: 'Pro',
            price: '$29.99',
            period: 'month',
            tier: 'pro',
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_pro',
            limit: '300 workflow runs/month',
            features: [
                '300 workflow runs per month',
                'All AI models (Claude + Groq)',
                'Unlimited workflow creation',
                'Private workflows',
                'Priority support',
            ],
        },
        {
            name: 'Premium',
            price: '$49.99',
            period: 'month',
            tier: 'premium',
            priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || 'price_premium',
            limit: '1000 workflow runs/month',
            features: [
                '1000 workflow runs per month',
                'All AI models',
                'Unlimited workflows',
                'Advanced workflow features',
                'API access',
                'Priority support',
            ],
        },
    ];

    const creditPackages = [
        {
            name: '100 Credits',
            credits: 100,
            price: '$9.99',
            priceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_100_PRICE_ID || 'price_credits_100',
            popular: false,
        },
        {
            name: '500 Credits',
            credits: 500,
            price: '$39.99',
            priceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_500_PRICE_ID || 'price_credits_500',
            popular: true,
            savings: 'Save 20%',
        },
        {
            name: '1500 Credits',
            credits: 1500,
            price: '$99.99',
            priceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_1500_PRICE_ID || 'price_credits_1500',
            popular: false,
            savings: 'Save 33%',
        },
    ];

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Animated background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-white mb-4">⚡ PRICING</h1>
                    <p className="text-gray-400 text-lg">Choose the plan that works for you</p>
                </div>

                {/* Subscription Plans */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-cyan-400 mb-6 text-center">SUBSCRIPTION PLANS</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {subscriptionPlans.map((plan) => (
                            <div
                                key={plan.tier}
                                className={`border-2 rounded-lg p-6 ${
                                    plan.tier === 'pro'
                                        ? 'border-cyan-500 bg-cyan-500/10'
                                        : plan.tier === 'premium'
                                        ? 'border-fuchsia-500 bg-fuchsia-500/10'
                                        : 'border-gray-700 bg-gray-900/50'
                                }`}
                            >
                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-black text-white mb-2">{plan.name}</h3>
                                    <div className="text-4xl font-black text-cyan-400 mb-1">
                                        {plan.price}
                                    </div>
                                    <div className="text-gray-400 text-sm">/{plan.period}</div>
                                    <div className="text-xs text-gray-500 mt-2">{plan.limit}</div>
                                </div>

                                <ul className="space-y-3 mb-6">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-300 text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {plan.tier === currentTier ? (
                                    <button
                                        disabled
                                        className="w-full border-2 border-gray-600 bg-gray-800 text-gray-500 font-bold py-3 rounded cursor-not-allowed"
                                    >
                                        CURRENT PLAN
                                    </button>
                                ) : plan.priceId ? (
                                    <button
                                        onClick={() => handleCheckout(plan.priceId, 'subscription')}
                                        disabled={loading !== null}
                                        className="w-full border-2 border-cyan-500 bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black font-bold py-3 rounded transition-all disabled:opacity-50"
                                    >
                                        {loading === plan.priceId ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                PROCESSING...
                                            </span>
                                        ) : (
                                            'UPGRADE NOW'
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full border-2 border-gray-600 bg-gray-800 text-gray-500 font-bold py-3 rounded cursor-not-allowed"
                                    >
                                        CURRENT PLAN
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Credit Packages */}
                <div>
                    <h2 className="text-2xl font-bold text-fuchsia-400 mb-6 text-center">BUY CREDITS</h2>
                    <p className="text-center text-gray-400 mb-6">
                        Need more runs? Buy credits that never expire. Current balance: <span className="text-cyan-400 font-bold">{credits}</span>
                    </p>
                    <div className="grid md:grid-cols-3 gap-6">
                        {creditPackages.map((pkg) => (
                            <div
                                key={pkg.priceId}
                                className={`border-2 rounded-lg p-6 relative ${
                                    pkg.popular
                                        ? 'border-fuchsia-500 bg-fuchsia-500/10'
                                        : 'border-gray-700 bg-gray-900/50'
                                }`}
                            >
                                {pkg.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-fuchsia-500 text-black text-xs font-bold px-3 py-1 rounded">
                                        POPULAR
                                    </div>
                                )}
                                {pkg.savings && (
                                    <div className="absolute -top-3 right-3 bg-green-500 text-black text-xs font-bold px-2 py-1 rounded">
                                        {pkg.savings}
                                    </div>
                                )}

                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-black text-white mb-2">{pkg.name}</h3>
                                    <div className="text-4xl font-black text-fuchsia-400 mb-1">
                                        {pkg.price}
                                    </div>
                                    <div className="text-gray-400 text-sm">{pkg.credits} workflow runs</div>
                                </div>

                                <button
                                    onClick={() => handleCheckout(pkg.priceId, 'credits')}
                                    disabled={loading !== null}
                                    className="w-full border-2 border-fuchsia-500 bg-fuchsia-500/20 text-fuchsia-500 hover:bg-fuchsia-500 hover:text-black font-bold py-3 rounded transition-all disabled:opacity-50"
                                >
                                    {loading === pkg.priceId ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            PROCESSING...
                                        </span>
                                    ) : (
                                        'BUY NOW'
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

