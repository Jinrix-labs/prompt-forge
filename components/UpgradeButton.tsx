'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UpgradeButtonProps {
    priceId?: string;
    type?: 'subscription' | 'credits';
    label?: string;
}

export function UpgradeButton({ priceId, type = 'subscription', label }: UpgradeButtonProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            // Use new endpoint if priceId provided, otherwise use old endpoint for backward compatibility
            const endpoint = priceId ? '/api/stripe/create-checkout' : '/api/checkout';
            const body = priceId 
                ? JSON.stringify({ priceId, type })
                : undefined;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: body ? { 'Content-Type': 'application/json' } : {},
                body,
            });
            
            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const displayLabel = label || (type === 'credits' ? 'Buy Credits' : 'Upgrade to Pro - $29.99/mo');

    return (
        <button
            onClick={handleUpgrade}
            disabled={loading}
            className="bg-gradient-to-r from-cyan-500 to-magenta-500 text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50"
        >
            {loading ? 'Loading...' : displayLabel}
        </button>
    );
}
