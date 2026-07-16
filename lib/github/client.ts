import { Octokit } from "octokit";

let octokit: Octokit | null = null;

export function getOctokit(token: string) {
  if (!octokit) {
    octokit = new Octokit({ auth: token });
  }
  return octokit;
}

export async function getRepos(token: string, page = 1, perPage = 50) {
  const kit = getOctokit(token);
  const { data } = await kit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    direction: "desc",
    page,
    per_page: perPage,
    affiliation: "owner,collaborator",
  });
  return data;
}

export async function getAuthenticatedUser(token: string) {
  const kit = getOctokit(token);
  const { data } = await kit.rest.users.getAuthenticated();
  return data;
}

export async function createRepo(
  token: string,
  name: string,
  description: string,
  isPrivate: boolean,
  autoInit = true,
) {
  const kit = getOctokit(token);
  const { data } = await kit.rest.repos.createForAuthenticatedUser({
    name,
    description,
    private: isPrivate,
    auto_init: autoInit,
  });
  return data;
}

export async function deleteRepo(token: string, owner: string, repo: string) {
  const kit = getOctokit(token);
  await kit.rest.repos.delete({ owner, repo });
}

export async function starRepo(token: string, owner: string, repo: string) {
  const kit = getOctokit(token);
  await kit.rest.activity.starRepoForAuthenticatedUser({ owner, repo });
}

export async function unstarRepo(token: string, owner: string, repo: string) {
  const kit = getOctokit(token);
  await kit.rest.activity.unstarRepoForAuthenticatedUser({ owner, repo });
}

export async function isRepoStarred(
  token: string,
  owner: string,
  repo: string,
) {
  try {
    const kit = getOctokit(token);
    await kit.rest.activity.checkRepoIsStarredByAuthenticatedUser({
      owner,
      repo,
    });
    return true;
  } catch {
    return false;
  }
}

export async function getWorkflows(token: string, owner: string, repo: string) {
  const kit = getOctokit(token);
  const { data } = await kit.rest.actions.listRepoWorkflows({ owner, repo });
  return data.workflows;
}

export async function getWorkflowRuns(
  token: string,
  owner: string,
  repo: string,
  workflowId: number,
) {
  const kit = getOctokit(token);
  const { data } = await kit.rest.actions.listWorkflowRuns({
    owner,
    repo,
    workflow_id: workflowId,
    per_page: 5,
  });
  return data.workflow_runs;
}

export async function triggerWorkflow(
  token: string,
  owner: string,
  repo: string,
  workflowId: number,
  ref: string,
) {
  const kit = getOctokit(token);
  await kit.rest.actions.createWorkflowDispatch({
    owner,
    repo,
    workflow_id: workflowId,
    ref,
  });
}

export async function rerunWorkflow(
  token: string,
  owner: string,
  repo: string,
  runId: number,
) {
  const kit = getOctokit(token);
  await kit.rest.actions.reRunWorkflow({ owner, repo, run_id: runId });
}

export async function searchRepos(token: string, query: string) {
  const kit = getOctokit(token);
  const { data } = await kit.rest.search.repos({
    q: `${query} user:@me`,
    per_page: 20,
  });
  return data.items;
}

/** Repos not pushed to in 90+ days are considered stale */
export function isStale(pushedAt: string | null): boolean {
  if (!pushedAt) return true;
  const diff = Date.now() - new Date(pushedAt).getTime();
  return diff > 90 * 24 * 60 * 60 * 1000;
}

/** Format size KB/MB */
export function formatRepoSize(kb: number): string {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}
