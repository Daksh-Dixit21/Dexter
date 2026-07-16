export interface VercelProject {
  id: string;
  name: string;
  framework: string | null;
  latestDeployments: VercelDeployment[];
  link: {
    type: string;
    org: string;
    repo: string;
    repoId: number;
  } | null;
}

export interface VercelDeployment {
  id: string;
  url: string;
  name: string;
  state: string;
  created: string;
  ready: string | null;
  target: string | null;
}
