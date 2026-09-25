# Carl: voice-first app build plan

> Hand this to Claude Code together with `CLAUDE.md` and the `design/` folder.
> Build **one milestone at a time** (M0 → M9). Each one ends with something you can run and check on your phone.
> If you already have an MVP `SPEC.md`, this file adds to it: it covers the phone app, voice capture and the daily dashboard.

---

## 1. What we're building

**Carl** is an AI admin assistant for solo creatives: freelance designers, photographers, videographers and studio leads.
Thesis: *Let creatives be creative. Let Carl handle the admin.*

This app is Carl's phone interface. It does two things:

1. **Capture by voice, sort later.** Whenever something is on your mind, you hit a shortcut (Action Button, Back Tap, "Hey Siri, tell Carl" or the in-app Talk button) and just talk. Carl then works on it **in the background**:
   - transcribes the memo,
   - filters out what isn't admin (for example "oat milk"),
   - pulls out **tasks, client message drafts, invoices and expenses**,
   - asks a short question when something is unclear ("Which client is *the Taipei one*?"),
   - stages everything on the **Workboard** for your approval.
2. **Show you your day.** The home screen is a **Today dashboard**. It brings together the day's Gmail, Calendar, Obsidian, Notes and Reminders, and Carl adds short notes on what matters. A big record button sits at the bottom of every screen.

### Non-negotiable rules
- **Carl never sends, charges or deletes anything on its own.** Every draft, invoice and expense is *staged*, and a human approves it. Drafts open in Mail or become Gmail drafts. They are never sent automatically.
- **Carl asks instead of guessing.** Anything ambiguous (client, amount, recipient, date) becomes a Question. The item it affects stays `blocked` until you answer.
- **Filter, don't hoard.** Anything that isn't admin is listed as "Left out" with a one-tap "Add as task". It is never silently dropped.
- **Persona:** calm, concise, dry-witted. One or two sentences at most. No exclamation marks and no emoji.

---

## 2. Stack (boring on purpose)

| Layer | Choice | Why |
|---|---|---|
| App | **Next.js (App Router) + TypeScript**, run as a **PWA** | One codebase, installs to the iPhone home screen, and API routes live in the same app |
| Styling | Plain CSS with CSS variables (`app/globals.css`) plus CSS Modules | No design-system dependency; tokens are in §3 |
| DB | **SQLite** via `better-sqlite3` (a single file at `data/carl.db`) | Zero ops, and it runs on the Mac Mini |
| AI sorting | **Anthropic SDK** (`@anthropic-ai/sdk`), model from `CARL_MODEL` (default `claude-sonnet-5`), using **tool use** for structured output | Reliable JSON with no parsing tricks |
| Transcription | `OPENAI_API_KEY` → `gpt-4o-mini-transcribe`; fallback: the browser's live transcript. (Later option: local `whisper.cpp` on the Mac Mini) | Accurate, and swappable |
| Background jobs | In-process queue (`lib/jobs.ts`) plus a `jobs` table; unfinished jobs resume on boot | No Redis and no worker service |
| Hosting | The **Mac Mini** runs `next start`; **Tailscale Serve** gives the phone HTTPS | The mic needs HTTPS. Local files (the Obsidian vault) and macOS apps (Reminders, Notes) are reachable because the server runs on the Mac |
| Tests | Vitest for `lib/`; one Playwright smoke test at phone size | Just enough |

No auth provider in v1. It's a single user, reachable only on your tailnet, and API calls from the iOS Shortcut use a `CARL_API_TOKEN` header.

---

## 3. Design reference

The approved mockups are in `design/`: `Main.dc.html` (Today), `Recording.dc.html`, `Inbox.dc.html` (Memos), `Memo.dc.html`, `Workboard.dc.html`. Treat them as **markup references**. The layout, copy and inline styles are the source of truth, but don't import them as-is.

