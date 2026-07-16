"use client";

import { Globe, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { GitHubIcon } from "@/components/ui/github-icon";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Integration {
  id: string;
  name: string;
  tokenKey: string;
}

const defaultIntegrations: Integration[] = [
  { id: "github", name: "GitHub", tokenKey: "dexter.githubToken" },
  { id: "vercel", name: "Vercel", tokenKey: "dexter.vercelToken" },
  { id: "netlify", name: "Netlify", tokenKey: "dexter.netlifyToken" },
];

const iconMap: Record<string, React.ReactNode> = {
  github: <GitHubIcon className="h-4 w-4" />,
  vercel: <Rocket className="h-4 w-4" />,
  netlify: <Globe className="h-4 w-4" />,
};

export function IntegrationRow() {
  const router = useRouter();
  const [githubToken] = useLocalStorage("dexter.githubToken", "");
  const [vercelToken] = useLocalStorage("dexter.vercelToken", "");
  const [netlifyToken] = useLocalStorage("dexter.netlifyToken", "");
  const connectedById: Record<string, boolean> = {
    github: Boolean(githubToken),
    vercel: Boolean(vercelToken),
    netlify: Boolean(netlifyToken),
  };

  return (
    <div className="flex gap-3 flex-wrap">
      {defaultIntegrations.map((integration) => (
        <Card
          key={integration.id}
          role="button"
          tabIndex={0}
          onClick={() => router.push("/settings?section=integrations")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              router.push("/settings?section=integrations");
            }
          }}
          className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:border-accent/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {iconMap[integration.id]}
          <span className="text-sm font-medium text-text">
            {integration.name}
          </span>
          <Badge
            variant={connectedById[integration.id] ? "success" : "secondary"}
            className="text-[10px]"
          >
            {connectedById[integration.id] ? "Connected" : "Connect"}
          </Badge>
        </Card>
      ))}
    </div>
  );
}
