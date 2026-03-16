"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Eye, Building2, Upload, Plus, X, Loader2, Search,
} from "lucide-react";
import type { AnalyzeRequest, CompanyInput } from "@/lib/api";

interface InputFormProps {
  onSubmit: (req: AnalyzeRequest) => void;
  onBatchSubmit: (companies: CompanyInput[]) => void;
  loading: boolean;
}

type Tab = "visitor" | "company" | "batch";

export default function InputForm({ onSubmit, onBatchSubmit, loading }: InputFormProps) {
  const [tab, setTab] = useState<Tab>("company");

  const [visitorId, setVisitorId] = useState("001");
  const [ip, setIp] = useState("34.201.10.50");
  const [pages, setPages] = useState("/pricing, /ai-sales-agent, /case-studies");
  const [timeOnSite, setTimeOnSite] = useState("3m 42s");
  const [visitsWeek, setVisitsWeek] = useState(3);
  const [referral, setReferral] = useState("");
  const [device, setDevice] = useState("");
  const [location, setLocation] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [companyDomain, setCompanyDomain] = useState("");

  const [batchCompanies, setBatchCompanies] = useState<CompanyInput[]>([
    { company_name: "Rocket Mortgage" },
    { company_name: "Redfin" },
    { company_name: "Compass Real Estate" },
  ]);
  const [newBatch, setNewBatch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleVisitorSubmit = () => {
    onSubmit({
      input_type: "visitor",
      visitor: {
        visitor_id: visitorId,
        ip,
        pages_visited: pages.split(",").map((p) => p.trim()).filter(Boolean),
        time_on_site: timeOnSite,
        visits_this_week: visitsWeek,
        referral_source: referral,
        device,
        location,
      },
    });
  };

  const handleCompanySubmit = () => {
    if (!companyName.trim()) return;
    onSubmit({
      input_type: "company",
      company: {
        company_name: companyName.trim(),
        domain: companyDomain.trim() || undefined,
      },
    });
  };

  const handleBatchSubmit = () => {
    if (batchCompanies.length === 0) return;
    onBatchSubmit(batchCompanies);
  };

  const addBatchCompany = () => {
    if (!newBatch.trim()) return;
    setBatchCompanies((prev) => [...prev, { company_name: newBatch.trim() }]);
    setNewBatch("");
  };

  const removeBatchCompany = (i: number) => {
    setBatchCompanies((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      const companies: CompanyInput[] = lines
        .filter((l) => !l.toLowerCase().startsWith("company"))
        .map((l) => {
          const parts = l.split(",");
          return {
            company_name: parts[0]?.trim().replace(/"/g, "") || "",
            domain: parts[1]?.trim().replace(/"/g, "") || undefined,
          };
        })
        .filter((c) => c.company_name);
      setBatchCompanies(companies);
    };
    reader.readAsText(file);
  };

  const tabs: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "company", label: "Company Lookup", icon: Building2 },
    { key: "visitor", label: "Visitor Signals", icon: Eye },
    { key: "batch", label: "Batch Process", icon: Upload },
  ];

  return (
    <div className="glass-panel rounded-xl overflow-hidden shadow-2xl shadow-black/50">
      <div className="flex border-b border-primary/20 bg-black/20">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex-1 px-4 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300",
                  tab === t.key
                    ? "bg-primary/10 text-primary-light border-b-2 border-primary shadow-[inset_0_-2px_10px_rgba(255,107,0,0.1)]"
                    : "text-secondary-foreground hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="p-6">
        {tab === "company" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Rocket Mortgage"
                className="w-full px-4 py-3 rounded-lg border border-primary/20 bg-black/40 text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                onKeyDown={(e) => e.key === "Enter" && handleCompanySubmit()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Domain <span className="text-muted">(optional)</span>
              </label>
              <input
                type="text"
                value={companyDomain}
                onChange={(e) => setCompanyDomain(e.target.value)}
                placeholder="e.g. rocketmortgage.com"
                className="w-full px-4 py-3 rounded-lg border border-primary/20 bg-black/40 text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <button
              onClick={handleCompanySubmit}
              disabled={loading || !companyName.trim()}
              className="w-full py-3.5 px-4 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-black font-medium hover:shadow-[0_0_15px_rgba(255,107,0,0.3)] hover:-translate-y-0.5 disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? "Analyzing..." : "Analyze Company"}
            </button>
          </div>
        )}

        {tab === "visitor" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Visitor ID" value={visitorId} onChange={setVisitorId} placeholder="001" />
              <Field label="IP Address" value={ip} onChange={setIp} placeholder="34.201.xxx.xxx" />
            </div>
            <Field
              label="Pages Visited"
              value={pages}
              onChange={setPages}
              placeholder="/pricing, /features, /case-studies"
            />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Time on Site" value={timeOnSite} onChange={setTimeOnSite} placeholder="3m 42s" />
              <div>
                <label className="block text-sm font-medium mb-1.5">Visits This Week</label>
                <input
                  type="number"
                  value={visitsWeek}
                  onChange={(e) => setVisitsWeek(Number(e.target.value))}
                  min={1}
                  className="w-full px-4 py-3 rounded-lg border border-primary/20 bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Referral" value={referral} onChange={setReferral} placeholder="google" />
              <Field label="Device" value={device} onChange={setDevice} placeholder="Desktop" />
              <Field label="Location" value={location} onChange={setLocation} placeholder="New York" />
            </div>
            <button
              onClick={handleVisitorSubmit}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-black font-medium hover:shadow-[0_0_15px_rgba(255,107,0,0.3)] hover:-translate-y-0.5 disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              {loading ? "Analyzing..." : "Analyze Visitor"}
            </button>
          </div>
        )}

        {tab === "batch" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newBatch}
                onChange={(e) => setNewBatch(e.target.value)}
                placeholder="Add company name..."
                className="flex-1 px-4 py-3 rounded-lg border border-primary/20 bg-black/40 text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                onKeyDown={(e) => e.key === "Enter" && addBatchCompany()}
              />
              <button
                onClick={addBatchCompany}
                className="px-4 py-3 rounded-lg border border-primary/20 bg-black/40 text-primary-light hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="px-4 py-3 rounded-lg border border-primary/20 bg-black/40 text-primary-light hover:bg-primary/20 transition-colors"
                title="Upload CSV"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input ref={fileRef} type="file" accept=".csv" onChange={handleCSV} className="hidden" />
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {batchCompanies.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/50"
                >
                  <span className="text-sm">{c.company_name}</span>
                  <button onClick={() => removeBatchCompany(i)} className="text-muted hover:text-accent-danger">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleBatchSubmit}
              disabled={loading || batchCompanies.length === 0}
              className="w-full py-3.5 px-4 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-black font-medium hover:shadow-[0_0_15px_rgba(255,107,0,0.3)] hover:-translate-y-0.5 disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {loading ? "Processing..." : `Analyze ${batchCompanies.length} Companies`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-lg border border-primary/20 bg-black/40 text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
      />
    </div>
  );
}
