export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent-glow animate-breathe" />
        <p className="text-sm text-text-muted">Loading...</p>
      </div>
    </div>
  );
}
