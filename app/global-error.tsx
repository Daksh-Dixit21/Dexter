"use client";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            background: "#09090b",
            color: "#f4f4f5",
            fontFamily:
              'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            padding: 24,
          }}
        >
          <section style={{ maxWidth: 420, textAlign: "center" }}>
            <p
              style={{
                margin: "0 0 8px",
                color: "#818cf8",
                fontSize: 13,
                letterSpacing: 1.2,
                textTransform: "uppercase",
              }}
            >
              Dexter recovered a crash
            </p>
            <h1 style={{ margin: "0 0 12px", fontSize: 28 }}>
              Something went sideways.
            </h1>
            <p style={{ margin: "0 0 20px", color: "#a1a1aa" }}>
              {error.digest
                ? `Error digest: ${error.digest}`
                : "Retry the page and Dexter will try to render it again."}
            </p>
            <button
              type="button"
              onClick={() => unstable_retry()}
              style={{
                border: "1px solid #6366f1",
                borderRadius: 10,
                background: "#6366f1",
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
                padding: "10px 16px",
              }}
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
