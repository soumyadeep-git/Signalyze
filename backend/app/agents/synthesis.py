from langchain_groq import ChatGroq
from app.config import get_settings
from app.utils import extract_json
from app.services.web_search import search_company_news


async def synthesize(state: dict) -> dict:
    """Generate AI summary, business signals, and recommended sales actions."""
    company_name = state.get("company_name", "Unknown")
    profile = state.get("company_profile", {})
    tech_stack = state.get("tech_stack", [])
    leadership = state.get("leadership", [])
    intent = state.get("intent", {})
    persona = state.get("persona", {})
    input_type = state.get("input_type", "company")

    news_results = await search_company_news(company_name)
    news_text = "\n".join(
        f"- {r['title']}: {r['snippet']}" for r in news_results
    )

    settings = get_settings()
    llm = ChatGroq(api_key=settings.groq_api_key, model=settings.groq_model, temperature=0)

    tech_summary = ", ".join(t.get("technology", "") for t in tech_stack[:10]) if tech_stack else "None detected"
    leader_summary = ", ".join(f"{l.get('name', '')} ({l.get('title', '')})" for l in leadership[:5]) if leadership else "None found"

    prompt = f"""You are a sales intelligence AI. Generate a comprehensive analysis for this account.

COMPANY DATA:
- Name: {company_name}
- Industry: {profile.get('industry', 'Unknown')}
- Size: {profile.get('company_size', 'Unknown')}
- HQ: {profile.get('headquarters', 'Unknown')}
- Description: {profile.get('description', 'N/A')}
- Tech Stack: {tech_summary}
- Leadership: {leader_summary}

{"VISITOR BEHAVIOR:" if input_type == "visitor" else ""}
{f"- Intent Score: {intent.get('score', 'N/A')}/10" if input_type == "visitor" else ""}
{f"- Intent Stage: {intent.get('stage', 'N/A')}" if input_type == "visitor" else ""}
{f"- Likely Persona: {persona.get('likely_persona', 'N/A')}" if input_type == "visitor" else ""}

RECENT NEWS:
{news_text if news_text else "No recent news found."}

Return ONLY valid JSON:
{{
  "ai_summary": "3-4 sentence intelligence summary about this company and opportunity",
  "business_signals": [
    {{"signal_type": "Hiring|Funding|Expansion|Product Launch|Partnership|Market Trend", "description": "...", "source": "..."}}
  ],
  "recommended_actions": [
    "Specific action 1",
    "Specific action 2",
    "Specific action 3"
  ]
}}

Make actions specific and actionable. Reference actual data points. Include 2-5 business signals and 3-5 actions."""

    resp = await llm.ainvoke(prompt)
    result = extract_json(resp.content)
    if not result or not isinstance(result, dict):
        result = {
            "ai_summary": f"{company_name} has been identified as a potential account. Further research is recommended.",
            "business_signals": [],
            "recommended_actions": [
                f"Research {company_name} on LinkedIn",
                "Identify key decision makers",
                "Add to outbound campaign",
            ],
        }

    return {
        "ai_summary": result.get("ai_summary", ""),
        "business_signals": result.get("business_signals", []),
        "recommended_actions": result.get("recommended_actions", []),
    }
