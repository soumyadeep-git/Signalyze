from duckduckgo_search import DDGS
from typing import Optional


async def search_web(query: str, max_results: int = 5) -> list[dict]:
    """Search the web using DuckDuckGo (free, no API key)."""
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=max_results))
            return [
                {
                    "title": r.get("title", ""),
                    "url": r.get("href", ""),
                    "snippet": r.get("body", ""),
                }
                for r in results
            ]
    except Exception:
        return []


async def search_company_info(company_name: str) -> list[dict]:
    return await search_web(f"{company_name} company information overview")


async def search_company_leadership(company_name: str) -> list[dict]:
    return await search_web(f"{company_name} leadership team executives")


async def search_company_news(company_name: str) -> list[dict]:
    return await search_web(f"{company_name} recent news funding hiring 2024 2025 2026")


async def search_company_tech(company_name: str) -> list[dict]:
    return await search_web(f"{company_name} technology stack tools software")


async def find_company_domain(company_name: str) -> Optional[str]:
    """Attempt to discover a company's domain from search results."""
    results = await search_web(f"{company_name} official website", max_results=3)
    for r in results:
        url = r.get("url", "")
        if url:
            from urllib.parse import urlparse
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            for skip in ("wikipedia", "linkedin", "crunchbase", "facebook", "twitter", "youtube", "bloomberg"):
                if skip in domain:
                    break
            else:
                return domain
    return None
