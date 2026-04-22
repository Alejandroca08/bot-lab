# BotLab

Multi-tenant platform for testing WhatsApp bots. Clients get invited, test their bot through a simulated chat, annotate issues, and submit feedback -- all from the browser.

## How it works

1. **Admin** creates a project (webhook URL, phone numbers, webhook format) and invites a client via email + password
2. **Client** logs in and lands on a simplified view with their assigned project pre-loaded
3. Client sends messages through the **Simulator** -- messages hit the bot's n8n webhook, and the bot's response appears automatically in the chat
4. Client switches to the **Test Lab** to review the conversation, annotate specific messages (category, severity, notes, suggestions), and export feedback
5. **Admin** monitors all client annotations in real-time from the **Feedback Dashboard**

## Stack

- **Frontend:** React 19 + Vite + Tailwind CSS 4
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Hosting:** Cloudflare Pages (with Pages Functions for webhook proxy)
- **Webhook formats:** YCloud, Evolution API, custom

## Setup

### Prerequisites

- Node.js 18+
- A Supabase project (cloud or self-hosted)

### Install

```bash
npm install
```

### Environment

Create a `.env.local` file:

```
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Database

Run the migration in `supabase/migrations/001_initial.sql` against your Supabase project. This creates:

- `profiles` -- extends auth.users with role (admin/client) and project assignment
- `projects` -- bot configurations (webhook URL, format, phone numbers)
- `conversations` -- simulated chat sessions
- `messages` -- individual messages within conversations
- `annotations` -- client feedback on specific messages

RLS policies enforce multi-tenant isolation automatically.

### Create admin user

1. Sign up through the app or Supabase dashboard
2. Set your role to admin:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE id = '<your-user-id>';
   ```

### Run

```bash
npm run dev
```

## Project structure

```
src/
  components/
    admin/          # ClientManager, FeedbackDashboard
    layout/         # MainLayout, ClientLayout, Sidebar, ViewSwitcher
    settings/       # ProjectSettings
    simulator/      # ChatWindow, MessageBubble, MessageInput, AgentPanel, ...
    testlab/        # TestLabView, AnnotationForm, AnnotatedMessage, ...
    ui/             # Reusable UI primitives
  contexts/         # AuthContext, ProjectContext, ConversationContext
  hooks/            # useWebhook, useVoiceRecorder
  lib/              # Supabase client + REST query helper
  pages/            # LoginPage
  utils/            # Payload builders, ID generators, export formatters
functions/
  api/              # Cloudflare Pages Functions (webhook proxy)
supabase/
  migrations/       # Database schema + RLS policies
```

## Deployment

Build and deploy to Cloudflare Pages:

```bash
npm run build
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in the Cloudflare Pages dashboard. The `functions/` directory auto-deploys as Pages Functions.
