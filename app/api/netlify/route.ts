import { type NextRequest, NextResponse } from "next/server";

const NETLIFY_API = "https://api.netlify.com/api/v1";

function getToken(req: NextRequest): string | null {
  return (
    req.headers.get("x-netlify-token") || process.env.NETLIFY_TOKEN || null
  );
}

export async function GET(req: NextRequest) {
  const token = getToken(req);
  if (!token)
    return NextResponse.json({ error: "No Netlify token" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") || "list";

  try {
    if (action === "list") {
      const res = await fetch(`${NETLIFY_API}/sites?per_page=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok)
        return NextResponse.json(
          { error: "Netlify error" },
          { status: res.status },
        );
      return NextResponse.json(await res.json());
    }

    if (action === "deploys") {
      const siteId = searchParams.get("siteId")!;
      const res = await fetch(
        `${NETLIFY_API}/sites/${siteId}/deploys?per_page=5`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok)
        return NextResponse.json(
          { error: "Netlify error" },
          { status: res.status },
        );
      return NextResponse.json(await res.json());
    }

    if (action === "ping") {
      const res = await fetch(`${NETLIFY_API}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok)
        return NextResponse.json(
          { error: "Invalid token" },
          { status: res.status },
        );
      const data = await res.json();
      return NextResponse.json({
        email: data.email,
        full_name: data.full_name,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = getToken(req);
  if (!token)
    return NextResponse.json({ error: "No Netlify token" }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  try {
    if (action === "create") {
      // Create a new Netlify site linked to GitHub repo
      const res = await fetch(`${NETLIFY_API}/sites`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: body.name,
          repo: body.repoFullName
            ? {
                provider: "github",
                repo: body.repoFullName,
                branch: body.branch || "main",
                cmd: body.buildCommand || "",
                dir: body.publishDir || "out",
              }
            : undefined,
          custom_domain: body.customDomain || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok)
        return NextResponse.json(
          { error: data.message || "Netlify error" },
          { status: res.status },
        );

      // Auto-trigger initial deployment
      if (data.id && data.repo) {
        const deployRes = await fetch(`${NETLIFY_API}/sites/${data.id}/deploys`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ clear_cache: false }),
        });
        if (deployRes.ok) {
          data.deployment = await deployRes.json();
        }
      }

      return NextResponse.json(data);
    }

    if (action === "redeploy") {
      const res = await fetch(`${NETLIFY_API}/sites/${body.siteId}/deploys`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clear_cache: body.clearCache ?? false }),
      });
      const data = await res.json();
      if (!res.ok)
        return NextResponse.json(
          { error: data.message },
          { status: res.status },
        );
      return NextResponse.json(data);
    }

    if (action === "delete") {
      const res = await fetch(`${NETLIFY_API}/sites/${body.siteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status !== 204 && !res.ok)
        return NextResponse.json(
          { error: "Delete failed" },
          { status: res.status },
        );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
