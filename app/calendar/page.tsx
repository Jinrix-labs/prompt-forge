'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import {
    ChevronLeft,
    ChevronRight,
    PenSquare,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
} from 'lucide-react';

type Platform = 'twitter' | 'instagram' | 'linkedin';

type Post = {
    id: string;
    content: string;
    platforms: Platform[];
    image_url?: string;
    scheduled_at?: string;
    published_at?: string;
    status: 'scheduled' | 'published' | 'failed' | 'draft';
    error_message?: string;
    created_at: string;
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

const STATUS_CONFIG = {
    scheduled: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
    published: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
    failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
    draft: { icon: PenSquare, color: 'text-gray-400', bg: 'bg-white/5 border-white/10' },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

function getPostDate(post: Post): Date | null {
    const dateStr = post.scheduled_at || post.published_at || post.created_at;
    return dateStr ? new Date(dateStr) : null;
}

function isPlatform(value: string): value is Platform {
    return value === 'twitter' || value === 'instagram' || value === 'linkedin';
}

function normalizePost(row: Record<string, unknown>): Post | null {
    if (typeof row.id !== 'string' || typeof row.content !== 'string' || typeof row.created_at !== 'string') {
        return null;
    }
    const status = row.status;
    if (status !== 'scheduled' && status !== 'published' && status !== 'failed' && status !== 'draft') {
        return null;
    }
    const platformsRaw = row.platforms;
    const platforms = Array.isArray(platformsRaw)
        ? platformsRaw.filter((p): p is Platform => typeof p === 'string' && isPlatform(p))
        : [];

    return {
        id: row.id,
        content: row.content,
        platforms,
        image_url: typeof row.image_url === 'string' ? row.image_url : undefined,
        scheduled_at: typeof row.scheduled_at === 'string' ? row.scheduled_at : undefined,
        published_at: typeof row.published_at === 'string' ? row.published_at : undefined,
        status,
        error_message: typeof row.error_message === 'string' ? row.error_message : undefined,
        created_at: row.created_at,
    };
}

export default function CalendarPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const today = new Date();
    const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

    useEffect(() => {
        fetch('/api/posts')
            .then((r) => r.json())
            .then((data: { posts?: unknown[] }) => {
                const list = (data.posts ?? [])
                    .map((row) => normalizePost(row as Record<string, unknown>))
                    .filter((p): p is Post => p != null);
                setPosts(list);
            })
            .catch(() => setPosts([]))
            .finally(() => setLoading(false));
    }, []);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    function prevMonth() {
        setViewDate(new Date(year, month - 1, 1));
        setSelectedDay(null);
    }

    function nextMonth() {
        setViewDate(new Date(year, month + 1, 1));
        setSelectedDay(null);
    }

    function getPostsForDay(day: number): Post[] {
        return posts.filter((post) => {
            const date = getPostDate(post);
            if (!date) return false;
            return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
        });
    }

    const selectedPosts = selectedDay ? getPostsForDay(selectedDay) : [];

    const isToday = (day: number) =>
        today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

    const upcomingScheduled = posts
        .filter((p) => p.status === 'scheduled' && p.scheduled_at)
        .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())
        .slice(0, 5);

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
                <div
                    className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse"
                    style={{ animationDelay: '1s' }}
                />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Calendar</h1>
                        <p className="text-gray-500 text-sm mt-1">View and manage your scheduled posts</p>
                    </div>
                    <Link
                        href="/compose"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-semibold transition-all"
                    >
                        <PenSquare className="w-4 h-4" />
                        New post
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                                <button
                                    type="button"
                                    onClick={prevMonth}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <h2 className="text-sm font-semibold text-white">
                                    {MONTHS[month]} {year}
                                </h2>
                                <button
                                    type="button"
                                    onClick={nextMonth}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-7 border-b border-white/5">
                                {DAYS.map((day) => (
                                    <div key={day} className="py-2 text-center text-xs text-gray-600 font-medium">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-7">
                                    {Array.from({ length: firstDay }).map((_, i) => (
                                        <div key={`empty-${i}`} className="aspect-square border-b border-r border-white/5" />
                                    ))}

                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                        const day = i + 1;
                                        const dayPosts = getPostsForDay(day);
                                        const isSelected = selectedDay === day;
                                        const _isToday = isToday(day);

                                        return (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => setSelectedDay(isSelected ? null : day)}
                                                className={`aspect-square border-b border-r border-white/5 p-1.5 flex flex-col items-start transition-all hover:bg-white/5 ${
                                                    isSelected ? 'bg-cyan-500/10' : ''
                                                }`}
                                            >
                                                <span
                                                    className={`text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full mb-1 ${
                                                        _isToday
                                                            ? 'bg-cyan-500 text-black'
                                                            : isSelected
                                                              ? 'text-cyan-400'
                                                              : 'text-gray-400'
                                                    }`}
                                                >
                                                    {day}
                                                </span>

                                                <div className="flex flex-wrap gap-0.5">
                                                    {dayPosts.slice(0, 3).map((post) => (
                                                        <div
                                                            key={post.id}
                                                            className={`w-1.5 h-1.5 rounded-full ${
                                                                post.status === 'published'
                                                                    ? 'bg-emerald-400'
                                                                    : post.status === 'scheduled'
                                                                      ? 'bg-yellow-400'
                                                                      : post.status === 'failed'
                                                                        ? 'bg-red-400'
                                                                        : 'bg-gray-600'
                                                            }`}
                                                        />
                                                    ))}
                                                    {dayPosts.length > 3 && (
                                                        <span className="text-[8px] text-gray-600">
                                                            +{dayPosts.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="flex items-center gap-4 px-6 py-3 border-t border-white/5">
                                {[
                                    { color: 'bg-emerald-400', label: 'Published' },
                                    { color: 'bg-yellow-400', label: 'Scheduled' },
                                    { color: 'bg-red-400', label: 'Failed' },
                                    { color: 'bg-gray-600', label: 'Draft' },
                                ].map(({ color, label }) => (
                                    <div key={label} className="flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${color}`} />
                                        <span className="text-xs text-gray-600">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
                            <div className="px-5 py-4 border-b border-white/10">
                                <h3 className="text-sm font-semibold text-white">
                                    {selectedDay ? `${MONTHS[month]} ${selectedDay}` : 'Select a day'}
                                </h3>
                                <p className="text-xs text-gray-600 mt-0.5">
                                    {selectedDay
                                        ? `${selectedPosts.length} post${selectedPosts.length !== 1 ? 's' : ''}`
                                        : 'Click a date to see posts'}
                                </p>
                            </div>

                            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                                {!selectedDay && (
                                    <p className="text-xs text-gray-700 text-center py-6">No day selected</p>
                                )}

                                {selectedDay && selectedPosts.length === 0 && (
                                    <div className="text-center py-6">
                                        <p className="text-xs text-gray-600">No posts on this day</p>
                                        <Link
                                            href="/compose"
                                            className="text-xs text-cyan-500 hover:text-cyan-400 mt-2 inline-block"
                                        >
                                            Create a post →
                                        </Link>
                                    </div>
                                )}

                                {selectedPosts.map((post) => {
                                    const statusConf = STATUS_CONFIG[post.status];
                                    const StatusIcon = statusConf.icon;
                                    const postDate = getPostDate(post);

                                    return (
                                        <div key={post.id} className={`rounded-xl border p-3 ${statusConf.bg}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className={`flex items-center gap-1 text-xs ${statusConf.color}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    <span className="capitalize">{post.status}</span>
                                                </div>
                                                {postDate && (
                                                    <span className="text-xs text-gray-600">
                                                        {postDate.toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xs text-gray-300 line-clamp-3 mb-2">{post.content}</p>

                                            <div className="flex items-center gap-1.5">
                                                {post.platforms.map((platform) => (
                                                    <span
                                                        key={platform}
                                                        style={{ color: PLATFORM_COLORS[platform] }}
                                                        className="opacity-70"
                                                    >
                                                        {PLATFORM_ICONS[platform]}
                                                    </span>
                                                ))}
                                            </div>

                                            {post.error_message && (
                                                <p className="text-xs text-red-400/70 mt-2 border-t border-red-400/10 pt-2">
                                                    {post.error_message}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
                            <div className="px-5 py-4 border-b border-white/10">
                                <h3 className="text-sm font-semibold text-white">Upcoming</h3>
                            </div>
                            <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
                                {upcomingScheduled.map((post) => (
                                    <div
                                        key={post.id}
                                        className="flex items-start gap-2 py-2 border-b border-white/5 last:border-0"
                                    >
                                        <Clock className="w-3 h-3 text-yellow-400 shrink-0 mt-0.5" />
                                        <div className="min-w-0">
                                            <p className="text-xs text-gray-300 truncate">{post.content}</p>
                                            <p className="text-xs text-gray-600 mt-0.5">
                                                {new Date(post.scheduled_at!).toLocaleDateString([], {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {upcomingScheduled.length === 0 && (
                                    <p className="text-xs text-gray-700 text-center py-4">No upcoming posts</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
