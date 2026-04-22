import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhook(.*)', // Stripe webhooks
    '/api/cron(.*)', // External scheduler (cron-job.org) — auth via CRON_SECRET bearer token
    '/api/auth/instagram/callback(.*)',
    '/api/auth/twitter/callback(.*)',
    '/api/auth/linkedin/callback(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
    const { userId } = await auth();
    if (request.nextUrl.pathname === '/' && userId) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (!isPublicRoute(request)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};

