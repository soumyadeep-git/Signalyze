from langchain_groq import ChatGroq
from app.config import get_settings
from app.utils import extract_json
from app.services.web_search import search_company_leadership


async def discover_leadership(state: dict) -> dict:
    """Find key decision-makers at the company."""
    company_name = state.get("company_name", "")

    if not company_name:
        return {"leadership": []}

    search_results = await search_company_leadership(company_name)
    search_text = "\n".join(
        f"- {r['title']}: {r['snippet']}" for r in search_results
    )

    settings = get_settings()
    llm = ChatGroq(api_key=settings.groq_api_key, model=settings.groq_model, temperature=0)

    prompt = f"""Identify key leadership and decision-makers at "{company_name}".

Search results:
{search_text}

Return ONLY a valid JSON array of leaders found. Each item:
{{"name": "Full Name", "title": "Job Title", "confidence": 0.0-1.0}}

Focus on: CEO/Founder, VP Sales, VP Marketing, Head of Operations, CTO, RevOps leaders.
Only include people you have evidence for. Do not fabricate names."""

    resp = await llm.ainvoke(prompt)
    leaders = extract_json(resp.content)
    if not leaders or not isinstance(leaders, list):
        leaders = []

    return {"leadership": leaders}
