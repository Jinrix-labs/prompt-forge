'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

type Platform = 'twitter' | 'instagram' | 'linkedin';

type ConnectedAccount = {
    platform: Platform;
    platform_username: string;
    created_at: string;
};

type PlatformConfig = {
    name: string;
    icon: ReactNode;
    color: string;
    connectUrl: string;
    description: string;
};

const PLATFORMS: Record<Platform, PlatformConfig> = {
    twitter: {
        name: 'X (Twitter)',
        color: '#000000',
        connectUrl: '/api/auth/twitter/connect',
        description: 'Post tweets and threads',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
    },
    instagram: {
        name: 'Instagram',
        color: '#E1306C',
        connectUrl: '/api/auth/instagram/connect',
        description: 'Schedule posts and reels',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
        ),
    },
    linkedin: {
        name: 'LinkedIn',
        color: '#0A66C2',
        connectUrl: '/api/auth/linkedin/connect',
        description: 'Share professional content',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
        ),
    },
};

const ALLOWED_PLATFORMS: Platform[] = ['twitter', 'instagram', 'linkedin'];

function isPlatform(value: string): value is Platform {
    return ALLOWED_PLATFORMS.includes(value as Platform);
}

export default function ConnectedAccounts() {
    const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [disconnecting, setDisconnecting] = useState<Platform | null>(null);

    useEffect(() => {
        fetchAccounts();
    }, []);

    async function fetchAccounts() {
        try {
            const res = await fetch('/api/connected-accounts');
            if (!res.ok) {
                setAccounts([]);
                return;
            }
            const data = await res.json();
            const raw = (data.accounts || []) as Array<{
                platform: string;
                platform_username: string;
                created_at: string;
            }>;
            const filtered = raw.filter((a) => isPlatform(a.platform)).map((a) => ({
                platform: a.platform as Platform,
                platform_username: a.platform_username,
                created_at: a.created_at,
            }));
            setAccounts(filtered);
        } catch (err) {
            console.error('Failed to fetch accounts', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleDisconnect(platform: Platform) {
        setDisconnecting(platform);
        try {
            const res = await fetch(`/api/connected-accounts/${platform}`, { method: 'DELETE' });
            if (res.ok) {
                setAccounts((prev) => prev.filter((a) => a.platform !== platform));
            }
        } catch (err) {
            console.error('Failed to disconnect', err);
        } finally {
            setDisconnecting(null);
        }
    }

    const getAccount = (platform: Platform) => accounts.find((a) => a.platform === platform);

    return (
        <div className="space-y-3">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-white">Connected Accounts</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Connect your social media accounts to start scheduling posts.
                </p>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {(Object.keys(PLATFORMS) as Platform[]).map((platform) => {
                        const config = PLATFORMS[platform];
                        const account = getAccount(platform);
                        const isConnected = !!account;
                        const isDisconnecting = disconnecting === platform;

                        return (
                            <div
                                key={platform}
                                className="flex items-center justify-between px-5 py-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: `${config.color}22`, color: config.color }}
                                    >
                                        {config.icon}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white">{config.name}</span>
                                            {isConnected && (
                                                <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                                                    Connected
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {isConnected
                                                ? `@${account.platform_username}`
                                                : config.description}
                                        </p>
                                    </div>
                                </div>

                                {isConnected ? (
                                    <button
                                        type="button"
                                        onClick={() => handleDisconnect(platform)}
                                        disabled={isDisconnecting}
                                        className="text-xs text-gray-500 hover:text-red-400 border border-white/10 hover:border-red-400/30 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                                    >
                                        {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                                    </button>
                                ) : (
                                    <a
                                        href={config.connectUrl}
                                        className="text-xs font-medium text-white bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-lg transition-all border border-white/10"
                                    >
                                        Connect
                                    </a>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
