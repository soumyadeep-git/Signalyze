import json
from langchain_groq import ChatGroq
from app.config import get_settings
from app.services.ip_lookup import lookup_ip, extract_company_hint
from app.services.web_search import search_web, find_company_domain


async def identify_company(state: dict) -> dict:
    """Resolve a company from visitor signals (IP, behavior)."""
    raw = state.get("raw_input", {})
    visitor = raw.get("visitor", {})
    ip = visitor.get("ip", "")
    pages = visitor.get("pages_visited", [])

    company_name = ""
    domain = ""
    confidence = 0.0
    ip_data = {}

    if ip:
        ip_data = await lookup_ip(ip)
        hint = extract_company_hint(ip_data)
        if hint:
            company_name = hint
            confidence = 0.5

    if company_name:
        results = await search_web(f"{company_name} company website", max_results=3)
        domain = await find_company_domain(company_name) or ""

        settings = get_settings()
        llm = ChatGroq(api_key=settings.groq_api_key, model=settings.groq_model, temperature=0)

        search_context = "\n".join(
            f"- {r['title']}: {r['snippet']}" for r in results
        )

        prompt = f"""Given IP lookup data and search results, identify the most likely company.

IP Data:
- Organization: {ip_data.get('org', 'N/A')}
- ISP: {ip_data.get('isp', 'N/A')}
- Location: {ip_data.get('city', '')}, {ip_data.get('region', '')}, {ip_data.get('country', '')}

Search results for "{company_name}":
{search_context}

Pages visited on our site: {', '.join(pages)}

Return ONLY valid JSON:
{{"company_name": "...", "domain": "...", "confidence": 0.0-1.0}}"""

        resp = await llm.ainvoke(prompt)
        try:
            parsed = json.loads(resp.content)
            company_name = parsed.get("company_name", company_name)
            domain = parsed.get("domain", domain)
            confidence = parsed.get("confidence", confidence)
        except (json.JSONDecodeError, AttributeError):
            pass

    if not company_name and ip_data:
        company_name = ip_data.get("org", "") or ip_data.get("isp", "")
        confidence = 0.3

    return {
        **state,
        "company_name": company_name,
        "domain": domain,
        "identification": {
            "company_name": company_name,
            "domain": domain,
            "confidence": round(confidence, 2),
        },
        "agent_statuses": {**state.get("agent_statuses", {}), "identification": "complete"},
    }
