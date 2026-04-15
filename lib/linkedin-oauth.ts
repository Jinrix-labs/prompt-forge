import { getAppBaseUrl } from '@/lib/instagram-oauth';

/** Cookie name for LinkedIn OAuth CSRF state (httpOnly, set on connect). */
export const LINKEDIN_OAUTH_STATE_COOKIE = 'linkedin_oauth_state';

export function getLinkedInCallbackPath(): string {
    return '/api/auth/linkedin/callback';
}

/** Full redirect_uri for LinkedIn authorize + token exchange (must match LinkedIn app settings). */
export function getLinkedInRedirectUri(): string {
    return `${getAppBaseUrl()}${getLinkedInCallbackPath()}`;
}
