"use client";

import { Cpu } from "lucide-react";
import type { TechStackItem } from "@/lib/api";

interface TechStackProps {
  items: TechStackItem[];
}

const CATEGORY_COLORS: Record<string, string> = {
  CRM: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "Marketing Automation": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  Analytics: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "Website Platform": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  Cloud: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  Support: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  Communication: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  Payment: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
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
    <div className="bg-card rounded-xl border border-border p-6 animate-slide-up">
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
