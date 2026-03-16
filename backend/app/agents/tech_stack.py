from langchain_groq import ChatGroq
from app.config import get_settings
from app.utils import extract_json
from app.services.scraper import scrape_website
from app.services.web_search import search_company_tech


async def detect_tech_stack(state: dict) -> dict:
    """Detect technologies used by the company."""
    company_name = state.get("company_name", "")
    domain = state.get("domain", "")

    if not company_name and not domain:
        return {"tech_stack": []}

    detected_from_site = []
    if domain:
        site_data = await scrape_website(domain)
        if site_data.get("success"):
            detected_from_site = site_data.get("detected_technologies", [])

    search_results = await search_company_tech(company_name)
    search_text = "\n".join(
        f"- {r['title']}: {r['snippet']}" for r in search_results
    )

    settings = get_settings()
    llm = ChatGroq(api_key=settings.groq_api_key, model=settings.groq_model, temperature=0)

    already = ", ".join(detected_from_site) if detected_from_site else "None detected"

    prompt = f"""Identify the technology stack for "{company_name}" ({domain}).

Technologies detected from website HTML: {already}

Search results about their tech:
{search_text}

Return ONLY a valid JSON array. Each item:
{{"category": "CRM|Marketing Automation|Analytics|Website Platform|Cloud|Support|Communication|Payment|Other", "technology": "Name", "confidence": 0.0-1.0}}

Include both detected and inferred technologies. Be realistic — don't fabricate.
Return at least the detected ones with high confidence, and add inferred ones with lower confidence."""

    resp = await llm.ainvoke(prompt)
    tech_list = extract_json(resp.content)
    if not tech_list or not isinstance(tech_list, list):
        tech_list = [
            {"category": "Detected", "technology": t, "confidence": 0.9}
            for t in detected_from_site
        ]

    return {"tech_stack": tech_list}
