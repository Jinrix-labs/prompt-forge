// Simple in-memory per-key daily rate limiter.
// Note: In-memory storage resets on server restart and may not be shared across serverless instances.

const store = new Map();

function getMidnightUtcTimestamp() {
    const now = new Date();
    return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0);
}

export function checkAndIncrementDailyLimit(key, limit) {
    const todayKey = `${key}:${new Date().toISOString().slice(0, 10)}`; // YYYY-MM-DD
    const existing = store.get(todayKey) || { count: 0, resetAt: getMidnightUtcTimestamp() };

    // Reset if past reset time
    if (Date.now() > existing.resetAt) {
        existing.count = 0;
        existing.resetAt = getMidnightUtcTimestamp();
    }

    if (existing.count >= limit) {
        return {
            allowed: false,
            limit,
            used: existing.count,
            remaining: 0,
            resetAt: existing.resetAt,
        };
    }

    existing.count += 1;
    store.set(todayKey, existing);

    return {
        allowed: true,
        limit,
        used: existing.count,
        remaining: Math.max(0, limit - existing.count),
        resetAt: existing.resetAt,
    };
}


