const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface VisitorSignal {
  visitor_id: string;
  ip: string;
  pages_visited: string[];
  time_on_site: string;
  visits_this_week: number;
  referral_source: string;
  device: string;
  location: string;
}

export interface CompanyInput {
  company_name: string;
  domain?: string;
}

export interface AnalyzeRequest {
  input_type: "visitor" | "company";
  visitor?: VisitorSignal;
  company?: CompanyInput;
}

export interface CompanyIdentification {
  company_name: string;
  domain: string;
  confidence: number;
}

export interface CompanyProfile {
  company_name: string;
  domain: string;
  industry: string;
  company_size: string;
  headquarters: string;
  founding_year: string;
  description: string;
  website: string;
}

export interface TechStackItem {
  category: string;
  technology: string;
  confidence: number;
}

export interface LeadershipEntry {
  name: string;
  title: string;
  confidence: number;
}

export interface BusinessSignal {
  signal_type: string;
  description: string;
  source: string;
}

export interface PersonaInference {
  likely_persona: string;
  confidence: number;
  reasoning: string;
}

export interface IntentScore {
  score: number;
  stage: string;
  reasoning: string;
  signals: string[];
}

export interface AccountIntelligence {
  company_identification: CompanyIdentification;
  company_profile: CompanyProfile;
  tech_stack: TechStackItem[];
  leadership: LeadershipEntry[];
  business_signals: BusinessSignal[];
  persona: PersonaInference;
  intent: IntentScore;
  ai_summary: string;
  recommended_actions: string[];
}

export async function analyzeAccount(req: AnalyzeRequest): Promise<AccountIntelligence> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function analyzeBatch(companies: CompanyInput[]): Promise<AccountIntelligence[]> {
  const res = await fetch(`${API_BASE}/analyze/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ companies }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function analyzeStream(
  req: AnalyzeRequest,
  onAgentStatus: (agent: string, status: string) => void,
  onResult: (result: AccountIntelligence) => void,
  onError: (err: string) => void,
): () => void {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(`${API_BASE}/analyze/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
        signal: controller.signal,
      });

      if (!res.ok) {
        onError(`API error: ${res.status}`);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) { onError("No response body"); return; }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data:")) {
            const raw = line.slice(5).trim();
            if (!raw) continue;
            try {
              const parsed = JSON.parse(raw);
              if (parsed.agent && parsed.status) {
                onAgentStatus(parsed.agent, parsed.status);
              }
            } catch {
              // ignore
            }
          }
          if (line.startsWith("event:")) {
            const eventType = line.slice(6).trim();
            if (eventType === "final_result") {
              // Next data line is the result
            }
          }
        }
      }

      // Parse any remaining buffer for final result
      if (buffer.startsWith("data:")) {
        try {
          const parsed = JSON.parse(buffer.slice(5).trim());
          onResult(parsed);
        } catch {
          // ignore
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        onError((err as Error).message);
      }
    }
  })();

  return () => controller.abort();
}

export async function getHistory(limit = 50) {
  const res = await fetch(`${API_BASE}/history?limit=${limit}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
