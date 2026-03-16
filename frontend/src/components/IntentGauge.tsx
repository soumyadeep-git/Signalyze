"use client";

import type { IntentScore } from "@/lib/api";

interface IntentGaugeProps {
  intent: IntentScore;
}

export default function IntentGauge({ intent }: IntentGaugeProps) {
  const score = intent.score || 0;
  const circumference = 2 * Math.PI * 45;
  const progress = (score / 10) * circumference;
  const offset = circumference - progress;

  const color =
    score >= 7 ? "var(--accent)" : score >= 4 ? "var(--accent-warn)" : "var(--accent-danger)";

  const stageColors: Record<string, string> = {
    Decision: "bg-accent/10 text-accent",
    Evaluation: "bg-primary/10 text-primary",
    Consideration: "bg-accent-warn/10 text-accent-warn",
    Interest: "bg-accent-warn/10 text-accent-warn",
    Awareness: "bg-secondary text-secondary-foreground",
  };

  return (
    <div className="glass-panel rounded-xl p-6 animate-slide-up">
      <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">
        Buyer Intent
      </h3>

      <div className="flex items-center gap-6">
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="var(--border)"
              strokeWidth="8"
            />
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="gauge-animate"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-light tracking-tight" style={{ color }}>
              {score.toFixed(1)}
            </span>
            <span className="text-xs text-muted">/10</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {intent.stage && (
            <div>
              <span className="text-xs text-muted">Stage</span>
              <div className="mt-1">
                <span
                  className={`text-sm font-medium px-2.5 py-1 rounded-full ${stageColors[intent.stage] || "bg-secondary text-secondary-foreground"}`}
                >
                  {intent.stage}
                </span>
              </div>
            </div>
          )}
          {intent.reasoning && (
            <p className="text-sm text-secondary-foreground">{intent.reasoning}</p>
          )}
        </div>
      </div>

      {intent.signals && intent.signals.length > 0 && (
        <div className="mt-4 space-y-1.5">
          <span className="text-xs text-muted font-medium">Signals</span>
          {intent.signals.map((s, i) => (
            <div key={i} className="text-xs text-secondary-foreground bg-secondary rounded-lg px-3 py-1.5">
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
