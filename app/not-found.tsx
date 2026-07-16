import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6">
        <div className="text-6xl">404</div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
          <p className="text-muted-foreground">This page seems to have wandered off.</p>
        </div>
        <Link
          href="/"
          className="inline-flex h-9 items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 text-sm font-medium hover:bg-primary/90"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
