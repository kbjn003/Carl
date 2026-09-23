# Carl MVP Spec

Sep 23, 2026 · @Someone

## Overview

Carl is a chat-first admin assistant for solo creatives: the user dumps messy updates, Carl stages tasks, drafts, invoices and expenses for one-click approval. Thesis: let creatives be creative, let Carl handle the admin.

**Users:** solo creatives, freelance designers, photographers, videographers, studio leads.

**V1 scope:**

1. Task decomposition: multi-intent brain dumps become tasks with due dates and priority.
2. Client comms staging: ready-to-send email or message drafts, human-approved.
3. Invoicing and cash flow: milestone invoices, payment-request drafts, overdue tracking.
4. Expense and tax logging: receipts parsed, expenses categorized by project and marked deductible.

**Core loop:**

```mermaid
flowchart LR
  A[Brain dump in chat] --> B[Carl replies in 1-2 lines]
  B --> C[Tool calls stage records]
  C --> D[Workboard cards]
  D --> E[User approves or copies]
```

Example input: "Client approved the final cut for the lookbook. Need to invoice them the remaining $2,400 balance, write off the $85 hard drive from B&H, and remind Marcus his $500 retainer is 4 days overdue." Expected output: a staged $2,400 invoice, an $85 equipment expense marked deductible, a sent $500 invoice to Marcus showing 4 days overdue, a staged reminder draft to Marcus, and suggested follow-up tasks.

**UI:** dark mode, two columns. Left 60% is the chat stream. Right 40% is the Workboard with tabs for Tasks, Drafts, and Financials (Invoices, Expenses).

**Persona:** calm, concise, dry-witted, operationally sharp. Never cheerful filler. Short chat replies; structure goes to the Workboard.

**Guardrail:** human-in-the-loop always. Carl stages; he never sends, charges, or edits external ledgers.

## Stack

One Next.js app on Vercel, backed by Supabase, with the Vercel AI SDK handling the agent loop.

| Layer | Choice | Why |
| --- | --- | --- |
| App | Next.js (App Router) + TypeScript | One repo, API routes and UI together |
| Hosting | Vercel | Zero-config deploys and previews |
| Data, auth, files | Supabase: Postgres, magic-link auth, Storage for receipts | Row-level security, local dev via Supabase CLI |
| Agent | Vercel AI SDK: `streamText` with tools, `useChat` on client | Streaming, tool loops, provider swap in one line |
| Validation | Zod | Every tool input and DB write is schema-checked |
| UI | Tailwind + shadcn/ui, dark theme | Fast, consistent components |
| Client data | TanStack Query | Refetch Workboard after tool calls; no Realtime in V1 |
| Model | Hosted frontier model with strong tool calling (e.g. Claude Sonnet) | Reliable multi-intent tool calls on financial data |

**Architecture rule:** Postgres is the single source of truth. No n8n, Hermes, or Obsidian in the product path.

**Local model option:** llama.cpp exposes an OpenAI-compatible server, so gpt-oss-20b can be swapped in for dev. Let the eval suite decide whether it handles multi-intent dumps without dropping items.

## Schema

Eight tables plus one view; money is integer cents, overdue is derived, and every row is locked to its owner by RLS.

Conventions:

- Text columns with check constraints instead of Postgres enums, so values are easy to change.
- One invoice row per milestone; no separate milestones table.
- Explicit tasks land as `open`; tasks Carl infers land as `suggested` with one-tap accept.
- `source_message_id` on every staged record traces it back to the chat message that created it.

```sql
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  business_name text,
  currency text not null default 'USD',
  timezone text not null default 'UTC'
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  client_id uuid references clients on delete set null,
  name text not null,
  status text not null default 'active'
    check (status in ('active','delivered','archived')),
  created_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  role text not null check (role in ('user','assistant')),
  parts jsonb not null,               -- AI SDK message parts incl. tool calls
  created_at timestamptz not null default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  project_id uuid references projects on delete set null,
  title text not null,
  due_on date,
  priority text not null default 'normal'
    check (priority in ('low','normal','high','urgent')),
  status text not null default 'open'
    check (status in ('suggested','open','done','dismissed')),
  source_message_id uuid references messages on delete set null,
  created_at timestamptz not null default now()
);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  client_id uuid not null references clients,
  project_id uuid references projects on delete set null,
  description text not null,
  amount_cents bigint not null check (amount_cents > 0),
  currency text not null default 'USD',
  due_on date,
  status text not null default 'staged'
    check (status in ('staged','sent','paid','void')),
  sent_on date,
  paid_on date,
  source_message_id uuid references messages on delete set null,
  created_at timestamptz not null default now()
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  project_id uuid references projects on delete set null,
  vendor text not null,
  description text,
  amount_cents bigint not null check (amount_cents > 0),
  currency text not null default 'USD',
  spent_on date not null default current_date,
  category text not null check (category in (
    'equipment','software','rentals','props_wardrobe','travel','meals',
    'contractors','education','marketing','office','other')),
  deductible boolean not null default true,
  receipt_path text,                  -- Supabase Storage key
  status text not null default 'staged'
    check (status in ('staged','confirmed','dismissed')),
  source_message_id uuid references messages on delete set null,
  created_at timestamptz not null default now()
);

create table drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  client_id uuid references clients on delete set null,
  invoice_id uuid references invoices on delete set null,
  channel text not null default 'email' check (channel in ('email','text','dm')),
  subject text,
  body text not null,
  status text not null default 'staged'
    check (status in ('staged','copied','dismissed')),
  source_message_id uuid references messages on delete set null,
  created_at timestamptz not null default now()
);

create view invoice_board with (security_invoker = true) as
select *,
  (status = 'sent' and due_on < current_date) as is_overdue,
  greatest(current_date - due_on, 0)          as days_overdue
from invoices;

-- RLS: repeat for every table (profiles uses id instead of user_id)
alter table clients enable row level security;
create policy own_rows on clients for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
```

