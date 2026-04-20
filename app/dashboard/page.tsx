'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle,
  AlertCircle,
  PenSquare,
  CalendarDays,
  BarChart2,
} from 'lucide-react';
import ConnectedAccounts from '@/components/ConnectedAccounts';
import UpcomingPosts from '@/components/UpcomingPosts';
import TokenExpiryWarning from '@/components/TokenExpiryWarning';

function DashboardMessages() {
  const searchParams = useSearchParams();
  const success  = searchParams.get('success');
  const instagram = searchParams.get('instagram');
  const linkedin  = searchParams.get('linkedin');
  const twitter   = searchParams.get('twitter');
  const error     = searchParams.get('error');
  const reason    = searchParams.get('reason');

  const errorMessages: Record<string, string> = {
    no_code:                'No authorization code was returned. Try connecting again.',
    invalid_state:          'Security check failed. Please try connecting again.',
    server_config:          'Server configuration is incomplete. Contact support.',
    instagram_connect_failed:'Could not complete Instagram connection. Please try again.',
    instagram_oauth_denied: 'Instagram authorization was cancelled or denied.',
    linkedin_connect_failed:'Could not complete LinkedIn connection. Please try again.',
    linkedin_oauth_denied:  'LinkedIn authorization was cancelled or denied.',
    twitter_denied:         'X (Twitter) authorization was cancelled or denied.',
    twitter_missing_params: 'X authorization returned incomplete data. Try again.',
    twitter_invalid_state:  'X security check failed. Please try connecting again.',
    twitter_db_error:       'X connected but saving your account failed. Please contact support.',
    twitter_connect_failed: 'Could not complete X connection. Please try again.',
    db_error:               'Connected but saving your account failed. Please contact support.',
  };

  const hasMessage = success || instagram || linkedin || twitter || error;
  if (!hasMessage) return null;

  return (
    <div className="space-y-2 mb-6">
      {success === 'true' && (
        <div className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
          style={{ background: 'var(--z-green-dim)', border: '1px solid var(--z-green-border)', color: 'var(--z-green)' }}>
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>Subscription activated successfully.</p>
        </div>
      )}
      {instagram === 'connected' && (
        <div className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
          style={{ background: 'var(--z-cyan-dim)', border: '1px solid var(--z-cyan-border)', color: 'var(--z-cyan)' }}>
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>Instagram connected successfully.</p>
        </div>
      )}
      {linkedin === 'connected' && (
        <div className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(10,102,194,0.1)', border: '1px solid rgba(10,102,194,0.25)', color: '#60a5fa' }}>
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>LinkedIn connected successfully.</p>
        </div>
      )}
      {twitter === 'connected' && (
        <div className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
          style={{ background: 'var(--z-surface)', border: '1px solid var(--z-border)', color: 'var(--z-text)' }}>
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>X (Twitter) connected successfully.</p>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
          style={{ background: 'var(--z-red-dim)', border: '1px solid var(--z-red-border)', color: 'var(--z-red)' }}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p>{errorMessages[error] ?? 'Something went wrong.'}</p>
            {reason && <p className="text-xs mt-1 opacity-70">Reason: {reason}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="z-page">
      <div className="z-page-blob-1" />
      <div className="z-page-blob-2" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="z-animate mb-8 flex items-end justify-between">
          <div>
            <p className="z-label mb-1">Overview</p>
            <h1 className="z-page-title">Dashboard</h1>
          </div>
          <Link
            href="/compose"
            className="z-btn-primary"
          >
            <PenSquare className="w-3.5 h-3.5" />
            New post
          </Link>
        </div>

        {/* Messages */}
        <Suspense fallback={null}>
          <DashboardMessages />
        </Suspense>

        {/* Token expiry warnings */}
        <TokenExpiryWarning />

        {/* Quick actions */}
        <div className="z-animate-2 grid grid-cols-3 gap-3 mb-8">
          <Link
            href="/compose"
            className="z-card z-card-hover z-card-glow group flex flex-col gap-3 p-4"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ background: 'var(--z-cyan-dim)', color: 'var(--z-cyan)' }}>
              <PenSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--z-text)' }}>Compose</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--z-text-3)' }}>Write a post</p>
            </div>
          </Link>

          <Link
            href="/calendar"
            className="z-card z-card-hover group flex flex-col gap-3 p-4"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ background: 'var(--z-surface-2)', color: 'var(--z-text-2)' }}>
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--z-text)' }}>Calendar</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--z-text-3)' }}>View schedule</p>
            </div>
          </Link>

          <div className="z-card flex flex-col gap-3 p-4 opacity-40 cursor-not-allowed">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--z-surface-2)', color: 'var(--z-text-3)' }}>
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--z-text)' }}>Analytics</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--z-text-3)' }}>Coming soon</p>
            </div>
          </div>
        </div>

        {/* Upcoming posts */}
        <div className="z-animate-3">
          <UpcomingPosts />
        </div>

        {/* Connected accounts */}
        <div className="z-animate-3 mt-2">
          <div className="z-divider mb-8" />
          <ConnectedAccounts />
        </div>

      </div>
    </div>
  );
}
