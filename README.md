# Dexter Dev

Dexter is a personal developer dashboard for managing repositories, deployments, tasks, focus, reminders, and a small companion that reacts to your workspace.

The main idea is one dashboard where you can connect your GitHub account and deployment platforms, see what you are building, create or manage repositories, connect repos to deploy targets, trigger deploys, and keep a lightweight personal operating system around the work.

## Features

### Dashboard

- Personalized greeting and daily mission.
- Focus card for quick deep-work entry.
- Morning brief with current work signals.
- Journey progress and milestone timeline.
- Recent projects with local project tracking.
- Integration status row for GitHub, Vercel, and Netlify.
- Global command palette with navigation and creation shortcuts.

### GitHub Repositories

- List authenticated GitHub repositories.
- Search and filter repositories.
- Create repositories.
- Delete repositories.
- Star and unstar repositories.
- Pin repositories locally.
- Trigger GitHub Actions workflows.
- Connect a repository into the deployment flow.

### Deployments

- Connect Vercel and Netlify tokens.
- List Vercel projects.
- List Netlify sites.
- Create a Vercel project linked to a GitHub repository.
- Create a Netlify site linked to a GitHub repository.
- Trigger redeploys.
- Open live deployment URLs.
- Inspect deployment state badges.

### Tasks And Personal Systems

- Todo list with due dates, project links, recurring labels, filters, and completion state.
- Reading list with a small work-in-progress limit.
- Reminder list.
- Telegram reminders via send-now and GitHub Actions background schedules.
- Subscription tracker for upcoming renewals.
- Focus timer.
- Vision board for goals.
- Journey timeline for milestones.

### Dexter Companion

- Floating compact square mascot.
- Automatic moods based on workspace state.
- Speech bubbles and nudges.
- Mini task panel with pending task summary.
- Local bot activity logs.
- Clear bot logs from Settings.
- Mood preview in Settings with descriptions for what each mood means.

### Settings

- API token inputs for GitHub, Vercel, Netlify, and Telegram.
- Token test buttons.
- Telegram chat ID storage.
- Theme controls.
- Companion size controls.
- Mood preview and mood meaning guide.
- Browser notification opt-in.
- Local reset controls.

### Setup Guide

Dexter includes an in-app setup guide at:

```txt
/setup
```

It explains token setup, platform connection, Telegram setup, environment variables, and deployment caveats.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- lucide-react icons
- next-auth v5 beta route scaffolding
- GitHub, Vercel, Netlify, and Telegram route handlers

## Local Development

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

TypeScript parse check:

```bash
npx tsc --noEmit --pretty false
```

## Environment Variables

Copy `.env.example` to `.env.local` when you want server-side fallback tokens or OAuth configuration.

```bash
GITHUB_TOKEN=
VERCEL_TOKEN=
NETLIFY_TOKEN=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
AUTH_SECRET=
```

Most personal usage can work with browser-entered tokens from Settings. The API routes first read request headers from local Settings tokens, then fall back to server environment variables.

## Token Setup

### GitHub

Create a fine-grained or classic personal access token that can access the repositories you want Dexter to manage.

Useful permissions depend on your workflow:

- Repository read access for listing repos.
- Repository administration if you want to create or delete repos.
- Actions/workflow access if you want to trigger workflows.
- Star access if your token type requires it for starring and unstarring.

Paste it in Settings under GitHub and press Test.

### Vercel

Create a personal access token in Vercel account settings. Paste it in Settings under Vercel and press Test.

Dexter can list projects, create GitHub-linked projects, trigger deployments, and delete projects through the Vercel API route.

### Netlify

Create a personal access token in Netlify user settings. Paste it in Settings under Netlify and press Test.

Dexter can list sites, create repo-linked sites, trigger deploys, and delete sites through the Netlify API route.

### Telegram

1. Create a bot with BotFather.
2. Copy the bot token.
3. Message your bot from your Telegram account.
4. Visit `https://api.telegram.org/botYOUR_TOKEN/getUpdates`.
5. Copy your `chat.id`.
6. Paste the bot token and chat ID into Settings.

Telegram send-now works directly from the app. For reminders that should fire while Dexter is closed, export the reminders JSON from the Telegram Reminders panel and save it as the GitHub Actions secret `DEXTER_TELEGRAM_REMINDERS`. The included workflow checks that secret every 15 minutes.

## Data Storage

Dexter is currently personal-first and browser-local for app state:

- Tokens entered in Settings are stored in `localStorage`.
- Todos, reminders, reading links, projects, subscriptions, companion logs, and preferences are stored in `localStorage`.
- API route calls use browser-provided tokens through headers, or server environment fallback tokens.

This means the app works well as a personal dashboard, but data is not synced across browsers unless you add a database later.

## Deployment

Dexter can deploy as a standard Next.js app on Vercel or another Node-compatible platform.

Before deploying publicly:

1. Run `npx tsc --noEmit --pretty false`.
2. Run a production build in your shell or CI.
3. Add environment variables if you want server fallback tokens.
4. Decide whether this is a private personal tool or a shared app.
5. Add route protection before exposing it to other users.

## Is It Ready For Deployment?

It is TypeScript-clean and the core product flows are wired, but it should be treated as a personal/private dashboard until auth protection is finished.

Ready enough for a private deployment:

- Dashboard UI exists.
- Settings token flow exists.
- GitHub, Vercel, Netlify, and Telegram API routes exist.
- Repository and deployment management flows are implemented.
- Companion behavior and logs are implemented.
- `.env.example` documents required variables.

Not yet production-ready for a public multi-user SaaS:

- Auth is scaffolded but not enforced with route protection.
- User data is localStorage-based, not database-backed.
- Custom UI reminders must be exported to `DEXTER_TELEGRAM_REMINDERS` for background delivery; send-now works directly from the app.
- Provider permissions still need verification with your real tokens.
- A production build should be run in CI before shipping.

## Possible Database Upgrade

A database would make sense if you want Dexter to sync across devices or become a real hosted app. Good candidates:

- Supabase for auth plus Postgres.
- Neon or Vercel Postgres for lightweight SQL storage.
- Prisma or Drizzle for typed database access.

Suggested tables:

- users
- integrations
- projects
- todos
- reminders
- reading_links
- subscriptions
- bot_logs
- journey_milestones
- vision_goals

For now, the localStorage model keeps the app simple and private.

## Important Notes

- Keep tokens scoped and private.
- Do not deploy this publicly without auth enforcement.
- Clearing browser storage clears Dexter state.
- Use the in-app `/setup` page for a user-friendly setup guide.