## Agent tools

Seven tools, all taking names instead of UUIDs; the server resolves "Marcus" to a client with a case-insensitive match and creates the client if none exists.

```ts
create_tasks({ tasks: [{ title, due_on?, priority?, project?, inferred: boolean }] })
stage_invoice({ client, project?, description, amount, currency?, due_on?,
                already_sent?: boolean, sent_on? })   // Marcus's retainer = already_sent
log_expense({ vendor, amount, spent_on?, category, deductible, project?,
              description?, receipt_id? })
stage_draft({ client, channel, subject?, body, invoice_ref? })
query_finances({ kind: 'overdue' | 'unpaid_total' | 'expenses_by_category'
                 | 'project_pnl', from?, to?, project? })
list_open_items({ type?: 'tasks'|'invoices'|'drafts', project? })
set_project_status({ project, status })
```

**Guardrails enforced in code, not in the prompt:**

- Write tools can only produce `staged`, `suggested`, or `open` rows.
- Only UI button handlers move records to `sent`, `paid`, or `confirmed`; those handlers never pass through the model.
- No tool sends anything or touches an external system.
- Amounts are parsed from the user's text and validated by Zod. If an amount, client, or date is ambiguous, Carl asks one question instead of guessing.

**Persona prompt (sketch):**

```text
You are Carl, the admin assistant for a solo creative.
Reply in at most two sentences: calm, dry, specific. No exclamation marks, no filler.
Put all structured content into tools, never into chat.
After tool calls, name what you staged and nothing else.
Mark tasks you inferred (not stated) with inferred: true.
Ask at most one clarifying question, only when an amount, client, or date is genuinely ambiguous.
You never send, charge, or confirm anything; the user approves on the Workboard.
Today: {date}. Currency: {currency}. Timezone: {timezone}.
```

## Anti-scope for V1

If it isn't in the Overview scope, it isn't in V1. Explicitly cut:

- Sending email, Gmail or Outlook integration
- Stripe, payment links, or charging anything
- QuickBooks or Xero sync, bank feeds, Plaid
- PDF invoice generation (a staged payment-request draft is enough)
- Recurring invoices, multi-currency conversion
- Tax estimates or filing; Carl logs, he does not give tax advice
- Teams, shared workspaces, roles
- Calendar sync, notifications, cron jobs, daily digests
- Vector DB or RAG memory; recent messages plus DB queries are the memory
- Native mobile apps (responsive web only), voice input
- Local LLM in production

**One exception kept:** CSV export of expenses by project and category. It is about 30 lines of code and delivers the "tax season isn't a nightmare" promise.

## Roadmap

Ten milestones, one per coding session; each ends with something you can click or test.

| # | Milestone | Build | Done when |
| --- | --- | --- | --- |
| M0 | Skeleton | Next.js, local Supabase, magic-link auth, Vercel deploy | You can log in on the live URL |
| M1 | Schema + RLS | Migrations from this spec, seed data | SQL test proves user B can't read user A's rows |
| M2 | Chat shell | 60/40 layout, streaming chat with persona, no tools, message persistence | Reload keeps history |
| M3 | Read-only Workboard | Tasks, Drafts, Financials tabs from seed data, overdue badges via `invoice_board` | Board renders correctly with fake data |
| M4 | First tool + evals | `create_tasks` end-to-end with suggested/open split; `evals/` with \~10 golden brain dumps asserting tool calls | `npm run eval` passes |
| M5 | Clients + drafts | Name resolution, `stage_draft`, copy and dismiss buttons | A drafted reminder copies in one tap |
| M6 | Invoices | `stage_invoice` incl. `already_sent`, mark-sent and mark-paid buttons | Marcus example shows a sent invoice 4 days overdue |
| M7 | Expenses | Receipt upload to Storage, vision call pre-fills `log_expense`, confirm/dismiss, CSV export | A receipt photo becomes a confirmed expense and shows in the CSV |
| M8 | Full brain dump | Grow evals to \~25 cases incl. ambiguous amounts and unknown clients | Lookbook example produces every card correctly in one message |
| M9 | Polish | Undo on approvals, empty states, tool-failure messages in Carl's voice, keyboard shortcuts | You'd use it for a real week of work |

## Instructions for the coding agent

Save this spec as `SPEC.md` in the repo root and point the agent at it; build one milestone per session.

- Read `SPEC.md` before every task. It overrides your defaults.
- Work on one milestone at a time. Stop at its "Done when" check and report back.
- Do not add anything listed in Anti-scope, even if it seems helpful.
- Money is always integer cents. Never store floats for amounts.
- Every tool input and API payload goes through a Zod schema.
- Staged records change status only via UI handlers, never via a model tool.
- Every new table gets RLS in the same migration.
- Keep the eval suite passing from M4 onward; add a case for every bug fixed.

Kickoff prompt for the first session:

```text
Read SPEC.md. Implement milestone M0 only. Use the stack in the Stack section.
When done, tell me the exact commands to run and how to verify the Done-when check.
```
