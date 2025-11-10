'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

interface Usage {
    ugc: { used: number; limit: number; isPro: boolean };
    regular: { used: number; limit: number; isPro: boolean };
}

export function UsageDisplay() {
    const { userId } = useAuth();
    const [usage, setUsage] = useState<Usage | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const fetchUsage = async () => {
            try {
                const res = await fetch('/api/usage');
                const data = await res.json();
                setUsage(data);
            } catch (error) {
                console.error('Failed to fetch usage:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsage();
    }, [userId]);

    if (!userId || loading) return null;

    return (
        <div className="space-y-4 p-4 bg-gray-900 rounded-lg border border-cyan-500/20">
            {/* UGC Usage */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">
                        UGC Prompts {usage?.ugc.isPro ? '(Monthly)' : '(Daily)'}
                    </span>
                    <span className="text-sm font-bold text-cyan-400">
                        {usage?.ugc.used || 0} / {usage?.ugc.limit === -1 ? '∞' : usage?.ugc.limit}
                    </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-cyan-500 to-magenta-500 h-2 rounded-full transition-all"
                        style={{
                            width: usage?.ugc.limit === -1 ? '100%' : `${Math.min(100, ((usage?.ugc.used || 0) / (usage?.ugc.limit || 1)) * 100)}%`,
                        }}
                    />
                </div>
            </div>

            {/* Regular Usage */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">
                        Regular Prompts {usage?.regular.isPro ? '(Unlimited)' : '(Daily)'}
                    </span>
                    <span className="text-sm font-bold text-yellow-400">
                        {usage?.regular.limit === -1 ? '∞' : `${usage?.regular.used || 0} / ${usage?.regular.limit}`}
                    </span>
                </div>
                {usage?.regular.limit !== -1 && (
                    <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all"
                            style={{
                                width: `${Math.min(100, ((usage?.regular.used || 0) / (usage?.regular.limit || 1)) * 100)}%`,
                            }}
                        />
                    </div>
                )}
            </div>

            {!usage?.ugc.isPro && (
                <div className="pt-2 border-t border-gray-800">
                    <p className="text-xs text-gray-500 mb-2">
                        Upgrade to Pro for 200 UGC prompts/month + unlimited regular prompts
                    </p>
                </div>
            )}
        </div>
    );
}
