# ZUNNO

Zunno is an AI-assisted social media scheduler for creators and small teams.

It helps you:
- connect social accounts (X, Instagram, LinkedIn),
- draft and improve posts with AI,
- schedule or publish posts,
- track usage/credits and subscription access.

## Current Product Scope

- Web app with marketing pages and authenticated dashboard flow.
- Compose workflow for writing and improving posts.
- Multi-platform posting support:
  - X (Twitter)
  - Instagram
  - LinkedIn
- Calendar and upcoming post management.
- Connected account management (connect/disconnect per platform).
- Stripe billing and Clerk-authenticated user access.
- Background cron endpoints for publish jobs and token refresh where applicable.

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Clerk (authentication)
- Supabase (app data storage)
- Stripe (billing)
- twitter-api-v2 (Twitter/X integration)

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Copy env template and fill values:

```bash
cp env.example .env.local
```

3. Start dev server:

```bash
npm run dev
```

4. Open:

`http://localhost:3000`

## Environment Variables

Use `env.example` as the source of truth.

At minimum for end-to-end local testing, configure:
- Clerk keys
- Supabase URL + keys
- `NEXT_PUBLIC_APP_URL`
- AI provider key(s) used in your workflow
- Social OAuth credentials:
  - Instagram (Meta)
  - LinkedIn
  - X via OAuth 1.0a:
    - `TWITTER_CONSUMER_KEY`
    - `TWITTER_CONSUMER_SECRET`
- Stripe keys if you want to test checkout/webhooks

Important: OAuth callback URLs in provider dashboards must exactly match your app URL + callback routes.

## Key App Routes

- `/` marketing landing page
- `/dashboard` account overview and connected accounts
- `/compose` create/improve/schedule posts
- `/calendar` scheduled content view
- `/pricing` subscription plans
- `/sign-in` and `/sign-up` auth entry points

## API Overview

Main API groups under `app/api` include:
- social auth connect/callback routes
- post creation and publishing routes
- connected accounts routes
- AI generation/improvement routes
- Stripe checkout/webhook routes
- cron routes for publish/maintenance tasks

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Notes

- Keep production secrets server-side only.
- Ensure Clerk middleware allows OAuth callback endpoints.
- For platform integration troubleshooting, check deployment logs for callback route errors.

## License

MIT