### Tokens (put these in `globals.css`)
```css
:root {
  --bg: #131211;          /* app background */
  --surface: #1C1A18;     /* cards */
  --raised: #252320;      /* chips, inset boxes */
  --nav: #161513;         /* bottom bar */
  --line: #2A2724;        /* card borders, dividers */
  --line-strong: #34312C; /* outline buttons, pills */
  --attention: #1F1B15;   /* surface for "needs you" cards */

  --text: #EFEBE3;
  --text-2: #D9D4CA;
  --muted: #A8A296;       /* captions: passes 4.5:1 on --surface */
  --faint: #8C867B;       /* past or finished items only */

  --accent: #F0A94B;      /* record, primary actions, anything needing you */
  --accent-ink: #1A1307;  /* text on accent */
  --accent-soft: rgba(240,169,75,0.14);

  --task: #B9CF9B;  --draft: #9DBBEA;  --invoice: #F0C36A;  --expense: #CDB3EA;

  --font-display: 'Instrument Serif', Georgia, serif; /* headings + Carl's voice (italic) */
  --font-ui: 'Geist', system-ui, sans-serif;
  --font-mono: 'Geist Mono', ui-monospace, monospace; /* times, durations, amounts */

  --r-card: 16px; --r-row: 14px; --r-pill: 999px;
}
```
- Dark only for v1. Mobile first: 390px design width, with content capped at 480px on desktop.
- Touch targets are at least 44px. Icons are inline stroke SVGs at 1.8px stroke (no emoji, no icon font).
- **Carl speaks in italic Instrument Serif.** Everything else uses Geist.
- Category colour always comes with a text label. Colour is never the only signal.

### Global layout
**Bottom bar on every main screen:** `Today · Memos · [Talk] · Workboard · Sources`.
"Talk" is a raised 66px amber mic button in the centre that opens `/record`. The Workboard tab shows a badge with the count of items waiting on you. The Record and Memo detail screens hide the bar.

---

## 4. Screens

### 4.1 Today (`/`), the dashboard
From top to bottom:
1. **Header:** Carl mark (amber circle with a serif "C"), and a settings button.
2. **Glance:** mono date line (`FRI · SEP 25 · 12:12`), serif greeting ("Afternoon. Here's your day."), then **Carl's brief** in italic serif (one line, generated). Below it, **source chips** (Gmail, Calendar, Obsidian, Notes, Reminders), each with a status dot, plus "Synced 2 min ago".
3. **Waiting banner** → Workboard: "**6 things** waiting on your OK · 1 question".
4. **Schedule** (Calendar): a timeline with a **NOW** line. Past events are dimmed and the next event has an amber bar. Carl can attach a prep note, for example "Deck v2 isn't sent yet."
5. **Mail worth your time** (Gmail): the top 3 emails. Each shows sender, time, subject and a Carl note, and can carry an action. **Cross-source example:** "Signed SOW, phase 2" from Harbor Coffee → "Probably *the Taipei one* from your 12:04 memo" → [Link to invoice] [Not it]. The footer reads "38 skipped · newsletters, promos, auto-receipts" with See all.
6. **Due:** a checklist that merges Reminders, Workboard tasks and deadlines found in email. Each row shows its source ("Reminders", "Voice memo", "From Gmail").
7. **From your notes** (Obsidian and Notes): recently edited notes with open to-dos or dates → [Add to-dos to Workboard] / [Add to calendar].

### 4.2 Record (`/record`, and `/record?go=1` from shortcuts)
- Starts recording immediately. If the browser blocks that, show a big "Tap to start" button.
- Recording pill, a large mono timer, and the line "Ramble freely. I'll tidy up."
- A **live waveform** (about 36 bars from an `AnalyserNode`) and a **live transcript** card (Web Speech API). Older lines are dimmed and the current line is bright.
- Controls: **Pause/Resume**, **Hand to Carl** (large amber check) and **Add receipt** (camera or photo picker). Receipts are downscaled to at most 1600px JPEG and sent with the memo.
- An X button discards the memo, with a confirmation if it's longer than 5 seconds.
- A "Type instead" fallback for when there's no mic permission or you're on desktop.
- After "Hand to Carl": upload, then go to Memos with the toast "Carl's on it." Processing continues on the server even if you close the app.
- Honest copy: a PWA **cannot keep recording while the phone is locked**. Use "Once you hand it over, you can close the app." For hands-free locked-phone capture, use the iOS Shortcut path (M7).

