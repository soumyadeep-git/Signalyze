"use client";

import { useState, useCallback } from "react";
import { Sparkles } from "lucide-react";
import InputForm from "@/components/InputForm";
import AgentPipeline from "@/components/AgentPipeline";
import CompanyCard from "@/components/CompanyCard";
import IntentGauge from "@/components/IntentGauge";
import TechStack from "@/components/TechStack";
import LeadershipList from "@/components/LeadershipList";
import ActionsPanel from "@/components/ActionsPanel";
import AISummary from "@/components/AISummary";
import type {
  AnalyzeRequest,
  CompanyInput,
  AccountIntelligence,
} from "@/lib/api";
import { analyzeAccount, analyzeBatch } from "@/lib/api";

const EMPTY_RESULT: AccountIntelligence = {
  company_identification: { company_name: "", domain: "", confidence: 0 },
  company_profile: {
    company_name: "", domain: "", industry: "", company_size: "",
    headquarters: "", founding_year: "", description: "", website: "",
  },
  tech_stack: [],
  leadership: [],
  business_signals: [],
  persona: { likely_persona: "", confidence: 0, reasoning: "" },
  intent: { score: 0, stage: "", reasoning: "", signals: [] },
  ai_summary: "",
  recommended_actions: [],
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AccountIntelligence | null>(null);
  const [batchResults, setBatchResults] = useState<AccountIntelligence[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
  const [agentStatuses, setAgentStatuses] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const allAgents = [
    "identification", "enrichment", "tech_stack",
    "leadership", "intent", "persona", "synthesis",
  ];

  const handleSubmit = useCallback(async (req: AnalyzeRequest) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setBatchResults([]);
    setSelectedBatch(null);

    const statuses: Record<string, string> = {};
    allAgents.forEach((a) => { statuses[a] = "pending"; });
    setAgentStatuses({ ...statuses });

    try {
      statuses.identification = "running";
      setAgentStatuses({ ...statuses });

      const data = await analyzeAccount(req);

      allAgents.forEach((a) => { statuses[a] = "complete"; });
      setAgentStatuses({ ...statuses });
      setResult(data);
    } catch (err: unknown) {
      setError((err as Error).message || "Analysis failed");
      allAgents.forEach((a) => {
        if (statuses[a] === "running") statuses[a] = "pending";
      });
      setAgentStatuses({ ...statuses });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBatchSubmit = useCallback(async (companies: CompanyInput[]) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setBatchResults([]);
    setSelectedBatch(null);
    setAgentStatuses({});

    try {
      const data = await analyzeBatch(companies);
      setBatchResults(data);
      if (data.length > 0) {
        setSelectedBatch(0);
        setResult(data[0]);
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Batch analysis failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const displayResult = result || EMPTY_RESULT;
  const hasResult = result !== null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Fello AI</h1>
            <p className="text-xs text-muted">Account Intelligence & Enrichment</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Input */}
          <div className="lg:col-span-4 space-y-6">
            <InputForm
              onSubmit={handleSubmit}
              onBatchSubmit={handleBatchSubmit}
              loading={loading}
            />

            {batchResults.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
                  Batch Results ({batchResults.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {batchResults.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedBatch(i); setResult(r); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedBatch === i
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-secondary"
                      }`}
                    >
                      {r.company_profile?.company_name ||
                        r.company_identification?.company_name ||
                        `Company ${i + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-8 space-y-6">
            {loading && Object.keys(agentStatuses).length > 0 && (
              <AgentPipeline statuses={agentStatuses} />
            )}

            {error && (
              <div className="bg-accent-danger/10 border border-accent-danger/20 rounded-xl p-4 text-sm text-accent-danger">
                {error}
              </div>
            )}

            {!hasResult && !loading && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-2">AI Account Intelligence</h2>
                <p className="text-muted max-w-md">
                  Enter a company name, paste visitor signals, or upload a batch CSV to generate
                  sales-ready intelligence powered by multi-agent AI.
                </p>
              </div>
            )}

            {hasResult && (
              <>
                <AISummary summary={displayResult.ai_summary} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CompanyCard
                    identification={displayResult.company_identification}
                    profile={displayResult.company_profile}
                  />
                  {(displayResult.intent.score > 0 || displayResult.intent.stage) && (
                    <IntentGauge intent={displayResult.intent} />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TechStack items={displayResult.tech_stack} />
                  <LeadershipList leaders={displayResult.leadership} />
                </div>

                <ActionsPanel
                  actions={displayResult.recommended_actions}
                  signals={displayResult.business_signals}
                  persona={displayResult.persona}
                />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
