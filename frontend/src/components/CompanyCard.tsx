"use client";

import { Building2, Globe, MapPin, Calendar, Users, Briefcase } from "lucide-react";
import type { CompanyProfile, CompanyIdentification } from "@/lib/api";

interface CompanyCardProps {
  identification: CompanyIdentification;
  profile: CompanyProfile;
}

export default function CompanyCard({ identification, profile }: CompanyCardProps) {
  const domain = profile.domain || identification.domain || "";
  const logoUrl = domain
    ? `https://logo.clearbit.com/${domain.replace(/^(https?:\/\/)?(www\.)?/, "")}`
    : null;

  return (
    <div className="glass-panel rounded-xl p-6 animate-slide-up">
      <div className="flex items-start gap-4">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt=""
            className="w-14 h-14 rounded-lg border border-border bg-white p-1 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-14 h-14 rounded-lg border border-border bg-secondary flex items-center justify-center">
            <Building2 className="w-7 h-7 text-muted" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-serif font-normal tracking-wide truncate text-white">
            {profile.company_name || identification.company_name || "Unknown Company"}
          </h2>
          {domain && (
            <a
              href={`https://${domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1 mt-0.5"
            >
              <Globe className="w-3.5 h-3.5" />
              {domain}
            </a>
          )}
          {identification.confidence > 0 && (
            <span className="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {Math.round(identification.confidence * 100)}% confidence
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-5">
        {profile.industry && (
          <InfoItem icon={Briefcase} label="Industry" value={profile.industry} />
        )}
        {profile.company_size && (
          <InfoItem icon={Users} label="Size" value={profile.company_size} />
        )}
        {profile.headquarters && (
          <InfoItem icon={MapPin} label="HQ" value={profile.headquarters} />
        )}
        {profile.founding_year && profile.founding_year !== "Unknown" && (
          <InfoItem icon={Calendar} label="Founded" value={profile.founding_year} />
        )}
      </div>

      {profile.description && (
        <p className="mt-4 text-sm text-secondary-foreground leading-relaxed">
          {profile.description}
        </p>
      )}
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="w-4 h-4 text-muted flex-shrink-0" />
      <span className="text-muted">{label}:</span>
      <span className="font-medium truncate">{value}</span>
    </div>
  );
}
