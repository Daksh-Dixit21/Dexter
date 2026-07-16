import { type NextRequest, NextResponse } from "next/server";
import {
  createRepo,
  deleteRepo,
  getRepos,
  getWorkflowRuns,
  getWorkflows,
  searchRepos,
  starRepo,
  triggerWorkflow,
  unstarRepo,
} from "@/lib/github/client";

function getToken(req: NextRequest): string | null {
  return req.headers.get("x-github-token") || process.env.GITHUB_TOKEN || null;
}

export async function GET(req: NextRequest) {
  const token = getToken(req);
  if (!token)
    return NextResponse.json({ error: "No GitHub token" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") || "list";

  try {
    if (action === "list") {
      const page = Number(searchParams.get("page") || 1);
      const data = await getRepos(token, page, 50);
      return NextResponse.json(data);
    }

    if (action === "search") {
      const q = searchParams.get("q") || "";
      const data = await searchRepos(token, q);
      return NextResponse.json(data);
    }

    if (action === "workflows") {
      const owner = searchParams.get("owner")!;
      const repo = searchParams.get("repo")!;
      const data = await getWorkflows(token, owner, repo);
      return NextResponse.json(data);
    }

    if (action === "runs") {
      const owner = searchParams.get("owner")!;
      const repo = searchParams.get("repo")!;
      const workflowId = Number(searchParams.get("workflowId"));
      const data = await getWorkflowRuns(token, owner, repo, workflowId);
      return NextResponse.json(data);
    }

    if (action === "ping") {
      const { Octokit } = await import("octokit");
      const oct = new Octokit({ auth: token });
      const { data } = await oct.rest.users.getAuthenticated();
      return NextResponse.json({
        login: data.login,
        avatar_url: data.avatar_url,
        name: data.name,
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
    return NextResponse.json({ error: "No GitHub token" }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  try {
    if (action === "create") {
      const data = await createRepo(
        token,
        body.name,
        body.description || "",
        body.private ?? false,
      );
      return NextResponse.json(data);
    }

    if (action === "delete") {
      await deleteRepo(token, body.owner, body.repo);
      return NextResponse.json({ success: true });
    }

    if (action === "trigger-workflow") {
      await triggerWorkflow(
        token,
        body.owner,
        body.repo,
        body.workflowId,
        body.ref || "main",
      );
      return NextResponse.json({ success: true });
    }

    if (action === "star") {
      await starRepo(token, body.owner, body.repo);
      return NextResponse.json({ success: true });
    }

    if (action === "unstar") {
      await unstarRepo(token, body.owner, body.repo);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
