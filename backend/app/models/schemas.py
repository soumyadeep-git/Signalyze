from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional


# --------------- Request models ---------------

class VisitorSignal(BaseModel):
    visitor_id: str = ""
    ip: str = ""
    pages_visited: list[str] = Field(default_factory=list)
    time_on_site: str = ""
    visits_this_week: int = 1
    referral_source: str = ""
    device: str = ""
    location: str = ""


class CompanyInput(BaseModel):
    company_name: str
    domain: Optional[str] = None


class AnalyzeRequest(BaseModel):
    input_type: str = Field(..., pattern="^(visitor|company)$")
    visitor: Optional[VisitorSignal] = None
    company: Optional[CompanyInput] = None


class BatchAnalyzeRequest(BaseModel):
    companies: list[CompanyInput]


# --------------- Output sub-models ---------------

class CompanyIdentification(BaseModel):
    company_name: str = ""
    domain: str = ""
    confidence: float = 0.0


class CompanyProfile(BaseModel):
    company_name: str = ""
    domain: str = ""
    industry: str = ""
    company_size: str = ""
    headquarters: str = ""
    founding_year: str = ""
    description: str = ""
    website: str = ""


class TechStackItem(BaseModel):
    category: str = ""
    technology: str = ""
    confidence: float = 0.0


class LeadershipEntry(BaseModel):
    name: str = ""
    title: str = ""
    confidence: float = 0.0


class BusinessSignal(BaseModel):
    signal_type: str = ""
    description: str = ""
    source: str = ""


class PersonaInference(BaseModel):
    likely_persona: str = ""
    confidence: float = 0.0
    reasoning: str = ""


class IntentScore(BaseModel):
    score: float = 0.0
    stage: str = ""
    reasoning: str = ""
    signals: list[str] = Field(default_factory=list)


# --------------- Full result ---------------

class AccountIntelligence(BaseModel):
    company_identification: CompanyIdentification = Field(default_factory=CompanyIdentification)
    company_profile: CompanyProfile = Field(default_factory=CompanyProfile)
    tech_stack: list[TechStackItem] = Field(default_factory=list)
    leadership: list[LeadershipEntry] = Field(default_factory=list)
    business_signals: list[BusinessSignal] = Field(default_factory=list)
    persona: PersonaInference = Field(default_factory=PersonaInference)
    intent: IntentScore = Field(default_factory=IntentScore)
    ai_summary: str = ""
    recommended_actions: list[str] = Field(default_factory=list)


class AgentEvent(BaseModel):
    event: str
    agent: str = ""
    data: dict = Field(default_factory=dict)
    timestamp: str = ""
