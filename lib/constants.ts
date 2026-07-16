import { GitBranch, Globe, Server, Eye, Copy, FileText, Terminal, RefreshCw, Rocket, FolderOpen } from "lucide-react";
import { GitHubIcon } from "@/components/ui/github-icon";

export const QUOTES = [
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Code is like humor. When you have to explain it, it's bad.",
  "First, solve the problem. Then, write the code.",
  "The only way to do great work is to love what you do.",
  "Simplicity is the soul of efficiency.",
  "Make it work, make it right, make it fast.",
  "Talk is cheap. Show me the code. — Linus Torvalds",
  "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
  "Programs must be written for people to read, and only incidentally for machines to execute.",
  "The best error message is the one that never shows up.",
  "Debugging is twice as hard as writing the code in the first place.",
  "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.",
  "It's not a bug — it's an undocumented feature.",
  "Deleted code is debugged code.",
  "Weeks of coding can save you hours of planning.",
];

export const QUOTE_AUTHORS = [
  "Chinese Proverb",
  "",
  "John Johnson",
  "Steve Jobs",
  "Tim Hill",
  "",
  "",
  "Martin Fowler",
  "Harold Abelson",
  "Thomas Fuchs",
  "Brian Kernighan",
  "Antoine de Saint-Exupéry",
  "",
  "",
  "",
];

export const QUICK_ACTIONS = [
  { id: "public-repo", label: "Public Repository", icon: GitHubIcon, description: "Create a public repo" },
  { id: "private-repo", label: "Private Repository", icon: GitHubIcon, description: "Create a private repo" },
  { id: "deploy", label: "Deploy", icon: Rocket, description: "Deploy to production" },
  { id: "redeploy", label: "Redeploy", icon: RefreshCw, description: "Redeploy latest build" },
  { id: "production-url", label: "Production URL", icon: Globe, description: "Open production URL" },
  { id: "preview-url", label: "Preview URL", icon: Eye, description: "Open preview URL" },
  { id: "clone-url", label: "Clone URL", icon: Copy, description: "Copy clone URL" },
  { id: "logs", label: "Logs", icon: FileText, description: "View deployment logs" },
  { id: "open-repo", label: "Open Repository", icon: FolderOpen, description: "Open in GitHub" },
  { id: "actions", label: "GitHub Actions", icon: GitBranch, description: "View workflows" },
  { id: "terminal", label: "Open Terminal", icon: Terminal, description: "Open in terminal" },
  { id: "server", label: "Server Status", icon: Server, description: "Check server status" },
];

export const INTEGRATIONS = [
  { id: "github", name: "GitHub", icon: "GitHub" },
  { id: "vercel", name: "Vercel", icon: "Vercel" },
  { id: "netlify", name: "Netlify", icon: "Netlify" },
];

export const MOOD_COLORS = {
  idle: { primary: "#6366f1", secondary: "#818cf8" },
  happy: { primary: "#3b82f6", secondary: "#60a5fa" },
  affection: { primary: "#ec4899", secondary: "#f472b6" },
  success: { primary: "#10b981", secondary: "#34d399" },
  thinking: { primary: "#f59e0b", secondary: "#fbbf24" },
  confused: { primary: "#f97316", secondary: "#fb923c" },
  concerned: { primary: "#6b7280", secondary: "#9ca3af" },
  sleeping: { primary: "#3b82f6", secondary: "#60a5fa" },
} as const;

export type Mood = keyof typeof MOOD_COLORS;
