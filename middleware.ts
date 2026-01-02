import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/saved',  // Make it public so ProGate handles auth instead of middleware redirect
    '/api/webhook(.*)', // Stripe webhooks
]);

export default clerkMiddleware(async (auth, request) => {
    // Allow viewing public workflows without auth
    const url = new URL(request.url);
    if (url.pathname === '/workflows' && url.searchParams.get('public') === 'true') {
        // Allow public templates page to be viewed without auth
        return;
    }
    
    // Allow API route for public workflows without auth
    if (url.pathname === '/api/workflows' && url.searchParams.get('public') === 'true') {
        // Allow fetching public workflows without auth
        return;
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

