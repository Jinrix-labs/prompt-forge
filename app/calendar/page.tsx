'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, PenSquare, Clock, CheckCircle, XCircle, Loader2, Trash2 } from 'lucide-react';

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
  twitter: '#e2e8f0',
  instagram: '#f472b6',
  linkedin: '#60a5fa',
};

const PLATFORM_ICONS: Record<Platform, ReactNode> = {
  twitter: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
  instagram: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>,
  linkedin: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>,
};

const STATUS_CONFIG = {
  scheduled: { icon: Clock,        color: 'var(--z-yellow)', bg: 'var(--z-yellow-dim)', border: 'var(--z-yellow-border)', dot: '#fbbf24' },
  published: { icon: CheckCircle,  color: 'var(--z-green)',  bg: 'var(--z-green-dim)',  border: 'var(--z-green-border)',  dot: '#34d399' },
  failed:    { icon: XCircle,      color: 'var(--z-red)',    bg: 'var(--z-red-dim)',    border: 'var(--z-red-border)',    dot: '#f87171' },
  draft:     { icon: PenSquare,    color: 'var(--z-text-3)', bg: 'var(--z-surface)',    border: 'var(--z-border)',        dot: '#55555f' },
};

const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function isPlatform(p: string): p is Platform { return ['twitter','instagram','linkedin'].includes(p); }

function normalizePost(p: Record<string, unknown>): Post | null {
  if (!p.id) return null;
  const validStatuses = ['scheduled','published','failed','draft'];
  return {
    id: String(p.id),
    content: String(p.content ?? ''),
    platforms: Array.isArray(p.platforms) ? p.platforms.filter((x): x is Platform => isPlatform(String(x))) : [],
    image_url: p.image_url ? String(p.image_url) : undefined,
    scheduled_at: p.scheduled_at ? String(p.scheduled_at) : undefined,
    published_at: p.published_at ? String(p.published_at) : undefined,
    status: validStatuses.includes(String(p.status)) ? (p.status as Post['status']) : 'draft',
    error_message: p.error_message ? String(p.error_message) : undefined,
    created_at: String(p.created_at ?? ''),
  };
}

function getPostDate(post: Post): Date | null {
  const d = post.scheduled_at || post.published_at || post.created_at;
  return d ? new Date(d) : null;
}

function getPlatformBadgeStyle(platform: Platform) {
  return { color: PLATFORM_COLORS[platform], opacity: 0.85 };
}

