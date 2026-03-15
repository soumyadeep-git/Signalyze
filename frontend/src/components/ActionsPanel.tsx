"use client";

import { Zap, TrendingUp } from "lucide-react";
import type { BusinessSignal } from "@/lib/api";

interface ActionsPanelProps {
  actions: string[];
  signals: BusinessSignal[];
  persona?: { likely_persona: string; confidence: number; reasoning: string };
}

export default function ActionsPanel({ actions, signals, persona }: ActionsPanelProps) {
  return (
    <div className="space-y-4">
      {persona && persona.likely_persona && persona.likely_persona !== "Unknown" && (
        <div className="bg-card rounded-xl border border-border p-6 animate-slide-up">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
            Likely Persona
          </h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold">{persona.likely_persona}</div>
              <div className="text-xs text-muted">
                {Math.round(persona.confidence * 100)}% confidence
              </div>
            </div>
          </div>
          {persona.reasoning && (
            <p className="text-sm text-secondary-foreground mt-3">{persona.reasoning}</p>
          )}
        </div>
      )}

      {actions && actions.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6 animate-slide-up">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Recommended Actions
          </h3>
          <div className="space-y-2">
            {actions.map((action, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10"
              >
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  {i + 1}
                </span>
                <span className="text-sm">{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {signals && signals.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6 animate-slide-up">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Business Signals
          </h3>
          <div className="space-y-2">
            {signals.map((signal, i) => (
              <div key={i} className="p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent-warn/10 text-accent-warn">
                    {signal.signal_type}
                  </span>
                </div>
                <p className="text-sm">{signal.description}</p>
                {signal.source && (
                  <p className="text-xs text-muted mt-1">Source: {signal.source}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