### 4.3 Memos (`/memos`)
- Filter pills: All · Needs you · Sorted · Filtered. Grouped by day (Today, Yesterday, then dates).
- Each card shows time · duration in mono, a status chip, a two-line excerpt and category chips with counts.
- Status chips: **Sorting…** (amber pulse), **Carl has N question(s)** (amber card border), **Sorted**, **Sorted · approved**, **Filtered** (dashed card with Carl's reason in italic).
- Poll every 2.5s while any memo is still sorting.

### 4.4 Memo detail (`/memos/[id]`)
- Back button; title "Today, 12:04"; a ⋯ menu with Re-sort and Delete.
- Audio player pill (play button, static waveform, duration).
- Carl's summary next to the avatar, in italic serif.
- **Transcript:** each extracted phrase is underlined in its category colour. The underline matches the item's `quote`.
- **Pulled out**, in this order:
  1. **Questions:** option buttons plus "Someone else" (free text). Answering one unblocks the linked items.
  2. **Task:** title, due date and client → Approve / Edit / Dismiss.
  3. **Client draft:** recipient, subject and body preview → Approve (then Open in Mail / Copy) / Edit / Dismiss.
  4. **Invoice:** client, description and amount. While blocked it shows "Waiting on: …".
  5. **Expense:** title, amount (mono), date and category → one-tap ✓.
  6. **Left out:** a dashed row with the quote and reason → Add as task.
- Edit is inline (title, body, amount, due date) and saves with PATCH.

### 4.5 Workboard (`/workboard`)
- Header "Workboard", with the subtitle "Nothing leaves without your OK."
- Segmented tabs: **Needs you · N** / Approved / Done.
- Sections: Tasks, Drafts, Invoices, Expenses, each with a colour dot and a count. Every row links back to its source ("from 12:04").
- Blocked invoice: a dashed amber card with "Blocked: which client?" → [Answer].
- Sticky primary button: "Approve N tasks & expenses". Drafts and invoices always need individual review.

### 4.6 Sources (`/sources`), not yet designed
Lists each integration with its connection status, last sync and a Connect/Disconnect control. Designed in M6.

---

## 5. Data model (SQLite)

```sql
CREATE TABLE memos (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  duration_sec INTEGER,
  audio_path TEXT,                 -- data/files/<id>.m4a|webm
  transcript TEXT,
  transcript_source TEXT,          -- 'server' | 'browser' | 'typed'
  status TEXT NOT NULL,            -- 'sorting' | 'needs_you' | 'sorted' | 'filtered' | 'error'
  summary TEXT,                    -- Carl's one-liner
  error TEXT,
  sorted_at TEXT
);
CREATE TABLE attachments (id TEXT PRIMARY KEY, memo_id TEXT REFERENCES memos(id) ON DELETE CASCADE, path TEXT, mime TEXT);
CREATE TABLE items (
  id TEXT PRIMARY KEY,
  memo_id TEXT REFERENCES memos(id) ON DELETE SET NULL,  -- null for items from other sources
  source TEXT NOT NULL DEFAULT 'memo',                   -- 'memo' | 'obsidian' | 'gmail' | 'manual'
  kind TEXT NOT NULL,              -- 'task' | 'draft' | 'invoice' | 'expense'
  status TEXT NOT NULL,            -- 'pending' | 'blocked' | 'approved' | 'dismissed' | 'done'
  title TEXT NOT NULL,
  quote TEXT,                      -- verbatim span from the transcript
  due TEXT, client TEXT,
  to_name TEXT, to_email TEXT, subject TEXT, body TEXT,      -- drafts
  amount REAL, currency TEXT, date TEXT, category TEXT,      -- invoices/expenses
  question_id TEXT,
  created_at TEXT NOT NULL, updated_at TEXT
);
CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  memo_id TEXT REFERENCES memos(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  options TEXT NOT NULL,           -- JSON array
  field TEXT,                      -- which item field the answer fills: client|amount|due|to|other
  answer TEXT
);
CREATE TABLE filtered (id TEXT PRIMARY KEY, memo_id TEXT REFERENCES memos(id) ON DELETE CASCADE, quote TEXT, reason TEXT);
CREATE TABLE clients (name TEXT PRIMARY KEY, email TEXT, aliases TEXT);   -- aliases JSON, e.g. ["the Taipei one"]
CREATE TABLE jobs (id TEXT PRIMARY KEY, type TEXT, payload TEXT, status TEXT, attempts INTEGER DEFAULT 0, run_after TEXT, last_error TEXT);
CREATE TABLE source_cache (source TEXT, day TEXT, payload TEXT, fetched_at TEXT, PRIMARY KEY (source, day));
CREATE TABLE dashboard_state (day TEXT, key TEXT, value TEXT, PRIMARY KEY (day, key)); -- checked reminders, handled suggestions, brief
```

**Memo status rule** (recomputed after every change): open question → `needs_you`; no items but something left out → `filtered`; otherwise `sorted`.
**Answering a question** sets `item[field] = answer` on every item with that `question_id` and moves them from `blocked` to `pending`. When the field is `client`, it also offers to save the phrase as a client alias ("the Taipei one" → Harbor Coffee). Future memos then resolve it without asking.

---

## 6. The sorting pipeline

```
POST /api/memos ─▶ save audio + attachments ─▶ memo.status = 'sorting' ─▶ enqueue job ─▶ 202
job:  transcribe (server if key, else browser transcript)
   ─▶ build context (today's date + TZ, clients + aliases, today's calendar + mail subjects)
   ─▶ Claude tool call `file_memo` (transcript + receipt images)
   ─▶ validate + write items/questions/filtered in one transaction
   ─▶ recompute status ─▶ done   (on error: retry ×2 with backoff, then status 'error' + Re-sort button)
```

### `file_memo` tool (force it with `tool_choice: {type: "tool", name: "file_memo"}`)
```json
{
  "name": "file_memo",
  "description": "File everything admin-relevant from a voice memo onto the Workboard.",
  "input_schema": {
    "type": "object",
    "required": ["summary", "items", "questions", "filtered"],
    "properties": {
      "summary": { "type": "string", "description": "1–2 short sentences in Carl's voice: calm, concise, dry. What was filed, what needs the user." },
      "items": { "type": "array", "items": { "type": "object", "required": ["kind", "title", "quote"], "properties": {
        "kind": { "enum": ["task", "draft", "invoice", "expense"] },
        "title": { "type": "string" },
        "quote": { "type": "string", "description": "Verbatim substring of the transcript this came from." },
        "due": { "type": "string", "description": "YYYY-MM-DD, only if stated or clearly implied." },
        "client": { "type": "string" },
        "to_name": { "type": "string" }, "to_email": { "type": "string" },
        "subject": { "type": "string" },
        "body": { "type": "string", "description": "Drafts: full message written as the user, ready to review." },
        "amount": { "type": "number" }, "currency": { "type": "string", "description": "ISO 4217" },
        "date": { "type": "string" }, "category": { "type": "string" },
        "question_index": { "type": "integer", "description": "Index into questions if this item can't be finalized until answered." }
      } } },
      "questions": { "type": "array", "items": { "type": "object", "required": ["text", "options", "field"], "properties": {
        "text": { "type": "string" }, "options": { "type": "array", "items": { "type": "string" } },
        "field": { "enum": ["client", "amount", "due", "to", "other"] }
      } } },
      "filtered": { "type": "array", "items": { "type": "object", "required": ["quote", "reason"], "properties": {
        "quote": { "type": "string" }, "reason": { "type": "string" }
      } } }
    }
  }
}
```

### System prompt rules (put them in `lib/prompts.ts`)
- You are Carl, admin assistant to a solo creative. Today is `{date}` (`{weekday}`), timezone `{TZ}`, default currency `{CARL_CURRENCY}` (TWD).
- Extract only admin: tasks, client communication, invoices and expenses. Put everything else in `filtered` with a short reason.
- Resolve relative dates ("Friday", "end of the month", "yesterday") against today's date.
- **Never invent** amounts, emails or clients. If a client is vague ("the Taipei one"), check the known clients and aliases. If it's still ambiguous, ask a question with the likely clients as options.
- Spoken numbers → numbers ("two-forty" → 240). A receipt photo overrides the spoken amount.
- `quote` must be an exact substring of the transcript, because the UI underlines it.
- Drafts are written in the user's voice (short, warm, professional) and are never sent.
- Memos may mix English and Mandarin. Write items in the language of the memo. Write the summary in English unless the memo is entirely in Mandarin.
- Context block: known clients + aliases, today's calendar titles, and today's important mail subjects (these let Carl link things across sources).

### Daily brief
`GET /api/today` returns a computed fallback line right away, then generates Carl's brief in the background (a short Claude call with today's counts and titles). The brief is cached per day, and cleared when the counts change noticeably.

