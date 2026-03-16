"use client";

import { cn } from "@/lib/utils";
import {
  Search, Building2, Cpu, Users, Target, UserCheck, FileText,
} from "lucide-react";

const AGENTS = [
  { key: "identification", label: "Identify", icon: Search },
  { key: "enrichment", label: "Enrich", icon: Building2 },
  { key: "tech_stack", label: "Tech Stack", icon: Cpu },
  { key: "leadership", label: "Leadership", icon: Users },
  { key: "intent", label: "Intent", icon: Target },
  { key: "persona", label: "Persona", icon: UserCheck },
  { key: "synthesis", label: "Synthesis", icon: FileText },
];

interface AgentPipelineProps {
  statuses: Record<string, string>;
}

export default function AgentPipeline({ statuses }: AgentPipelineProps) {
  return (
    <div className="glass-panel rounded-xl p-6">
      <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">
        Agent Pipeline
      </h3>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {AGENTS.map((agent, i) => {
          const status = statuses[agent.key] || "pending";
          const Icon = agent.icon;
          return (
            <div key={agent.key} className="flex items-center">
              <div
                className={cn(
                  "flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-300 min-w-[80px]",
                  status === "complete" && "bg-accent/10 border border-accent/20",
                  status === "running" && "bg-primary/10 border border-primary/20",
                  status === "pending" && "bg-black/20 border border-white/5"
                )}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300",
                    status === "complete" && "bg-accent text-white",
                    status === "running" && "bg-primary text-white animate-pulse-slow",
                    status === "pending" && "bg-border text-muted"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    status === "complete" && "text-accent",
                    status === "running" && "text-primary",
                    status === "pending" && "text-muted"
                  )}
                >
                  {agent.label}
                </span>
              </div>
              {i < AGENTS.length - 1 && (
                <div
                  className={cn(
                    "w-6 h-0.5 mx-1 transition-colors duration-300",
                    status === "complete" ? "bg-accent" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
