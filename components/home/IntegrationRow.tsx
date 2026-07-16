"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Rocket } from "lucide-react";
import { GitHubIcon } from "@/components/ui/github-icon";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Integration {
  id: string;
  name: string;
  connected: boolean;
}

const defaultIntegrations: Integration[] = [
  { id: "github", name: "GitHub", connected: false },
  { id: "vercel", name: "Vercel", connected: false },
  { id: "netlify", name: "Netlify", connected: false },
];

const iconMap: Record<string, React.ReactNode> = {
  github: <GitHubIcon className="h-4 w-4" />,
  vercel: <Rocket className="h-4 w-4" />,
  netlify: <Globe className="h-4 w-4" />,
};

export function IntegrationRow() {
  const [integrations] = useLocalStorage<Integration[]>("dexter.integrations", defaultIntegrations);

  return (
    <div className="flex gap-3 flex-wrap">
      {integrations.map((integration) => (
        <Card
          key={integration.id}
          className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:border-accent/50 transition-colors"
        >
          {iconMap[integration.id]}
          <span className="text-sm font-medium text-text">{integration.name}</span>
          <Badge variant={integration.connected ? "success" : "secondary"} className="text-[10px]">
            {integration.connected ? "Connected" : "Connect"}
          </Badge>
        </Card>
      ))}
    </div>
  );
}
