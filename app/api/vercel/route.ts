import { type NextRequest, NextResponse } from "next/server";

const VERCEL_API = "https://api.vercel.com";

function getToken(req: NextRequest): string | null {
  return req.headers.get("x-vercel-token") || process.env.DEXTER_VERCEL_TOKEN || null;
}

export async function GET(req: NextRequest) {
  const token = getToken(req);
  if (!token)
    return NextResponse.json({ error: "No Vercel token" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") || "list";

  try {
    if (action === "list") {
      const res = await fetch(`${VERCEL_API}/v9/projects?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok)
        return NextResponse.json(
          { error: data.error?.message || "Vercel error" },
          { status: res.status },
        );
      return NextResponse.json(data.projects || []);
    }

    if (action === "deployments") {
      const projectId = searchParams.get("projectId")!;
      const res = await fetch(
        `${VERCEL_API}/v6/deployments?projectId=${projectId}&limit=5`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (!res.ok)
        return NextResponse.json(
          { error: data.error?.message },
          { status: res.status },
        );
      return NextResponse.json(data.deployments || []);
    }

    if (action === "ping") {
      const res = await fetch(`${VERCEL_API}/v2/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok)
        return NextResponse.json(
          { error: data.error?.message },
          { status: res.status },
        );
      return NextResponse.json({
        username: data.user?.username,
        name: data.user?.name,
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
    return NextResponse.json({ error: "No Vercel token" }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  try {
    if (action === "create") {
      // Create a Vercel project linked to a GitHub repo
      const res = await fetch(`${VERCEL_API}/v10/projects`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: body.name,
          gitRepository: {
            type: "github",
            repo: body.repoFullName,
          },
          framework: body.framework || null,
        }),
      });
      const data = await res.json();
      if (!res.ok)
        return NextResponse.json(
          { error: data.error?.message },
          { status: res.status },
        );

      // Auto-trigger initial deployment
      if (data.id) {
        const deployRes = await fetch(`${VERCEL_API}/v13/deployments`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: data.name,
            project: data.id,
            target: "production",
          }),
        });
        const deployData = await deployRes.json();
        if (deployRes.ok) {
          data.deployment = deployData;
        }
      }

      return NextResponse.json(data);
    }

    if (action === "redeploy") {
      // Trigger latest deployment redeploy
      const res = await fetch(`${VERCEL_API}/v13/deployments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: body.projectName,
          project: body.projectId,
          target: "production",
        }),
      });
      const data = await res.json();
      if (!res.ok)
        return NextResponse.json(
          { error: data.error?.message },
          { status: res.status },
        );
      return NextResponse.json(data);
    }

    if (action === "delete") {
      const res = await fetch(`${VERCEL_API}/v9/projects/${body.projectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        return NextResponse.json(
          { error: data.error?.message },
          { status: res.status },
        );
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
