import { Octokit } from "octokit";

let octokit: Octokit | null = null;

export function getOctokit(token: string) {
  if (!octokit || token !== (octokit as any).auth?.token) {
    octokit = new Octokit({ auth: token });
  }
  return octokit;
}

export async function getRepos(token: string, page = 1, perPage = 30) {
  const octokit = getOctokit(token);
  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    direction: "desc",
    page,
    per_page: perPage,
  });
  return data;
}

export async function createRepo(
  token: string,
  name: string,
  description: string,
  isPrivate: boolean,
) {
  const octokit = getOctokit(token);
  const { data } = await octokit.rest.repos.createForAuthenticatedUser({
    name,
    description,
    private: isPrivate,
  });
  return data;
}

export async function deleteRepo(token: string, owner: string, repo: string) {
  const octokit = getOctokit(token);
  await octokit.rest.repos.delete({ owner, repo });
}

export async function getWorkflows(token: string, owner: string, repo: string) {
  const octokit = getOctokit(token);
  const { data } = await octokit.rest.actions.listRepoWorkflows({
    owner,
    repo,
  });
  return data.workflows;
}

export async function getWorkflowRuns(
  token: string,
  owner: string,
  repo: string,
  workflowId: number,
) {
  const octokit = getOctokit(token);
  const { data } = await octokit.rest.actions.listWorkflowRuns({
    owner,
    repo,
    workflow_id: workflowId,
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
  const octokit = getOctokit(token);
  await octokit.rest.actions.createWorkflowDispatch({
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
  const octokit = getOctokit(token);
  await octokit.rest.actions.reRunWorkflow({
    owner,
    repo,
    run_id: runId,
  });
}

export async function searchRepos(token: string, query: string) {
  const octokit = getOctokit(token);
  const { data } = await octokit.rest.search.repos({
    q: query,
    per_page: 10,
  });
  return data.items;
}
