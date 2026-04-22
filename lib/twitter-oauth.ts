import { getAppBaseUrl } from '@/lib/instagram-oauth';

export const TWITTER_OAUTH_TOKEN_COOKIE = 'twitter_oauth_token';
export const TWITTER_OAUTH_TOKEN_SECRET_COOKIE = 'twitter_oauth_token_secret';

export function getTwitterCallbackPath(): string {
    return '/api/auth/twitter/callback';
}

export function getTwitterRedirectUri(): string {
    return `${getAppBaseUrl()}${getTwitterCallbackPath()}`;
}
