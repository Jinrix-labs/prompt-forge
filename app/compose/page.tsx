'use client';

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Send,
    Clock,
    Image as ImageIcon,
    CheckCircle,
    AlertCircle,
    Loader2,
} from 'lucide-react';

type Platform = 'twitter' | 'instagram' | 'linkedin';

type ConnectedAccount = {
    platform: Platform;
    platform_username: string;
};

const PLATFORM_CONFIG: Record<Platform, { name: string; limit: number; color: string; icon: ReactNode }> = {
    twitter: {
        name: 'X (Twitter)',
        limit: 280,
        color: '#fff',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
    },
    instagram: {
        name: 'Instagram',
        limit: 2200,
        color: '#E1306C',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
        ),
    },
    linkedin: {
        name: 'LinkedIn',
        limit: 3000,
        color: '#0A66C2',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
        ),
    },
};

type PostMode = 'now' | 'schedule';
type Status = 'idle' | 'loading' | 'success' | 'error';

const ALLOWED: Platform[] = ['twitter', 'instagram', 'linkedin'];

function isPlatform(p: string): p is Platform {
    return ALLOWED.includes(p as Platform);
}

export default function ComposePage() {
    const router = useRouter();
    const [content, setContent] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
    const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
    const [loadingAccounts, setLoadingAccounts] = useState(true);
    const [mode, setMode] = useState<PostMode>('now');
    const [scheduledAt, setScheduledAt] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [status, setStatus] = useState<Status>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        fetch('/api/connected-accounts')
            .then((r) => r.json())
            .then((data) => {
                const raw = (data.accounts || []) as Array<{ platform: string; platform_username: string }>;
                setConnectedAccounts(
                    raw.filter((a) => isPlatform(a.platform)).map((a) => ({
                        platform: a.platform as Platform,
                        platform_username: a.platform_username,
                    }))
                );
            })
            .finally(() => setLoadingAccounts(false));
    }, []);

    function togglePlatform(platform: Platform) {
        setSelectedPlatforms((prev) =>
            prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
        );
    }

    const isConnected = (platform: Platform) => connectedAccounts.some((a) => a.platform === platform);

    const getUsername = (platform: Platform) =>
        connectedAccounts.find((a) => a.platform === platform)?.platform_username;

    const strictestLimit = selectedPlatforms.length
        ? Math.min(...selectedPlatforms.map((p) => PLATFORM_CONFIG[p].limit))
        : null;

    const charCount = content.length;
    const overLimit = strictestLimit !== null && charCount > strictestLimit;

    async function handleSubmit() {
        if (!content.trim()) return;
        if (selectedPlatforms.length === 0) return;
        if (overLimit) return;
        if (mode === 'schedule' && !scheduledAt) return;

        setStatus('loading');
        setErrorMsg('');

        try {
            const trimmedImage = imageUrl.trim();
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    platforms: selectedPlatforms,
                    image_url: trimmedImage || null,
                    scheduled_at: mode === 'schedule' ? scheduledAt : null,
                    status: mode === 'now' ? 'published' : 'scheduled',
                }),
            });

            if (!res.ok) {
                const errBody = await res.json().catch(() => ({}));
                throw new Error((errBody as { error?: string }).error || 'Failed to create post');
            }

            setStatus('success');
            setTimeout(() => router.push('/dashboard'), 1500);
        } catch (err) {
            setStatus('error');
            setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        }
    }

    const canSubmit =
        content.trim().length > 0 &&
        selectedPlatforms.length > 0 &&
        !overLimit &&
        (mode === 'now' || scheduledAt) &&
        status !== 'loading';

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
                <div
                    className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse"
                    style={{ animationDelay: '1s' }}
                />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white">Compose</h1>
                    <p className="text-gray-500 text-sm mt-1">Write your post and choose where to send it</p>
                </div>

                {status === 'success' && (
                    <div className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-200 text-sm mb-6">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <p>{mode === 'now' ? 'Post published!' : 'Post scheduled!'} Redirecting…</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200 text-sm mb-6">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p>{errorMsg}</p>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What do you want to say?"
                            rows={6}
                            className="w-full bg-transparent px-5 pt-5 pb-3 text-sm text-white placeholder-gray-600 resize-none focus:outline-none"
                        />
                        <div className="flex items-center justify-between px-5 pb-4">
                            <div className="flex items-center gap-2">
                                {strictestLimit != null && (
                                    <span
                                        className={`text-xs font-mono tabular-nums ${
                                            overLimit
                                                ? 'text-red-400'
                                                : charCount > strictestLimit * 0.9
                                                  ? 'text-yellow-400'
                                                  : 'text-gray-600'
                                        }`}
                                    >
                                        {charCount} / {strictestLimit}
                                    </span>
                                )}
                                {strictestLimit == null && (
                                    <span className="text-xs text-gray-700">
                                        Select a platform to see character limit
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setImageUrl(imageUrl ? '' : ' ')}
                                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-cyan-400 transition-colors"
                            >
                                <ImageIcon className="w-3.5 h-3.5" />
                                {imageUrl ? 'Remove image' : 'Add image'}
                            </button>
                        </div>

                        {imageUrl !== '' && (
                            <div className="px-5 pb-4 border-t border-white/5 pt-3">
                                <input
                                    type="url"
                                    value={imageUrl.trim()}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="Paste image URL or generate one from Prompts"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                            Post to
                        </p>
                        {loadingAccounts ? (
                            <div className="flex gap-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-10 w-32 rounded-lg bg-white/5 animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                {(Object.keys(PLATFORM_CONFIG) as Platform[]).map((platform) => {
                                    const config = PLATFORM_CONFIG[platform];
                                    const connected = isConnected(platform);
                                    const selected = selectedPlatforms.includes(platform);
                                    const username = getUsername(platform);

                                    return (
                                        <button
                                            key={platform}
                                            type="button"
                                            disabled={!connected}
                                            onClick={() => connected && togglePlatform(platform)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                                                !connected
                                                    ? 'border-white/5 bg-white/[0.02] text-gray-700 cursor-not-allowed'
                                                    : selected
                                                      ? 'border-cyan-500/50 bg-cyan-500/10 text-white'
                                                      : 'border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/20 hover:text-white'
                                            }`}
                                        >
                                            <span style={{ color: connected ? config.color : undefined }}>
                                                {config.icon}
                                            </span>
                                            <span>{config.name}</span>
                                            {connected && username && (
                                                <span className="text-xs text-gray-600">@{username}</span>
                                            )}
                                            {!connected && (
                                                <span className="text-xs text-gray-700">Not connected</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {!loadingAccounts && connectedAccounts.length === 0 && (
                            <p className="text-xs text-gray-600 mt-4">
                                No accounts connected.{' '}
                                <a href="/dashboard" className="text-cyan-500 hover:text-cyan-400">
                                    Connect an account →
                                </a>
                            </p>
                        )}
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">When</p>
                        <div className="flex gap-3 mb-4">
                            <button
                                type="button"
                                onClick={() => setMode('now')}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                                    mode === 'now'
                                        ? 'border-cyan-500/50 bg-cyan-500/10 text-white'
                                        : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                                }`}
                            >
                                <Send className="w-3.5 h-3.5" />
                                Post now
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('schedule')}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                                    mode === 'schedule'
                                        ? 'border-cyan-500/50 bg-cyan-500/10 text-white'
                                        : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                                }`}
                            >
                                <Clock className="w-3.5 h-3.5" />
                                Schedule
                            </button>
                        </div>

                        {mode === 'schedule' && (
                            <input
                                type="datetime-local"
                                value={scheduledAt}
                                onChange={(e) => setScheduledAt(e.target.value)}
                                min={new Date().toISOString().slice(0, 16)}
                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors [color-scheme:dark]"
                            />
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all ${
                            canSubmit
                                ? 'bg-cyan-500 hover:bg-cyan-400 text-black'
                                : 'bg-white/5 text-gray-600 cursor-not-allowed'
                        }`}
                    >
                        {status === 'loading' ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {mode === 'now' ? 'Publishing…' : 'Scheduling…'}
                            </>
                        ) : mode === 'now' ? (
                            <>
                                <Send className="w-4 h-4" />
                                Publish now
                            </>
                        ) : (
                            <>
                                <Clock className="w-4 h-4" />
                                Schedule post
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
