"use client";

import { UserCheck } from "lucide-react";
import type { LeadershipEntry } from "@/lib/api";

interface LeadershipListProps {
  leaders: LeadershipEntry[];
}

export default function LeadershipList({ leaders }: LeadershipListProps) {
  if (!leaders || leaders.length === 0) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-6 animate-slide-up">
      <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
        <UserCheck className="w-4 h-4" />
        Key Decision Makers
      </h3>
      <div className="space-y-3">
        {leaders.map((leader, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
              {leader.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{leader.name}</div>
              <div className="text-xs text-muted truncate">{leader.title}</div>
            </div>
            {leader.confidence > 0 && (
              <span className="text-xs text-muted">
                {Math.round(leader.confidence * 100)}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
