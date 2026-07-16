import Link from "next/link";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card } from "@/components/ui/card";

const setupSteps = [
  {
    title: "1. Create scoped platform tokens",
    body: "Create personal access tokens for GitHub, Vercel, and Netlify. Use the narrowest scopes that still let Dexter list repositories, trigger workflows, create projects, and redeploy sites.",
  },
  {
    title: "2. Add tokens in Settings",
    body: "Open Settings, paste each token into Integrations, and use the Test button. Dexter stores these tokens in your browser localStorage for personal use.",
  },
  {
    title: "3. Connect repositories to deploy targets",
    body: "Use Repos to inspect GitHub repositories, then connect a repo to Deploy. Use Deploy to create Vercel projects, create Netlify sites, and trigger redeploys.",
  },
  {
    title: "4. Optional Telegram reminders",
    body: "Create a bot with BotFather, message the bot, call getUpdates, copy your chat id, and paste both values into Settings. For background reminders, export your reminders JSON from Dexter and save it as the GitHub Actions secret `DEXTER_TELEGRAM_REMINDERS`. The included workflow checks that secret and sends Telegram messages even when Dexter is closed.",
  },
  {
    title: "5. Deploy Dexter itself",
    body: "Deploy it like a normal Next.js app. Add server-side environment variables only if you want API routes to have fallback tokens when a browser token is not provided.",
  },
];

const envVars = [
  "GITHUB_TOKEN",
  "VERCEL_TOKEN",
  "NETLIFY_TOKEN",
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_CHAT_ID",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "AUTH_SECRET",
];

export default function SetupGuidePage() {
  return (
    <PageLayout>
      <article className="mx-auto max-w-3xl space-y-6 pb-24">
        <div className="space-y-3">
          <Link href="/" className="text-sm text-accent hover:text-accent/80">
            Back to dashboard
          </Link>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-text-dim">
              Setup Guide
            </p>
            <h1 className="mt-2 text-3xl font-bold text-text">
              Set up Dexter as your deployment command center
            </h1>
            <p className="mt-3 text-sm leading-6 text-text-muted">
              Dexter is designed as a personal dashboard for GitHub repositories,
              Vercel projects, Netlify sites, reminders, focus sessions, and a
              companion that reacts to your workspace state.
            </p>
          </div>
        </div>

        <Card className="p-5">
          <h2 className="text-lg font-semibold text-text">What Dexter Can Do</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              "List, search, create, delete, star, and unstar GitHub repositories.",
              "Trigger GitHub Actions workflows from connected repositories.",
              "List Vercel projects and create repo-linked Vercel projects.",
              "List Netlify sites and create repo-linked Netlify sites.",
              "Trigger redeploys and open production URLs.",
              "Track todos, reading links, reminders, subscriptions, vision goals, and milestones.",
              "Use a command palette for fast navigation and creation flows.",
              "Show Dexter companion moods, nudges, task status, and local bot logs.",
            ].map((item) => (
              <p key={item} className="rounded-lg border border-border bg-surface-elevated/50 p-3 text-sm text-text-muted">
                {item}
              </p>
            ))}
          </div>
        </Card>

        <div className="space-y-3">
          {setupSteps.map((step) => (
            <Card key={step.title} className="p-5">
              <h2 className="text-base font-semibold text-text">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-text-muted">{step.body}</p>
            </Card>
          ))}
        </div>

        <Card className="p-5">
          <h2 className="text-lg font-semibold text-text">Environment Variables</h2>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            Browser-entered tokens are enough for personal use. Add these values
            to your hosting provider only when you want route handlers to use
            server fallbacks or when you enable GitHub OAuth later.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {envVars.map((name) => (
              <code key={name} className="rounded-md border border-border bg-background px-3 py-2 text-xs text-text-muted">
                {name}
              </code>
            ))}
          </div>
        </Card>

        <Card className="border-amber-500/20 bg-amber-500/5 p-5">
          <h2 className="text-lg font-semibold text-text">Deployment Readiness</h2>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            The app is TypeScript-clean. Before production, verify the external
            provider permissions with real tokens, then run a production build in
            your own shell or CI. Auth is present but not enforced yet, so deploy
            this as a private/personal tool or add route protection before sharing it.
          </p>
        </Card>
      </article>
    </PageLayout>
  );
}
