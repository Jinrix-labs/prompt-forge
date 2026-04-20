'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  Send, Clock, Image as ImageIcon, CheckCircle,
  AlertCircle, Loader2, Sparkles, RotateCcw,
} from 'lucide-react';

type Platform = 'twitter' | 'instagram' | 'linkedin';

type ConnectedAccount = {
  platform: Platform;
  platform_username: string;
};

const PLATFORM_CONFIG: Record<Platform, { name: string; limit: number; color: string; icon: ReactNode }> = {
  twitter: {
    name: 'X (Twitter)', limit: 280, color: '#e2e8f0',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
  },
  instagram: {
    name: 'Instagram', limit: 2200, color: '#f472b6',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>,
  },
  linkedin: {
    name: 'LinkedIn', limit: 3000, color: '#60a5fa',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>,
  },
};

type PostMode = 'now' | 'schedule';
type Status = 'idle' | 'loading' | 'success' | 'error';
type AIStatus = 'idle' | 'loading' | 'error';

function isPlatform(p: string): p is Platform {
  return ['twitter', 'instagram', 'linkedin'].includes(p);
}

function normalizeConnectedAccount(row: Record<string, unknown>): ConnectedAccount | null {
  if (typeof row.platform !== 'string' || !isPlatform(row.platform)) return null;
  return {
    platform: row.platform,
    platform_username: typeof row.platform_username === 'string' ? row.platform_username : '',
  };
}

function getPlatformIconStyle(platform: Platform, connected: boolean) {
  if (!connected) return undefined;
  return { color: PLATFORM_CONFIG[platform].color };
}

