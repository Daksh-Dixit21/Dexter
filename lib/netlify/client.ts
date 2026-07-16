const NETLIFY_API = "https://api.netlify.com/api/v1";

export async function getNetlifySites(token: string) {
  const res = await fetch(`${NETLIFY_API}/sites`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch Netlify sites");
  return res.json();
}

export async function getNetlifyDeploys(token: string, siteId: string) {
  const res = await fetch(`${NETLIFY_API}/sites/${siteId}/deploys`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch deploys");
  return res.json();
}

export async function triggerNetlifyDeploy(token: string, siteId: string) {
  const res = await fetch(`${NETLIFY_API}/sites/${siteId}/deploys`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to trigger deploy");
  return res.json();
}

export async function getNetlifySite(token: string, siteId: string) {
  const res = await fetch(`${NETLIFY_API}/sites/${siteId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch site");
  return res.json();
}
