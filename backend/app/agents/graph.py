from __future__ import annotations
from typing import TypedDict
from langgraph.graph import StateGraph, END

from app.agents.identification import identify_company
from app.agents.enrichment import enrich_company
from app.agents.tech_stack import detect_tech_stack
from app.agents.leadership import discover_leadership
from app.agents.intent import analyze_intent
from app.agents.persona import infer_persona
from app.agents.synthesis import synthesize


class AccountState(TypedDict, total=False):
    input_type: str
    raw_input: dict
    company_name: str
    domain: str
    identification: dict
    company_profile: dict
    tech_stack: list
    leadership: list
    business_signals: list
    persona: dict
    intent: dict
    ai_summary: str
    recommended_actions: list
    agent_statuses: dict


def _needs_identification(state: AccountState) -> str:
    if state.get("input_type") == "visitor":
        return "identify"
    return "skip_identify"


async def _set_company_from_input(state: dict) -> dict:
    """For company-type input, extract name/domain directly."""
    raw = state.get("raw_input", {})
    company = raw.get("company", {})
    return {
        "company_name": company.get("company_name", ""),
        "domain": company.get("domain", "") or "",
        "identification": {
            "company_name": company.get("company_name", ""),
            "domain": company.get("domain", "") or "",
            "confidence": 1.0,
        },
    }


def _merge_parallel(state: dict) -> dict:
    """No-op node used as a synchronisation barrier after parallel fan-out."""
    return state


def build_graph() -> StateGraph:
    """Construct the LangGraph agent pipeline.

    Flow:
      START
        -> route: visitor? -> identify_company
                  company? -> set_company_from_input
        -> fan-out (parallel): enrich, tech_stack, leadership, intent, persona
        -> merge barrier
        -> synthesize
        -> END
    """
    graph = StateGraph(AccountState)

    graph.add_node("identify", identify_company)
    graph.add_node("set_company", _set_company_from_input)
    graph.add_node("enrich", enrich_company)
    graph.add_node("tech_stack", detect_tech_stack)
    graph.add_node("leadership", discover_leadership)
    graph.add_node("intent", analyze_intent)
    graph.add_node("persona", infer_persona)
    graph.add_node("synthesize", synthesize)

    graph.set_conditional_entry_point(
        _needs_identification,
        {"identify": "identify", "skip_identify": "set_company"},
    )

    for src in ("identify", "set_company"):
        graph.add_edge(src, "enrich")
        graph.add_edge(src, "tech_stack")
        graph.add_edge(src, "leadership")
        graph.add_edge(src, "intent")
        graph.add_edge(src, "persona")

    graph.add_edge("enrich", "synthesize")
    graph.add_edge("tech_stack", "synthesize")
    graph.add_edge("leadership", "synthesize")
    graph.add_edge("intent", "synthesize")
    graph.add_edge("persona", "synthesize")

    graph.add_edge("synthesize", END)

    return graph.compile()


pipeline = build_graph()
