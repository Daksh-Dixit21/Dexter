export interface NetlifySite {
  id: string;
  name: string;
  url: string;
  ssl_url: string;
  build_settings: {
    cmd: string;
    dir: string;
    env: Record<string, string>;
  };
  deploy_settings: {
    provider: string;
    branch: string;
  };
}

export interface NetlifyDeploy {
  id: string;
  state: string;
  name: string;
  url: string;
  ssl_url: string;
  created_at: string;
  updated_at: string;
  deploy_url: string;
}
