# Carl

Personal AI Assistant so that creatives can be creatives.

Chat-first admin assistant for solo creatives. The product spec lives in [`SPEC.md`](./SPEC.md); read it before changing anything.

**Status:** M0 (skeleton): Next.js App Router, local Supabase, magic-link auth, Vercel-ready.

## Prerequisites

- Node.js 20.9+ (22 recommended)
- Docker (for local Supabase)

## Local development

```bash
npm install
npm run db:start            # boots local Supabase in Docker (first run pulls images)
npm run db:status           # prints API URL, Publishable key, Mailpit URL
cp .env.example .env.local  # paste API URL + Publishable key into it
npm run dev                 # http://localhost:3000
```

Log in locally:

1. Open http://localhost:3000. You are redirected to `/login`.
2. Enter any email and click **Send magic link**.
3. Open Mailpit at http://127.0.0.1:54324, open the email, click the link.
4. You land on `/` showing "Signed in" and your email. **Sign out** returns you to `/login`.

Use `localhost`, not `127.0.0.1`, in the browser: the magic link redirects to `localhost:3000`, and the PKCE cookie must be on the same host.

Checks: `npm run lint`, `npm run typecheck`, `npm run build`.

## Deploy (Vercel + hosted Supabase)

1. **Supabase:** create a project at supabase.com. From *Project Settings → API Keys*, copy the project URL and the publishable key (the legacy anon key also works).
2. **Vercel:** import this repo (framework preset: Next.js). Add env vars for Production and Preview:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   Deploy.
3. **Supabase → Authentication → URL Configuration:**
   - Site URL: `https://<your-app>.vercel.app`
   - Redirect URLs: `https://<your-app>.vercel.app/auth/callback` and, for previews, `https://*-<your-team>.vercel.app/auth/callback`
4. Open the live URL, request a magic link, click it in your inbox. Landing on `/` with your email shown is the M0 "Done when" check.

The built-in Supabase email sender is rate-limited (a few emails per hour). Fine for M0; add custom SMTP later if needed.

## Layout

```
src/proxy.ts                  session refresh + auth redirect (Next 16 "proxy", formerly middleware)
src/lib/env.ts                Zod-validated public env
src/lib/supabase/             browser, server, and proxy Supabase clients
src/app/login/                magic-link form + server action
src/app/auth/callback/        exchanges the magic-link code for a session
src/app/auth/signout/         POST to sign out
supabase/config.toml          local Supabase config
```
