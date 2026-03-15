"use client";

import { Sparkles } from "lucide-react";

interface AISummaryProps {
  summary: string;
}

export default function AISummary({ summary }: AISummaryProps) {
  if (!summary) return null;

  return (
    <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/20 p-6 animate-slide-up">
      <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4" />
        AI Intelligence Summary
      </h3>
      <p className="text-sm leading-relaxed">{summary}</p>
    </div>
  );
}
