# CLAUDE.md: working on Carl

Read `PLAN.md` first. It is the source of truth for product, screens, data model and milestones.
Visual reference: `design/*.dc.html` (static mockups; copy the layout, copy text and tokens, not the file format).

## How we work
- Build **one milestone per session** (M0 → M9 in PLAN.md §10). Tell me which milestone you're on before writing code.
- Finish each milestone by running its ✅ acceptance check, then stop and summarize what changed and how to test it on the phone.
- Small commits with clear messages. Don't start the next milestone unprompted.
- If PLAN.md is ambiguous or wrong, ask. Don't guess. Update PLAN.md when we agree on a change.

## Stack rules
- Next.js App Router + TypeScript (strict). Plain CSS with the variables in PLAN.md §3, plus CSS Modules. No Tailwind, no UI kit.
- SQLite via `better-sqlite3` at `data/carl.db`; migrations in `lib/db/migrations/*.sql`, applied on boot.
- Anthropic via `@anthropic-ai/sdk`; the model comes from `CARL_MODEL`. Structured output **only** through tool use (`file_memo`).
- Keep dependencies few and boring. Ask before adding any package that isn't listed in PLAN.md §2.
- `data/` and `.env` are gitignored.

## Product rules (never break these)
- Carl **never sends, charges or deletes** on its own. Everything is staged for approval. Gmail integration creates *drafts* only.
- Ambiguity becomes a Question, and the affected items stay `blocked` until it's answered.
- Non-admin content goes to "Left out" with a reason, never silently dropped.
- Carl's copy: calm, concise, dry. 1–2 sentences. No exclamation marks, no emoji.
- Every AI- or user-provided string renders as text (no `dangerouslySetInnerHTML`).

## UI rules
- Mobile first at 390px wide; dark only; touch targets ≥ 44px; real `<button>`/`<a>`/`<label>` elements.
- Carl's voice = italic Instrument Serif. UI = Geist. Times/amounts = Geist Mono.
- Category colour always sits next to a text label.
- Check each screen at 390×844 against its mockup before calling a milestone done.

## Commands (fill in as they exist)
- `npm run dev`: dev server on :3000
- `npm run seed`: reset demo data
- `npm test`: Vitest
- Phone testing over HTTPS: `tailscale serve --bg 3000`
