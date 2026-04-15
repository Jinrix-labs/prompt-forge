'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { Clock, Loader2 } from 'lucide-react';

type Platform = 'twitter' | 'instagram' | 'linkedin';

type Post = {
    id: string;
    content: string;
    platforms: Platform[];
    scheduled_at: string;
    status: string;
};

const PLATFORM_COLORS: Record<Platform, string> = {
    twitter: '#ffffff',
    instagram: '#E1306C',
    linkedin: '#0A66C2',
};

const PLATFORM_ICONS: Record<Platform, ReactNode> = {
    twitter: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    ),
    instagram: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
    ),
    linkedin: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
    ),
};

function isPlatform(p: string): p is Platform {
    return p === 'twitter' || p === 'instagram' || p === 'linkedin';
}

function normalizeScheduledPost(row: Record<string, unknown>): Post | null {
    if (typeof row.id !== 'string' || typeof row.scheduled_at !== 'string' || !row.scheduled_at.trim()) {
        return null;
    }
    const platformsRaw = row.platforms;
    const platforms = Array.isArray(platformsRaw)
        ? platformsRaw.filter((p): p is Platform => typeof p === 'string' && isPlatform(p))
        : [];

    const content = typeof row.content === 'string' ? row.content : '';
    const status = typeof row.status === 'string' ? row.status : 'scheduled';

    return {
        id: row.id,
        content,
        platforms,
        scheduled_at: row.scheduled_at,
        status,
    };
}

export default function UpcomingPosts() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/posts?status=scheduled')
            .then((r) => (r.ok ? r.json() : { posts: [] }))
            .then((data: { posts?: unknown[] }) => {
                const normalized: Post[] = (data.posts ?? [])
                    .map((p) => normalizeScheduledPost(p as Record<string, unknown>))
                    .filter((p): p is Post => p != null)
                    .sort(
                        (a, b) =>
                            new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
                    )
                    .slice(0, 5);
                setPosts(normalized);
            })
            .catch(() => setPosts([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    Upcoming Posts
                </h2>
                <Link
                    href="/calendar"
                    className="text-xs text-gray-500 hover:text-cyan-400 transition-colors"
                >
                    View all →
                </Link>
            </div>

            {loading && (
                <div className="rounded-xl border border-white/10 bg-white/[0.02] px-6 py-10 flex justify-center">
                    <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                </div>
            )}

            {!loading && posts.length === 0 && (
                <div className="rounded-xl border border-white/10 bg-white/[0.02] px-6 py-10 text-center">
                    <p className="text-sm text-gray-500">No scheduled posts yet.</p>
                    <Link
                        href="/compose"
                        className="inline-block mt-3 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                        Create your first post →
                    </Link>
                </div>
            )}

            {!loading && posts.length > 0 && (
                <div className="rounded-xl border border-white/10 bg-white/[0.02] divide-y divide-white/5 overflow-hidden">
                    {posts.map((post) => (
                        <div
                            key={post.id}
                            className="flex items-start gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors"
                        >
                            <div className="shrink-0 text-center min-w-[48px]">
                                <p className="text-xs text-gray-600">
                                    {new Date(post.scheduled_at).toLocaleDateString([], {
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </p>
                                <p className="text-xs font-semibold text-yellow-400 mt-0.5">
                                    {new Date(post.scheduled_at).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-300 truncate">{post.content}</p>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    {post.platforms.map((platform) => (
                                        <span
                                            key={platform}
                                            style={{ color: PLATFORM_COLORS[platform] }}
                                            className="opacity-60"
                                        >
                                            {PLATFORM_ICONS[platform]}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="shrink-0 flex items-center gap-1 text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-1 rounded-full">
                                <Clock className="w-3 h-3" />
                                Scheduled
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
