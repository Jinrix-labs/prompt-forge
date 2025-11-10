'use client';

import { useState } from 'react';

export function UpgradeButton() {
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
            });
            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleUpgrade}
            disabled={loading}
            className="bg-gradient-to-r from-cyan-500 to-magenta-500 text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50"
        >
            {loading ? 'Loading...' : 'Upgrade to Pro - $29.99/mo'}
        </button>
    );
}
