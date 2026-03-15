from __future__ import annotations
import json
import asyncio
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse

from app.models.schemas import (
    AnalyzeRequest,
    BatchAnalyzeRequest,
    AccountIntelligence,
)
from app.agents.graph import pipeline
from app.services.cache import get_cached, set_cached, save_analysis, get_history

app = FastAPI(title="Fello AI Account Intelligence", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _build_initial_state(req: AnalyzeRequest) -> dict:
    state: dict = {
        "input_type": req.input_type,
        "raw_input": {},
        "company_name": "",
        "domain": "",
        "identification": {},
        "company_profile": {},
        "tech_stack": [],
        "leadership": [],
        "business_signals": [],
        "persona": {},
        "intent": {},
        "ai_summary": "",
        "recommended_actions": [],
        "agent_statuses": {},
    }
    if req.input_type == "visitor" and req.visitor:
        state["raw_input"]["visitor"] = req.visitor.model_dump()
    elif req.input_type == "company" and req.company:
        state["raw_input"]["company"] = req.company.model_dump()
        state["company_name"] = req.company.company_name
        state["domain"] = req.company.domain or ""
    return state


def _state_to_result(state: dict) -> dict:
    return {
        "company_identification": state.get("identification", {}),
        "company_profile": state.get("company_profile", {}),
        "tech_stack": state.get("tech_stack", []),
        "leadership": state.get("leadership", []),
        "business_signals": state.get("business_signals", []),
        "persona": state.get("persona", {}),
        "intent": state.get("intent", {}),
        "ai_summary": state.get("ai_summary", ""),
        "recommended_actions": state.get("recommended_actions", []),
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/analyze")
async def analyze(req: AnalyzeRequest):
    """Run the full agent pipeline and return structured intelligence."""
    cache_key = ""
    if req.input_type == "company" and req.company:
        cache_key = req.company.company_name
        cached = await get_cached(cache_key)
        if cached:
            return cached

    initial_state = _build_initial_state(req)
    final_state = await pipeline.ainvoke(initial_state)
    result = _state_to_result(final_state)

    if cache_key:
        await set_cached(cache_key, result)
    await save_analysis(req.model_dump(), result)
    return result


@app.post("/analyze/stream")
async def analyze_stream(req: AnalyzeRequest):
    """Stream agent progress via SSE."""

    async def event_generator():
        initial_state = _build_initial_state(req)

        agents = [
            "identification", "enrichment", "tech_stack",
            "leadership", "intent", "persona", "synthesis",
        ]
        for a in agents:
            yield {
                "event": "agent_status",
                "data": json.dumps({"agent": a, "status": "pending"}),
            }

        yield {
            "event": "agent_status",
            "data": json.dumps({
                "agent": "identification",
                "status": "running",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }),
        }

        final_state = await pipeline.ainvoke(initial_state)
        result = _state_to_result(final_state)

        completed_agents = final_state.get("agent_statuses", {})
        for agent_name in agents:
            status = completed_agents.get(agent_name, "complete")
            yield {
                "event": "agent_complete",
                "data": json.dumps({
                    "agent": agent_name,
                    "status": "complete",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }),
            }

        yield {
            "event": "final_result",
            "data": json.dumps(result),
        }

        cache_key = ""
        if req.input_type == "company" and req.company:
            cache_key = req.company.company_name
            await set_cached(cache_key, result)
        await save_analysis(req.model_dump(), result)

    return EventSourceResponse(event_generator())


@app.post("/analyze/batch")
async def analyze_batch(req: BatchAnalyzeRequest):
    """Process multiple companies concurrently."""
    async def run_one(company):
        single = AnalyzeRequest(
            input_type="company",
            company=company,
        )
        cache_key = company.company_name
        cached = await get_cached(cache_key)
        if cached:
            return cached
        initial_state = _build_initial_state(single)
        final_state = await pipeline.ainvoke(initial_state)
        result = _state_to_result(final_state)
        await set_cached(cache_key, result)
        await save_analysis(single.model_dump(), result)
        return result

    tasks = [run_one(c) for c in req.companies]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    output = []
    for r in results:
        if isinstance(r, Exception):
            output.append({"error": str(r)})
        else:
            output.append(r)
    return output


@app.get("/history")
async def history(limit: int = 50):
    return await get_history(limit)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
