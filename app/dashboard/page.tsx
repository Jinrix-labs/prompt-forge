'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
    CheckCircle,
    AlertCircle,
    PenSquare,
    CalendarDays,
    Clock,
    BarChart2,
} from 'lucide-react';
import ConnectedAccounts from '@/components/ConnectedAccounts';

function DashboardMessages() {
    const searchParams = useSearchParams();
    const success = searchParams.get('success');
    const instagram = searchParams.get('instagram');
    const linkedin = searchParams.get('linkedin');
    const twitter = searchParams.get('twitter');
    const error = searchParams.get('error');
    const reason = searchParams.get('reason');

    const errorMessages: Record<string, string> = {
        no_code: 'No authorization code was returned. Try connecting again.',
        invalid_state: 'Security check failed. Please try connecting again.',
        server_config: 'Server configuration is incomplete. Contact support.',
        instagram_connect_failed: 'Could not complete Instagram connection. Please try again.',
        instagram_oauth_denied: 'Instagram authorization was cancelled or denied.',
        linkedin_connect_failed: 'Could not complete LinkedIn connection. Please try again.',
        linkedin_oauth_denied: 'LinkedIn authorization was cancelled or denied.',
        twitter_denied: 'X (Twitter) authorization was cancelled or denied.',
        twitter_missing_params: 'X authorization returned incomplete data. Try again.',
        twitter_invalid_state: 'X security check failed. Please try connecting again.',
        twitter_db_error: 'X connected but saving your account failed. Please contact support.',
        twitter_connect_failed: 'Could not complete X connection. Please try again.',
        db_error: 'Connected but saving your account failed. Please contact support.',
    };

    const hasMessage = success || instagram || linkedin || twitter || error;
    if (!hasMessage) return null;

    return (
        <div className="space-y-3 mb-8">
            {success === 'true' && (
                <div className="flex items-start gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-200 text-sm">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>Your subscription checkout completed successfully.</p>
                </div>
            )}
            {instagram === 'connected' && (
                <div className="flex items-start gap-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-cyan-100 text-sm">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>Instagram connected successfully.</p>
                </div>
            )}
            {linkedin === 'connected' && (
                <div className="flex items-start gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-blue-100 text-sm">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>LinkedIn connected successfully.</p>
                </div>
            )}
            {twitter === 'connected' && (
                <div className="flex items-start gap-3 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-gray-100 text-sm">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>X (Twitter) connected successfully.</p>
                </div>
            )}
            {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                        <p>{errorMessages[error] ?? 'Something went wrong.'}</p>
                        {reason && <p className="text-xs text-red-300/70 mt-1">Reason: {reason}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}

function QuickActions() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            <Link
                href="/compose"
                className="group flex items-center gap-3 px-5 py-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all"
            >
                <div className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <PenSquare className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-white">Compose</p>
                    <p className="text-xs text-gray-500">Write a new post</p>
                </div>
            </Link>

            <Link
                href="/calendar"
                className="group flex items-center gap-3 px-5 py-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all"
            >
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform">
                    <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-white">Calendar</p>
                    <p className="text-xs text-gray-500">View scheduled posts</p>
                </div>
            </Link>

            <div className="flex items-center gap-3 px-5 py-4 rounded-xl border border-white/10 bg-white/[0.03] opacity-50 cursor-not-allowed">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-gray-500">
                    <BarChart2 className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-white">Analytics</p>
                    <p className="text-xs text-gray-500">Coming soon</p>
                </div>
            </div>
        </div>
    );
}

function UpcomingPosts() {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    Upcoming Posts
                </h2>
                <Link href="/calendar" className="text-xs text-gray-500 hover:text-cyan-400 transition-colors">
                    View all →
                </Link>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] px-6 py-10 text-center">
                <p className="text-sm text-gray-500">No scheduled posts yet.</p>
                <Link href="/compose" className="inline-block mt-3 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                    Create your first post →
                </Link>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
                <div
                    className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse"
                    style={{ animationDelay: '1s' }}
                />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your social accounts and scheduled posts</p>
                </div>

                <Suspense fallback={null}>
                    <DashboardMessages />
                </Suspense>

                <QuickActions />

                <UpcomingPosts />

                <div className="border-t border-gray-800 pt-8">
                    <ConnectedAccounts />
                </div>
            </div>
        </div>
    );
}
