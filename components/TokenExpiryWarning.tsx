'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, X } from 'lucide-react';

type Platform = 'twitter' | 'instagram' | 'linkedin';

type ConnectedAccount = {
    platform: Platform;
    platform_username: string;
    token_expires_at?: string | null;
};

type ExpiringAccount = {
    platform: Platform;
    platform_username: string;
    token_expires_at: string;
    daysLeft: number;
};

const PLATFORM_NAMES: Record<Platform, string> = {
    twitter: 'X (Twitter)',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
};

function isPlatform(value: unknown): value is Platform {
    return value === 'twitter' || value === 'instagram' || value === 'linkedin';
}

function normalizeAccount(row: Record<string, unknown>): ConnectedAccount | null {
    if (!isPlatform(row.platform)) return null;
    return {
        platform: row.platform,
        platform_username:
            typeof row.platform_username === 'string' ? row.platform_username : '',
        token_expires_at:
            typeof row.token_expires_at === 'string' ? row.token_expires_at : null,
    };
}

function accountKey(account: Pick<ExpiringAccount, 'platform' | 'platform_username'>): string {
    return `${account.platform}:${account.platform_username}`;
}

export default function TokenExpiryWarning() {
    const [expiring, setExpiring] = useState<ExpiringAccount[]>([]);
    const [dismissed, setDismissed] = useState<string[]>([]);

    useEffect(() => {
        fetch('/api/connected-accounts')
            .then((r) => (r.ok ? r.json() : { accounts: [] }))
            .then((data: { accounts?: unknown[] }) => {
                const now = Date.now();
                const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

                const soon: ExpiringAccount[] = (data.accounts ?? [])
                    .map((a) => normalizeAccount(a as Record<string, unknown>))
                    .filter((a): a is ConnectedAccount => a != null)
                    .filter((a) => typeof a.token_expires_at === 'string')
                    .filter((a) => {
                        const expiresAt = new Date(a.token_expires_at!).getTime();
                        return expiresAt > now && expiresAt - now < sevenDaysMs;
                    })
                    .map((a) => ({
                        platform: a.platform,
                        platform_username: a.platform_username,
                        token_expires_at: a.token_expires_at!,
                        daysLeft: Math.max(
                            1,
                            Math.ceil(
                                (new Date(a.token_expires_at!).getTime() - now) /
                                    (1000 * 60 * 60 * 24)
                            )
                        ),
                    }));

                setExpiring(soon);
            })
            .catch(() => setExpiring([]));
    }, []);

    const visible = useMemo(
        () => expiring.filter((a) => !dismissed.includes(accountKey(a))),
        [dismissed, expiring]
    );

    if (visible.length === 0) return null;

    return (
        <div className="space-y-3 mb-6">
            {visible.map((account) => (
                <div
                    key={accountKey(account)}
                    className="flex items-start justify-between gap-4 px-4 py-3 rounded-xl border border-yellow-400/20 bg-yellow-400/5 text-sm"
                >
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-yellow-200 font-medium">
                                {PLATFORM_NAMES[account.platform]} connection expiring soon
                            </p>
                            <p className="text-yellow-400/70 text-xs mt-0.5">
                                @{account.platform_username || 'account'} —{' '}
                                {account.daysLeft === 1
                                    ? 'expires tomorrow'
                                    : `expires in ${account.daysLeft} days`}
                                {account.platform === 'linkedin' && (
                                    <span>
                                        {' '}
                                        · LinkedIn requires manual reconnection.{' '}
                                        <Link
                                            href="/dashboard"
                                            className="text-yellow-300 hover:text-yellow-200 underline underline-offset-2"
                                        >
                                            Reconnect now →
                                        </Link>
                                    </span>
                                )}
                                {account.platform !== 'linkedin' && (
                                    <span> · Will be refreshed automatically.</span>
                                )}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setDismissed((prev) => [...prev, accountKey(account)])}
                        className="text-yellow-400/50 hover:text-yellow-400 transition-colors shrink-0"
                        aria-label="Dismiss warning"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
