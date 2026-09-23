# Carl

An admin assistant for solo creatives. You do the creative work; Carl does the admin.

Stack: Next.js 16 (App Router) · TypeScript · Supabase (Postgres, magic-link auth, Storage) · Vercel AI SDK · Tailwind 4 + shadcn/ui.

> Next.js 16 note: request middleware lives in `src/proxy.ts` (the `middleware` file is deprecated), and `cookies()`, `params` and `searchParams` are async only.

## Local development

Prereqs: Node 20+, Docker (for the Supabase CLI).

```bash
npm install
npm run db:start           # runs `supabase start`; prints API URL + publishable key
cp .env.example .env.local # paste the URL and publishable key in
npm run dev                # http://localhost:3000
```

Sign in: enter any email on `/login`, then open **Mailpit** at http://127.0.0.1:54324 and click the link. Open it in the same browser you requested it from.

Useful scripts:

| script | what it does |
| --- | --- |
| `npm run dev` | Next dev server |
| `npm run lint` / `npm run typecheck` | ESLint / route typegen + `tsc` |
| `npm run db:start` / `db:stop` | Local Supabase stack |
| `npm run db:reset` | Re-apply migrations + seed (step 2 onwards) |

## Auth flow

- `/login` → server action calls `signInWithOtp` with `emailRedirectTo = <origin>/auth/confirm`.
- `/auth/confirm` accepts either `token_hash` + `type` (our email template; works across devices) or `code` (Supabase's default PKCE template; same browser only), sets the session cookie, and redirects to `/`.
- `src/proxy.ts` refreshes the session on every request and sends signed-out users to `/login` (API routes get a 401).
- Local email templates live in `supabase/templates/` and are wired up in `supabase/config.toml`.

## Deploying to Vercel

1. **Create a Supabase project** at supabase.com. Later steps push the schema with `npx supabase link --project-ref <ref> && npx supabase db push`.
2. **Import the repo in Vercel** (framework preset: Next.js, no overrides).
3. **Env vars** (Project → Settings → Environment Variables), for Production and Preview:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`; both are accepted)
   - `NEXT_PUBLIC_SITE_URL`: production only, e.g. `https://carl.vercel.app`. Leave it unset on Preview so previews use their own host.
   - The Vercel ↔ Supabase integration can set the first two for you.
4. **Supabase Auth → URL Configuration**:
   - Site URL: your production URL.
   - Redirect URLs: `https://<prod-domain>/auth/confirm` and `https://*-<team>.vercel.app/auth/confirm` for previews.
5. **Supabase Auth → Email Templates → Magic Link** (and **Confirm signup**): replace the link with
   ```html
   <a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">Sign in</a>
   ```
   so links work even when opened on a different device. The default template also works, but only in the browser that asked for the link.
6. Deploy. Hosted Supabase's built-in mailer is rate limited (a few emails an hour). Add custom SMTP before you have real users.

## Build order

1. ✅ Scaffold + magic-link auth + Vercel deploy
2. Schema, RLS, seed data
3. Two-column layout, streaming chat + persona, persisted messages
4. Read-only Workboard with overdue badges
5. `create_tasks` end-to-end + `evals/` (`npm run eval`)
6. Clients + drafts + copy
7. Invoices + status buttons
8. Expenses + receipt upload + CSV export
9. Full lookbook example in one message; ~25 evals
10. Polish: undo, empty states, tool errors in Carl's voice, shortcuts