---

## 7. Integrations (Sources)

All sources share one interface, so mocks and real sources can be swapped:
```ts
interface Source {
  id: 'gmail' | 'calendar' | 'obsidian' | 'notes' | 'reminders';
  name: string;
  status(): Promise<'connected' | 'mock' | 'off' | 'error'>;
  today(day: string): Promise<Partial<TodayData>>; // schedule | mail | due | notes
}
```

| Source | How | Notes |
|---|---|---|
| **Obsidian** | Read the vault straight from disk (`OBSIDIAN_VAULT=/Users/you/Vault`). Take notes edited in the last 48h, parse open `- [ ]` to-dos and ISO/natural dates | Easiest real source. Do this first |
| **Google Calendar** | OAuth 2.0 (installed-app flow, refresh token stored locally), scope `calendar.readonly` → today's events | Later: `calendar.events` scope to add events after the user confirms |
| **Gmail** | Same OAuth, scope `gmail.readonly`. Fetch today's inbox, then have Claude rank it as *worth your time* / skipped (with reasons) | Drafts use `gmail.compose` to create a draft, **never send** |
| **Apple Reminders** | macOS bridge: JXA/`osascript` or a tiny Swift CLI using EventKit, run by the server on the Mac Mini | Needs a one-time macOS permission prompt. Alternative: an iOS Shortcut that POSTs your reminders to `/api/sources/reminders` |
| **Apple Notes** | macOS bridge via AppleScript (notes modified today) | Same permission caveat. Read only |