export default function CalendarPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  useEffect(() => {
    fetch('/api/posts')
      .then((r) => (r.ok ? r.json() : { posts: [] }))
      .then((data: { posts?: unknown[] }) => {
        const list = (data.posts || [])
          .map((p) => normalizePost(p as Record<string, unknown>))
          .filter((p): p is Post => p != null);
        setPosts(list);
      })
      .finally(() => setLoading(false));
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function getPostsForDay(day: number) {
    return posts.filter((post) => {
      const d = getPostDate(post);
      return d && d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  }

  async function handleDelete(postId: string) {
    setDeletingId(postId);
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (res.ok) setPosts((prev) => prev.filter((p) => p.id !== postId));
    } finally {
      setDeletingId(null);
    }
  }

  const selectedPosts = selectedDay ? getPostsForDay(selectedDay) : [];
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const upcomingScheduled = posts
    .filter((p) => p.status === 'scheduled' && p.scheduled_at)
    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())
    .slice(0, 5);

  return (
    <div className="z-page">
      <div className="z-page-blob-1" />
      <div className="z-page-blob-2" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="z-animate flex items-end justify-between mb-8">
          <div>
            <p className="z-label mb-1">Schedule</p>
            <h1 className="z-page-title">Calendar</h1>
          </div>
          <Link href="/compose" className="z-btn-primary">
            <PenSquare className="w-3.5 h-3.5" />
            New post
          </Link>
        </div>

        <div className="z-animate-2 grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Calendar grid ── */}
          <div className="lg:col-span-2 z-card overflow-hidden">
            {/* Month nav */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--z-border)' }}>
              <button type="button" onClick={() => { setViewDate(new Date(year, month - 1, 1)); setSelectedDay(null); }} className="z-btn-ghost p-1.5">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--z-text)' }}>
                {MONTHS[month]} {year}
              </h2>
              <button type="button" onClick={() => { setViewDate(new Date(year, month + 1, 1)); setSelectedDay(null); }} className="z-btn-ghost p-1.5">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7" style={{ borderBottom: '1px solid var(--z-border)' }}>
              {DAYS.map((d) => (
                <div key={d} className="py-2 text-center text-xs font-medium" style={{ color: 'var(--z-text-3)' }}>{d}</div>
              ))}
            </div>

            {/* Days */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--z-text-3)' }} />
              </div>
            ) : (
              <div className="grid grid-cols-7">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`e-${i}`} className="aspect-square" style={{ borderBottom: '1px solid var(--z-border)', borderRight: '1px solid var(--z-border)' }} />
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
                      className="aspect-square p-1.5 flex flex-col items-start transition-colors"
                      style={{
                        borderBottom: '1px solid var(--z-border)',
                        borderRight: '1px solid var(--z-border)',
                        background: isSelected ? 'var(--z-cyan-dim)' : 'transparent',
                      }}
                    >
                      <span className="text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full mb-1"
                        style={{
                          background: _isToday ? 'var(--z-cyan)' : 'transparent',
                          color: _isToday ? '#000' : isSelected ? 'var(--z-cyan)' : 'var(--z-text-2)',
                        }}>
                        {day}
                      </span>
                      <div className="flex flex-wrap gap-0.5">
                        {dayPosts.slice(0, 3).map((post) => (
                          <div key={post.id} className="w-1.5 h-1.5 rounded-full"
                            style={{ background: STATUS_CONFIG[post.status].dot }} />
                        ))}
                        {dayPosts.length > 3 && (
                          <span className="text-[8px]" style={{ color: 'var(--z-text-3)' }}>+{dayPosts.length - 3}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 px-5 py-3" style={{ borderTop: '1px solid var(--z-border)' }}>
              {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: val.dot }} />
                  <span className="text-xs capitalize" style={{ color: 'var(--z-text-3)' }}>{key}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right panel ── */}
          <div className="space-y-4">

            {/* Selected day */}
            <div className="z-card overflow-hidden">
              <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--z-border)' }}>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--z-text)' }}>
                  {selectedDay ? `${MONTHS[month]} ${selectedDay}` : 'Select a day'}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--z-text-3)' }}>
                  {selectedDay ? `${selectedPosts.length} post${selectedPosts.length !== 1 ? 's' : ''}` : 'Click a date to see posts'}
                </p>
              </div>

              <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                {!selectedDay && (
                  <p className="text-xs text-center py-6" style={{ color: 'var(--z-text-3)' }}>No day selected</p>
                )}
                {selectedDay && selectedPosts.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-xs" style={{ color: 'var(--z-text-3)' }}>No posts on this day</p>
                    <Link href="/compose" className="text-xs mt-2 inline-block" style={{ color: 'var(--z-cyan)' }}>Create a post →</Link>
                  </div>
                )}
                {selectedPosts.map((post) => {
                  const sc = STATUS_CONFIG[post.status];
                  const StatusIcon = sc.icon;
                  const postDate = getPostDate(post);
                  const isDeleting = deletingId === post.id;
                  const canDelete = post.status === 'scheduled' || post.status === 'draft';

                  return (
                    <div key={post.id} className="rounded-xl p-3 transition-opacity"
                      style={{ background: sc.bg, border: `1px solid ${sc.border}`, opacity: isDeleting ? 0.5 : 1 }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1 text-xs font-medium" style={{ color: sc.color }}>
                          <StatusIcon className="w-3 h-3" />
                          <span className="capitalize">{post.status}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {postDate && (
                            <span className="text-xs" style={{ color: 'var(--z-text-3)' }}>
                              {postDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                          {canDelete && (
                            <button type="button" onClick={() => handleDelete(post.id)} disabled={isDeleting}
                              className="transition-colors" style={{ color: 'var(--z-text-3)' }}
                              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--z-red)')}
                              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--z-text-3)')}>
                              {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs line-clamp-3 mb-2" style={{ color: 'var(--z-text-2)' }}>{post.content}</p>
                      <div className="flex items-center gap-1.5">
                        {post.platforms.map((p) => (
                          <span key={p} style={getPlatformBadgeStyle(p)}>{PLATFORM_ICONS[p]}</span>
                        ))}
                      </div>
                      {post.error_message && (
                        <p className="text-xs mt-2 pt-2" style={{ color: 'var(--z-red)', borderTop: '1px solid var(--z-red-border)', opacity: 0.8 }}>
                          {post.error_message}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming */}
            <div className="z-card overflow-hidden">
              <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--z-border)' }}>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--z-text)' }}>Upcoming</h3>
              </div>
              <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
                {upcomingScheduled.map((post) => (
                  <div key={post.id} className="flex items-start gap-2 py-2" style={{ borderBottom: '1px solid var(--z-border)' }}>
                    <Clock className="w-3 h-3 shrink-0 mt-0.5" style={{ color: 'var(--z-yellow)' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate" style={{ color: 'var(--z-text-2)' }}>{post.content}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--z-text-3)' }}>
                        {new Date(post.scheduled_at!).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <button type="button" onClick={() => handleDelete(post.id)} disabled={deletingId === post.id}
                      className="shrink-0 transition-colors" style={{ color: 'var(--z-text-3)' }}
                      onMouseOver={(e) => (e.currentTarget.style.color = 'var(--z-red)')}
                      onMouseOut={(e) => (e.currentTarget.style.color = 'var(--z-text-3)')}>
                      {deletingId === post.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    </button>
                  </div>
                ))}
                {upcomingScheduled.length === 0 && (
                  <p className="text-xs text-center py-4" style={{ color: 'var(--z-text-3)' }}>No upcoming posts</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
