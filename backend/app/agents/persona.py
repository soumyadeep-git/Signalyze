from langchain_groq import ChatGroq
from app.config import get_settings
from app.utils import extract_json

PAGE_PERSONA_MAP = {
    "pricing": "Buyer / Decision Maker",
    "plans": "Buyer / Decision Maker",
    "demo": "Buyer / Decision Maker",
    "request-demo": "Buyer / Decision Maker",
    "case-studies": "Buyer / Decision Maker",
    "case-study": "Buyer / Decision Maker",
    "customers": "Buyer / Decision Maker",
    "testimonials": "Buyer / Decision Maker",
    "product": "Evaluator",
    "features": "Evaluator",
    "solutions": "Evaluator",
    "integrations": "Technical Evaluator",
    "enterprise": "Enterprise Buyer",
    "docs": "Technical User",
    "documentation": "Technical User",
    "api": "Developer / Technical",
    "developer": "Developer / Technical",
    "blog": "Researcher",
    "resources": "Researcher",
    "about": "General Visitor",
    "careers": "Job Seeker",
    "contact": "Active Buyer",
    "ai-sales-agent": "Sales Operations",
}


async def infer_persona(state: dict) -> dict:
    """Infer the likely persona/role of the visitor from behavior."""
    raw = state.get("raw_input", {})
    input_type = state.get("input_type", "company")

    if input_type == "company":
        return {
            "persona": {
                "likely_persona": "Unknown",
                "confidence": 0.0,
                "reasoning": "No visitor behavior data available.",
            },
        }

    visitor = raw.get("visitor", {})
    pages = visitor.get("pages_visited", [])
    time_on_site = visitor.get("time_on_site", "0s")
    referral = visitor.get("referral_source", "")
    device = visitor.get("device", "")

    page_personas = []
    for page in pages:
        page_clean = page.strip("/").lower().split("/")[-1] if page else ""
        for key, persona in PAGE_PERSONA_MAP.items():
            if key in page_clean:
                page_personas.append(persona)
                break

    settings = get_settings()
    llm = ChatGroq(api_key=settings.groq_api_key, model=settings.groq_model, temperature=0)

    prompt = f"""Based on a website visitor's behavior, infer their likely job role/persona.

Visitor behavior:
- Pages visited: {', '.join(pages)}
- Time on site: {time_on_site}
- Referral source: {referral or 'Direct'}
- Device: {device or 'Unknown'}
- Page-to-persona mapping suggests: {', '.join(page_personas) if page_personas else 'N/A'}

Return ONLY valid JSON:
{{
  "likely_persona": "Specific job title, e.g. Head of Sales Operations, VP Marketing, CTO",
  "confidence": <float 0-1>,
  "reasoning": "1-2 sentence explanation of why this persona is likely"
}}"""

    resp = await llm.ainvoke(prompt)
    result = extract_json(resp.content)
    if not result or not isinstance(result, dict):
        most_common = max(set(page_personas), key=page_personas.count) if page_personas else "Unknown"
        result = {
            "likely_persona": most_common,
            "confidence": 0.5,
            "reasoning": "Inferred from page visit patterns.",
        }

    return {"persona": result}