Until a source is real, it returns **mock data** (fixtures in `lib/sources/mock/*.json`) and its chip shows "mock".

---

## 8. Capture shortcuts (iPhone)
1. **In-app:** the Talk button → `/record`.
2. **Open-the-app shortcut:** an iOS Shortcut "Tell Carl" → *Open URL* `https://<mac-mini>.<tailnet>.ts.net/record?go=1`. Assign it to the **Action Button**, **Back Tap** (Settings → Accessibility → Touch → Back Tap) or Siri ("Hey Siri, tell Carl").
3. **Hands-free shortcut (M7):** "Tell Carl" uses Shortcuts' **Record Audio** action → *Get Contents of URL* `POST /api/memos` (multipart: `audio`, header `Authorization: Bearer <CARL_API_TOKEN>`) → shows the notification "Carl's on it." It works without opening the app. This is the best version of "shortcut it and talk."

---

## 9. API surface
```
GET    /api/today                      dashboard payload (schedule, mail, due, notes, brief, waiting counts, sources)
POST   /api/today/actions              { type: 'link_client'|'add_todos'|'add_calendar'|'toggle_due', ... }
GET    /api/memos                      list with item counts + open-question counts
POST   /api/memos                      JSON {audio base64, mime, transcript, durationSec, attachments[]} OR multipart (Shortcut)
GET    /api/memos/:id                  memo + items + questions + filtered
GET    /api/memos/:id/audio            audio stream
POST   /api/memos/:id/resort           re-run the pipeline
DELETE /api/memos/:id
POST   /api/items                      create (e.g. "Add as task" from Left out / Obsidian to-dos)
PATCH  /api/items/:id                  { status?, title?, body?, amount?, due?, client? }
POST   /api/items/approve              { kinds: ['task','expense'] } bulk approve
POST   /api/questions/:id              { answer, saveAlias?: boolean }
GET    /api/sources                    statuses; POST /api/sources/:id/connect (OAuth start)
```
Every mutating route needs either a same-origin request or `Authorization: Bearer CARL_API_TOKEN`.

---

## 10. Milestones

Each milestone is a **separate Claude Code session and a separate commit**. Don't start the next one until the acceptance checks pass on your phone.

### M0: Scaffold + design system
- `create-next-app` (TS, App Router, no Tailwind), `globals.css` tokens, fonts (Instrument Serif, Geist, Geist Mono), `<BottomNav>` with the raised Talk button, empty routes for all 5 screens, PWA `manifest.ts` + icons + `apple-mobile-web-app-capable`.
- ✅ Installs to the iPhone home screen, all tabs navigate, and it looks like the mockups' chrome.

