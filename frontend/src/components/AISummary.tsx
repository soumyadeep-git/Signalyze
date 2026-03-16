"use client";

import { Sparkles } from "lucide-react";

interface AISummaryProps {
  summary: string;
}

export default function AISummary({ summary }: AISummaryProps) {
  if (!summary) return null;

  return (
    <div className="glass-panel rounded-xl p-6 animate-slide-up relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none" />
      <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4" />
        AI Intelligence Summary
      </h3>
      <p className="text-sm leading-relaxed">{summary}</p>
    </div>
  );
}
