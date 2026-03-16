"use client";

import { Cpu } from "lucide-react";
import type { TechStackItem } from "@/lib/api";

interface TechStackProps {
  items: TechStackItem[];
}

const CATEGORY_COLORS: Record<string, string> = {
  CRM: "bg-blue-500/20 text-blue-200 border border-blue-500/30",
  "Marketing Automation": "bg-purple-500/20 text-purple-200 border border-purple-500/30",
  Analytics: "bg-primary/20 text-primary-light border border-primary/30",
  "Website Platform": "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30",
  Cloud: "bg-sky-500/20 text-sky-200 border border-sky-500/30",
  Support: "bg-rose-500/20 text-rose-200 border border-rose-500/30",
  Communication: "bg-indigo-500/20 text-indigo-200 border border-indigo-500/30",
  Payment: "bg-green-500/20 text-green-200 border border-green-500/30",
};

export default function TechStack({ items }: TechStackProps) {
  if (!items || items.length === 0) return null;

  const grouped = items.reduce<Record<string, TechStackItem[]>>((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="glass-panel rounded-xl p-6 animate-slide-up">
      <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
        <Cpu className="w-4 h-4" />
        Technology Stack
      </h3>
      <div className="space-y-3">
        {Object.entries(grouped).map(([category, techs]) => (
          <div key={category}>
            <span className="text-xs text-muted font-medium">{category}</span>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {techs.map((tech, i) => (
                <span
                  key={i}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_COLORS[category] || "bg-secondary text-secondary-foreground"}`}
                >
                  {tech.technology}
                  {tech.confidence > 0 && tech.confidence < 1 && (
                    <span className="ml-1 opacity-60">
                      {Math.round(tech.confidence * 100)}%
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