export default function ComposePage() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState('');
  const [previousContent, setPreviousContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [mode, setMode] = useState<PostMode>('now');
  const [scheduledAt, setScheduledAt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [aiStatus, setAIStatus] = useState<AIStatus>('idle');
  const [aiErrorMsg, setAIErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/connected-accounts')
      .then((r) => (r.ok ? r.json() : { accounts: [] }))
      .then((data: { accounts?: unknown[] }) => {
        const accounts = (data.accounts ?? [])
          .map((a) => normalizeConnectedAccount(a as Record<string, unknown>))
          .filter((a): a is ConnectedAccount => a != null);
        setConnectedAccounts(accounts);
      })
      .finally(() => setLoadingAccounts(false));
  }, []);

  function togglePlatform(platform: Platform) {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  }

  const isConnected = (p: Platform) => connectedAccounts.some((a) => a.platform === p);
  const getUsername = (p: Platform) => connectedAccounts.find((a) => a.platform === p)?.platform_username;

  const strictestLimit = selectedPlatforms.length > 0
    ? Math.min(...selectedPlatforms.map((p) => PLATFORM_CONFIG[p].limit))
    : null;

  const charCount = content.length;
  const overLimit = strictestLimit != null && charCount > strictestLimit;

  async function handleImproveWithAI() {
    if (!content.trim() || aiStatus === 'loading') return;
    setPreviousContent(content);
    setAIStatus('loading');
    setAIErrorMsg('');

    const platformNames = selectedPlatforms.map((p) => PLATFORM_CONFIG[p].name).join(', ');
    const charLimit = strictestLimit != null ? `Keep it under ${strictestLimit} characters.` : '';
    const prompt = selectedPlatforms.length > 0
      ? `Rewrite this social media post to be more engaging and optimized for ${platformNames}. ${charLimit} Only return the improved post text, nothing else. No quotes, no explanation.\n\nOriginal post:\n${content}`
      : `Rewrite this social media post to be more engaging and punchy. Only return the improved post text, nothing else. No quotes, no explanation.\n\nOriginal post:\n${content}`;

    try {
      const res = await fetch('/api/ai/improve-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 402) {
          throw new Error((data as { error?: string }).error || 'No credits remaining for AI improvement. Buy credits or upgrade to continue.');
        }
        throw new Error((data as { error?: string }).error || 'AI request failed');
      }
      const data = await res.json();
      setContent(data.result ?? content);
      setAIStatus('idle');
      textareaRef.current?.focus();
    } catch (err: unknown) {
      setAIStatus('error');
      setAIErrorMsg(err instanceof Error ? err.message : 'AI improvement failed');
      setTimeout(() => { setAIStatus('idle'); setAIErrorMsg(''); }, 5000);
    }
  }

  function handleUndo() {
    if (previousContent) { setContent(previousContent); setPreviousContent(''); }
  }

  async function handleSubmit() {
    if (!content.trim() || selectedPlatforms.length === 0 || overLimit) return;
    if (mode === 'schedule' && !scheduledAt) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          platforms: selectedPlatforms,
          image_url: imageUrl.trim() || null,
          scheduled_at: mode === 'schedule' ? scheduledAt : null,
          status: mode === 'now' ? 'published' : 'scheduled',
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || 'Failed to create post');
      }
      setStatus('success');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  const canSubmit = content.trim().length > 0 && selectedPlatforms.length > 0 &&
    !overLimit && (mode === 'now' || scheduledAt) && status !== 'loading';

  return (
    <div className="z-page">
      <div className="z-page-blob-1" />
      <div className="z-page-blob-2" />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="z-animate mb-8">
          <p className="z-label mb-1">Create</p>
          <h1 className="z-page-title">Compose</h1>
        </div>

        {/* Status banners */}
        {status === 'success' && (
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm mb-5"
            style={{ background: 'var(--z-green-dim)', border: '1px solid var(--z-green-border)', color: 'var(--z-green)' }}>
            <CheckCircle className="w-4 h-4 shrink-0" />
            <p>{mode === 'now' ? 'Post published!' : 'Post scheduled!'} Redirecting…</p>
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm mb-5"
            style={{ background: 'var(--z-red-dim)', border: '1px solid var(--z-red-border)', color: 'var(--z-red)' }}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        <div className="z-animate-2 space-y-3">

          {/* ── Post writer ── */}
          <div className="z-card overflow-hidden">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you want to say?"
              rows={6}
              className="w-full bg-transparent px-5 pt-5 pb-3 text-sm resize-none focus:outline-none"
              style={{ color: 'var(--z-text)', fontFamily: 'var(--z-font)' }}
            />

            {/* AI error */}
            {aiErrorMsg && (
              <div className="mx-4 mb-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                style={{ background: 'var(--z-red-dim)', border: '1px solid var(--z-red-border)', color: 'var(--z-red)' }}>
                <AlertCircle className="w-3 h-3 shrink-0" />
                {aiErrorMsg}
              </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 pb-4 gap-2">
              <div className="flex items-center gap-2">
                {/* AI improve */}
                <button
                  type="button"
                  onClick={handleImproveWithAI}
                  disabled={!content.trim() || aiStatus === 'loading'}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                  style={{
                    background: content.trim() && aiStatus !== 'loading' ? 'var(--z-cyan-dim)' : 'var(--z-surface)',
                    border: `1px solid ${content.trim() && aiStatus !== 'loading' ? 'var(--z-cyan-border)' : 'var(--z-border)'}`,
                    color: content.trim() && aiStatus !== 'loading' ? 'var(--z-cyan)' : 'var(--z-text-3)',
                    cursor: !content.trim() || aiStatus === 'loading' ? 'not-allowed' : 'pointer',
                  }}
                >
                  {aiStatus === 'loading' ? <><Loader2 className="w-3 h-3 animate-spin" />Improving…</> : <><Sparkles className="w-3 h-3" />Improve with AI</>}
                </button>

                {previousContent && aiStatus === 'idle' && (
                  <button type="button" onClick={handleUndo} className="z-btn-ghost">
                    <RotateCcw className="w-3 h-3" />Undo
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {strictestLimit != null ? (
                  <span className="text-xs font-mono tabular-nums" style={{
                    color: overLimit ? 'var(--z-red)' : charCount > strictestLimit * 0.9 ? 'var(--z-yellow)' : 'var(--z-text-3)',
                  }}>
                    {charCount} / {strictestLimit}
                  </span>
                ) : (
                  <span className="text-xs" style={{ color: 'var(--z-text-3)' }}>Select a platform</span>
                )}
                <button type="button" onClick={() => setImageUrl(imageUrl ? '' : ' ')} className="z-btn-ghost">
                  <ImageIcon className="w-3.5 h-3.5" />
                  {imageUrl ? 'Remove image' : 'Add image'}
                </button>
              </div>
            </div>

            {imageUrl !== '' && (
              <div className="px-4 pb-4 pt-3" style={{ borderTop: '1px solid var(--z-border)' }}>
                <input
                  type="url"
                  value={imageUrl.trim()}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste image URL or generate one from Prompts"
                  className="z-input text-xs"
                />
              </div>
            )}
          </div>

          {/* ── Platform selector ── */}
          <div className="z-card p-5">
            <p className="z-label mb-4">Post to</p>
            {loadingAccounts ? (
              <div className="flex gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 w-32 rounded-lg animate-pulse" style={{ background: 'var(--z-surface-2)' }} />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
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
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: selected ? 'var(--z-cyan-dim)' : 'var(--z-surface)',
                        border: `1px solid ${selected ? 'var(--z-cyan-border)' : 'var(--z-border)'}`,
                        color: !connected ? 'var(--z-text-3)' : selected ? 'var(--z-text)' : 'var(--z-text-2)',
                        cursor: !connected ? 'not-allowed' : 'pointer',
                        opacity: !connected ? 0.5 : 1,
                      }}
                    >
                      <span style={getPlatformIconStyle(platform, connected)}>{config.icon}</span>
                      <span>{config.name}</span>
                      {connected && username && (
                        <span className="text-xs" style={{ color: 'var(--z-text-3)' }}>@{username}</span>
                      )}
                      {!connected && <span className="text-xs" style={{ color: 'var(--z-text-3)' }}>Not connected</span>}
                    </button>
                  );
                })}
              </div>
            )}
            {!loadingAccounts && connectedAccounts.length === 0 && (
              <p className="text-xs mt-4" style={{ color: 'var(--z-text-3)' }}>
                No accounts connected.{' '}
                <a href="/dashboard" style={{ color: 'var(--z-cyan)' }}>Connect an account →</a>
              </p>
            )}
          </div>

          {/* ── When ── */}
          <div className="z-card p-5">
            <p className="z-label mb-4">When</p>
            <div className="flex gap-2 mb-4">
              {(['now', 'schedule'] as PostMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: mode === m ? 'var(--z-cyan-dim)' : 'var(--z-surface)',
                    border: `1px solid ${mode === m ? 'var(--z-cyan-border)' : 'var(--z-border)'}`,
                    color: mode === m ? 'var(--z-text)' : 'var(--z-text-2)',
                  }}
                >
                  {m === 'now' ? <><Send className="w-3.5 h-3.5" />Post now</> : <><Clock className="w-3.5 h-3.5" />Schedule</>}
                </button>
              ))}
            </div>
            {mode === 'schedule' && (
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="z-input text-sm [color-scheme:dark]"
              />
            )}
          </div>

          {/* ── Submit ── */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: canSubmit ? 'var(--z-cyan)' : 'var(--z-surface)',
              color: canSubmit ? '#000' : 'var(--z-text-3)',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
            }}
          >
            {status === 'loading' ? (
              <><Loader2 className="w-4 h-4 animate-spin" />{mode === 'now' ? 'Publishing…' : 'Scheduling…'}</>
            ) : mode === 'now' ? (
              <><Send className="w-4 h-4" />Publish now</>
            ) : (
              <><Clock className="w-4 h-4" />Schedule post</>
            )}
          </button>

        </div>
      </div>
    </div>
  );
}
