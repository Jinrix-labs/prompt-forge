import { getAppBaseUrl } from '@/lib/instagram-oauth';

export const TWITTER_OAUTH_STATE_COOKIE = 'twitter_oauth_state';
export const TWITTER_CODE_VERIFIER_COOKIE = 'twitter_code_verifier';

export function getTwitterCallbackPath(): string {
    return '/api/auth/twitter/callback';
}

export function getTwitterRedirectUri(): string {
    return `${getAppBaseUrl()}${getTwitterCallbackPath()}`;
}
