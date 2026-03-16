from langchain_groq import ChatGroq
from app.config import get_settings
from app.utils import extract_json
from app.services.web_search import search_company_info
from app.services.scraper import scrape_website


async def enrich_company(state: dict) -> dict:
    """Discover structured company profile from web data."""
    company_name = state.get("company_name", "")
    domain = state.get("domain", "")

    if not company_name:
        return {"company_profile": {}}

    search_results = await search_company_info(company_name)
    search_text = "\n".join(
        f"- {r['title']}: {r['snippet']}" for r in search_results
    )

    site_data = {}
    if domain:
        site_data = await scrape_website(domain)
    elif company_name:
        from app.services.web_search import find_company_domain
        found_domain = await find_company_domain(company_name)
        if found_domain:
            domain = found_domain
            site_data = await scrape_website(found_domain)

    site_context = ""
    if site_data.get("success"):
        site_context = f"""
Website title: {site_data.get('title', '')}
Meta description: {site_data.get('meta_description', '')}
Website text excerpt: {site_data.get('raw_text', '')[:1500]}"""

    settings = get_settings()
    llm = ChatGroq(api_key=settings.groq_api_key, model=settings.groq_model, temperature=0)

    prompt = f"""Research and build a company profile for "{company_name}".

Search results:
{search_text}

{f"Website data:{site_context}" if site_context else "No website data available."}

Return ONLY valid JSON with these fields:
{{
  "company_name": "{company_name}",
  "domain": "{domain}",
  "website": "https://...",
  "industry": "...",
  "company_size": "e.g. 50-200 employees",
  "headquarters": "City, State/Country",
  "founding_year": "YYYY or unknown",
  "description": "2-3 sentence business description"
}}"""

    resp = await llm.ainvoke(prompt)
    profile = extract_json(resp.content)
    if not profile or not isinstance(profile, dict):
        profile = {
            "company_name": company_name,
            "domain": domain,
            "website": f"https://{domain}" if domain else "",
            "industry": "Unknown",
            "company_size": "Unknown",
            "headquarters": "Unknown",
            "founding_year": "Unknown",
            "description": "",
        }

    profile.setdefault("domain", domain)
    profile.setdefault("company_name", company_name)

    return {
        "domain": domain or profile.get("domain", ""),
        "company_profile": profile,
    }