### M1: Data layer + seed
- `lib/db.ts` (better-sqlite3, the migrations in §5), `lib/repo/*.ts`, and `scripts/seed.ts` with the demo memos from the mockups (Lumen shoot, Harbor deck, pitch brain dump, oat milk).
- ✅ `npm run seed` then the Memos and Workboard pages render seed data (read-only).

### M2: Capture
- `/record`: MediaRecorder (`audio/mp4` on Safari, `audio/webm` elsewhere), waveform, timer, pause, live transcript, receipt photos, typed fallback, discard. `POST /api/memos` stores files in `data/files/`.
- ✅ Record 20s on the iPhone → the memo appears in Memos as **Sorting…** with playable audio.

### M3: Sorting pipeline
- `lib/jobs.ts` queue (resumes on boot), `lib/transcribe.ts`, `lib/prompts.ts`, `lib/sort.ts` (Claude `file_memo`), validation (quotes must be real substrings, otherwise drop the underline), retries, error state + Re-sort.
- Include a **mock sorter** (keyword rules) so the app works with no API key.
- ✅ Say the Lumen/parking/Taipei memo → within about 15s: 1 task, 1 draft, 1 expense, 1 blocked invoice + a client question, and oat milk in Left out.

### M4: Memo detail + Workboard actions
- Everything in §4.4–4.5: approve/edit/dismiss/undo, answer questions (+ save alias), Open in Mail (`mailto:`) / Copy for drafts, bulk approve, tabs, badge count.
- ✅ Answering "Harbor Coffee" unblocks the invoice. The Workboard count and badge update. Nothing is ever sent.

### M5: Today dashboard (mock sources)
- `Source` interface + mock fixtures, `/api/today`, every section in §4.1, NOW line, Due checklist merging Reminders + tasks, Carl's brief (fallback + Claude).
- ✅ The dashboard matches `design/Main.dc.html`. Checking off a memo task on Today marks it done on the Workboard.

### M6: Real sources, part 1: Obsidian + Google
- Obsidian vault reader; Google OAuth (local callback), Calendar + Gmail read; Gmail triage (Claude ranks the top 3 + skipped count); `/sources` screen.
- ✅ Today shows the real calendar, real inbox picks and real Obsidian to-dos. Revoking a source falls back to mock cleanly.

### M7: Hands-free capture + HTTPS
- `CARL_API_TOKEN`, multipart upload path, a step-by-step README for the "Tell Carl" Shortcut (Record Audio → POST), Action Button / Back Tap / Siri setup, and `tailscale serve --bg 3000`.
- ✅ Press the Action Button with the phone locked → speak → the memo is sorted on the Mac Mini without opening the app.

### M8: Cross-source linking
- Feed today's mail and calendar context into sorting, plus a **suggestions pass** after each sync. It matches open questions to evidence (the Harbor Coffee SOW email → "the Taipei one") and surfaces [Link] / [Not it] on Today.
- Calendar prep notes ("Deck v2 isn't sent yet" before the Harbor call).
- ✅ The design's Harbor Coffee example works end to end with real data.

### M9: Real sources, part 2 + polish
- Apple Reminders + Notes via the macOS bridge; create Gmail *drafts* for approved client drafts; empty states, offline/error toasts, Vitest for `lib/`, a Playwright smoke test at 390×844.
- ✅ A full day of real use with no dead ends.

---

## 11. Environment (`.env.example`)
```
ANTHROPIC_API_KEY=
CARL_MODEL=claude-sonnet-5
OPENAI_API_KEY=                 # optional: better transcription
CARL_TRANSCRIBE_MODEL=gpt-4o-mini-transcribe
CARL_API_TOKEN=                 # long random string, used by the iOS Shortcut
CARL_CURRENCY=TWD
TZ=Asia/Taipei
OBSIDIAN_VAULT=                 # absolute path on the Mac Mini
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## 12. Open questions (answer before the milestone that needs them)
- Invoicing: which tool do approved invoices go to (a PDF template, Stripe, a Taiwan e-invoice provider or a spreadsheet)? Until that's decided, "approved" means *ready to create*.
- Drafts: Gmail drafts, or `mailto:` only?
- Are memos mostly English, Mandarin or mixed? This affects the transcription model choice.
- Do expenses need tax categories that match your accountant's sheet?
