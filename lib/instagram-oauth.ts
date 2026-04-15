/** Cookie name for Instagram OAuth CSRF state (httpOnly, set on connect). */
export const INSTAGRAM_OAUTH_STATE_COOKIE = 'ig_oauth_state';

/**
 * Canonical site origin for OAuth redirect_uri and post-auth redirects.
 * Must match the URL registered in Meta Developer Console (no trailing slash).
 */
export function getAppBaseUrl(): string {
    return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export function getInstagramCallbackPath(): string {
    return '/api/auth/instagram/callback';
}

/** Full redirect_uri sent to Instagram authorize + token exchange (must match exactly). */
export function getInstagramRedirectUri(): string {
    return `${getAppBaseUrl()}${getInstagramCallbackPath()}`;
}
