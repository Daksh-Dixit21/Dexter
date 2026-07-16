const VERCEL_API = "https://api.vercel.com";

export async function getVercelProjects(token: string) {
  const res = await fetch(`${VERCEL_API}/v9/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch Vercel projects");
  const data = await res.json();
  return data.projects;
}

export async function getVercelDeployments(token: string, projectId: string) {
  const res = await fetch(`${VERCEL_API}/v6/deployments?projectId=${projectId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch deployments");
  const data = await res.json();
  return data.deployments;
}

export async function triggerRedeploy(token: string, projectId: string, name: string) {
  const res = await fetch(`${VERCEL_API}/v13/deployments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      project: projectId,
    }),
  });
  if (!res.ok) throw new Error("Failed to trigger redeploy");
  return res.json();
}

export async function getDeploymentLogs(token: string, deploymentId: string) {
  const res = await fetch(`${VERCEL_API}/v2/deployments/${deploymentId}/logs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch logs");
  return res.json();
}

export async function getEnvVars(token: string, projectId: string) {
  const res = await fetch(`${VERCEL_API}/v9/projects/${projectId}/env`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch env vars");
  const data = await res.json();
  return data.envs;
}
