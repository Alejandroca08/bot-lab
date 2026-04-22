# BotLab

Multi-tenant WhatsApp bot testing platform. Admin (Alejandro) creates projects and invites clients. Clients test their bot via a simulated chat, annotate issues, and submit feedback.

## Architecture

- **Frontend:** React 19 + Vite 8 + Tailwind CSS 4 (`.jsx`, no TypeScript)
- **Backend:** Supabase (self-hosted at `sssupabase.rasorbit.com`) — PostgreSQL + Auth + RLS
- **Hosting:** Cloudflare Pages + Pages Functions (webhook proxy)
- **State:** All data in Supabase. No localStorage for persistent data (legacy `STORAGE_KEYS` in constants exist but are unused).

## Critical: Supabase client usage

The Supabase JS client (`@supabase/supabase-js`) is **only used for auth** (`signIn`, `signOut`, `onAuthStateChange`, Realtime channels). All database operations (SELECT, INSERT, UPDATE, DELETE) go through `restQuery()` in `src/lib/supabase.js`, which calls the PostgREST API directly via `fetch()`.

**Why:** The supabase-js client internally calls `getSession()` before every DB request to attach the auth token. On the self-hosted instance, this hangs due to browser Web Locks API contention. `restQuery()` bypasses this by using the token already in React context memory.

**Rule:** Never use `supabase.from('table')` for DB operations. Always use `restQuery()` with the auth token from `auth?.session?.access_token`.

Similarly, `authSignUpDirect()` in the same file calls GoTrue's `/auth/v1/signup` endpoint directly so that creating a client account doesn't replace the admin's browser session.

## Routing and roles

- `/login` — email + password login
- `/admin/*` — admin layout (Sidebar + ViewSwitcher): Settings, Simulator, Test Lab, Clients, Dashboard
- `/client/*` — client layout (simplified): Simulator + Test Lab tabs only, project is read-only
- Role is stored in `profiles.role` (`admin` or `client`). Client gets `project_id` assigned by admin.
- `RequireAuth` wrapper in `App.jsx` handles redirects based on role.

## Views (admin sidebar / client tabs)

Defined in `src/utils/constants.js` as `VIEWS`:
- `SETTINGS` — Project CRUD (admin) or read-only project info (client)
- `SIMULATOR` — WhatsApp-style chat simulator. Sends messages to n8n webhook, displays bot response from `result.data.output`
- `TESTLAB` — Review conversations, annotate messages with category/severity/notes, export feedback
- `CLIENTS` — Admin only. Create client accounts, assign projects
- `DASHBOARD` — Admin only. Real-time feed of all client annotations across projects

## Webhook flow

1. User types message in Simulator → `ChatWindow.jsx` builds a YCloud-format payload via `payloadBuilders.js`
2. `useWebhook.js` sends the payload:
   - **Dev mode** (`import.meta.env.DEV`): calls the n8n webhook URL directly (no proxy)
   - **Production**: routes through `functions/api/webhook-proxy.js` (Cloudflare Pages Function) to avoid CORS
3. n8n workflow processes the message and responds with `{ output: "bot reply text" }`
4. `ChatWindow.jsx` reads `result.data.output` and auto-adds it as a bot message

## Payload format

Payloads in `src/utils/payloadBuilders.js` follow YCloud's webhook event structure:
- Inbound: `type: "whatsapp.inbound_message.received"`, body in `whatsappInboundMessage.text.body`
- Outbound: `type: "whatsapp.smb.message"`, body in `whatsappMessage.text.body`

## Database tables

- `profiles` — extends `auth.users` with `role` and `project_id`
- `projects` — webhook URL, format (`ycloud`/`evolution`/`custom`), phone numbers
- `conversations` — simulated chat sessions, linked to project + user
- `messages` — individual messages (sender: `customer`/`bot`/`agent`)
- `annotations` — feedback on specific messages (category, severity, note, suggestion)

RLS is enabled on all tables. Admin sees everything; clients see only their own data.

## File structure conventions

```
src/
  components/
    admin/       — ClientManager, FeedbackDashboard (admin-only views)
    layout/      — MainLayout (admin), ClientLayout (client), Sidebar, ViewSwitcher
    settings/    — ProjectSettings (role-aware: CRUD for admin, read-only for client)
    simulator/   — ChatWindow, MessageBubble, MessageInput, AgentPanel, etc.
    testlab/     — TestLabView, AnnotationForm, AnnotatedMessage, ExportOptions
    ui/          — Reusable primitives (Button, Input, Modal, Select, Badge)
  contexts/      — AuthContext, ProjectContext, ConversationContext
  hooks/         — useWebhook, useVoiceRecorder
  lib/           — supabase.js (client + restQuery + authSignUpDirect)
  pages/         — LoginPage
  utils/         — payloadBuilders, idGenerators, exportFormatters, constants
functions/api/   — Cloudflare Pages Functions (webhook-proxy.js)
supabase/migrations/ — SQL schema + RLS policies
```

## Known issues

- **Supabase Realtime** (WebSocket) does not work on the self-hosted instance — the Realtime service is not exposed on the expected port. The FeedbackDashboard subscribes but won't receive live updates until this is fixed server-side. The app functions without it.
- **`StrictMode` is removed** from `main.jsx` — it caused double-mount that orphaned browser locks with the Supabase auth client. Do not re-add it.
