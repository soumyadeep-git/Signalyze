"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, Building2, User, Globe, Activity } from "lucide-react";

export default function LandingPage() {
  const companies = [
    { name: "Acme Corp", industry: "Financial Services", intent: 9.2, persona: "VP Sales" },
    { name: "TechNova", industry: "SaaS", intent: 8.5, persona: "CTO" },
    { name: "Global Logistics", industry: "Supply Chain", intent: 7.8, persona: "Director Ops" },
    { name: "Stripe", industry: "Fintech", intent: 9.5, persona: "Head of Growth" },
    { name: "Vercel", industry: "Cloud Infrastructure", intent: 8.9, persona: "Engineering Lead" },
  ];

  return (
    <div className="min-h-screen text-foreground overflow-hidden relative flex flex-col">
      {/* Abstract Background Orbs / Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] animate-float pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary-dark/10 blur-[120px] animate-float-delayed pointer-events-none" />
      <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] rounded-full bg-primary-light/5 blur-[100px] animate-pulse-slow pointer-events-none" />

      {/* Navigation */}
      <nav className="w-full px-8 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <span className="font-serif text-2xl font-light tracking-wide text-primary-light">Signalyze</span>
        </div>
        <Link 
          href="/dashboard" 
          className="px-6 py-2.5 rounded-full glass-panel text-primary-light hover:bg-white/10 transition-all duration-300 font-medium text-sm border border-primary/30"
        >
          Enter Platform
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-8 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Side: Hero Text */}
        <div className="flex-1 space-y-8 animate-slide-up text-left pt-10 lg:pt-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-primary-light text-sm font-light mb-2 border border-primary/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
            </span>
            Next-Gen Intelligence Engine Live
          </div>
          
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light leading-[1.15] text-white tracking-wide">
            Illuminate Hidden <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-primary to-primary-dark">
              Account Revenue
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-secondary-foreground max-w-xl leading-relaxed font-light opacity-80">
            Transform anonymous website signals and raw company names into rich, actionable sales intelligence using autonomous AI agents.
          </p>

          <div className="pt-6">
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-primary-dark text-black font-medium text-base shadow-[0_8px_30px_rgba(255,107,0,0.3)] hover:-translate-y-1 transition-all duration-300"
            >
              Launch Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Right Side: Vertical Marquee Animation */}
        <div className="flex-1 w-full h-[600px] relative z-10 flex justify-end overflow-hidden hide-scrollbar mask-image-vertical pt-10 pb-10">
          {/* Top and Bottom gradient masks for smooth fade out */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none" />
          
          <div className="flex gap-6 relative right-0 lg:right-[-20px]">
            {/* Column 1 - Marquee Up */}
            <div className="flex flex-col gap-6 animate-marquee-vertical w-[320px]">
              {[...companies, ...companies, ...companies].map((company, i) => (
                <div 
                  key={`col1-${i}`} 
                  className="glass-panel rounded-2xl p-6 flex-shrink-0 transition-colors border border-primary/20 hover:border-primary/50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-serif font-light text-xl text-white flex items-center gap-2 tracking-wide">
                        <Building2 className="w-5 h-5 text-primary" />
                        {company.name}
                      </h3>
                      <p className="text-sm text-secondary-foreground mt-1 flex items-center gap-1 font-light">
                        <Globe className="w-3.5 h-3.5" />
                        {company.industry}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-xs text-muted uppercase font-light tracking-wide mb-1">Intent</div>
                      <div className="text-primary font-light text-lg flex items-center gap-1">
                        <Activity className="w-4 h-4" />
                        {company.intent.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-border/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-light text-white">{company.persona}</span>
                    </div>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                      Enriched
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Column 2 - Marquee Up (Slower, Offset) */}
            <div className="flex flex-col gap-6 animate-marquee-vertical-slow w-[320px] mt-12 hidden md:flex">
              {[...companies.reverse(), ...companies.reverse(), ...companies.reverse()].map((company, i) => (
                <div 
                  key={`col2-${i}`} 
                  className="glass-panel rounded-2xl p-6 flex-shrink-0 transition-colors opacity-90 border border-primary/10 hover:border-primary/30"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-serif font-light text-xl text-white/80 flex items-center gap-2 tracking-wide">
                        <Building2 className="w-5 h-5 text-primary/80" />
                        {company.name}
                      </h3>
                      <p className="text-sm text-secondary-foreground mt-1 flex items-center gap-1 font-light">
                        <Globe className="w-3.5 h-3.5" />
                        {company.industry}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-xs text-muted uppercase font-light tracking-wide mb-1">Intent</div>
                      <div className="text-primary/80 font-light text-lg flex items-center gap-1">
                        <Activity className="w-4 h-4" />
                        {company.intent.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-border/30 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary/80" />
                      </div>
                      <span className="text-sm font-light text-white/80">{company.persona}</span>
                    </div>
                    <span className="text-xs font-medium text-primary/80 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                      Detected
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}