from langchain_groq import ChatGroq
from app.config import get_settings
from app.utils import extract_json

PAGE_WEIGHTS = {
    "pricing": 3.0,
    "price": 3.0,
    "plans": 2.5,
    "demo": 2.5,
    "request-demo": 2.5,
    "contact": 2.0,
    "case-study": 2.0,
    "case-studies": 2.0,
    "testimonials": 2.0,
    "customers": 1.8,
    "product": 1.5,
    "features": 1.5,
    "solutions": 1.5,
    "integrations": 1.5,
    "ai-sales-agent": 1.5,
    "enterprise": 1.5,
    "docs": 1.0,
    "documentation": 1.0,
    "api": 1.0,
    "about": 0.5,
    "blog": 0.5,
    "careers": 0.2,
}


def _parse_time(time_str: str) -> float:
    """Parse time string like '3m 42s' into seconds."""
    import re
    total = 0.0
    for match in re.finditer(r"(\d+(?:\.\d+)?)\s*(m|s|h)", time_str.lower()):
        val, unit = float(match.group(1)), match.group(2)
        if unit == "h":
            total += val * 3600
        elif unit == "m":
            total += val * 60
        else:
            total += val
    return total


def compute_base_intent(pages: list[str], visits_this_week: int, time_on_site: str) -> tuple[float, list[str]]:
    """Compute a weighted intent score from behavioral signals."""
    score = 0.0
    signals = []

    for page in pages:
        page_clean = page.strip("/").lower().split("/")[-1] if page else ""
        for key, weight in PAGE_WEIGHTS.items():
            if key in page_clean:
                score += weight
                signals.append(f"Visited /{page_clean} (+{weight})")
                break

    if visits_this_week > 2:
        bonus = min((visits_this_week - 2) * 0.5, 2.0)
        score += bonus
        signals.append(f"Repeat visitor ({visits_this_week} visits this week, +{bonus:.1f})")

    seconds = _parse_time(time_on_site)
    if seconds > 180:
        score += 1.0
        signals.append(f"High dwell time ({time_on_site}, +1.0)")
    elif seconds > 60:
        score += 0.5
        signals.append(f"Moderate dwell time ({time_on_site}, +0.5)")

    normalized = min(score / 1.2, 10.0)
    return round(normalized, 1), signals


async def analyze_intent(state: dict) -> dict:
    """Score buyer intent from visitor behavior."""
    raw = state.get("raw_input", {})
    input_type = state.get("input_type", "company")

    if input_type == "company":
        return {
            "intent": {
                "score": 0.0,
                "stage": "Unknown",
                "reasoning": "No visitor behavior data available for company-only input.",
                "signals": [],
            },
        }

    visitor = raw.get("visitor", {})
    pages = visitor.get("pages_visited", [])
    visits = visitor.get("visits_this_week", 1)
    time_on_site = visitor.get("time_on_site", "0s")

    base_score, signals = compute_base_intent(pages, visits, time_on_site)

    settings = get_settings()
    llm = ChatGroq(api_key=settings.groq_api_key, model=settings.groq_model, temperature=0)

    prompt = f"""A website visitor showed these behaviors:
- Pages visited: {', '.join(pages)}
- Time on site: {time_on_site}
- Visits this week: {visits}
- Referral source: {visitor.get('referral_source', 'N/A')}

Base intent score (algorithmic): {base_score}/10
Signals detected: {', '.join(signals)}

Analyze the buying intent. Return ONLY valid JSON:
{{
  "score": <float 0-10, adjust the base score using your reasoning>,
  "stage": "Awareness|Interest|Consideration|Evaluation|Decision",
  "reasoning": "1-2 sentence explanation"
}}"""

    resp = await llm.ainvoke(prompt)
    result = extract_json(resp.content)
    if result and isinstance(result, dict):
        result["signals"] = signals
    else:
        result = {
            "score": base_score,
            "stage": "Evaluation" if base_score >= 6 else "Interest" if base_score >= 3 else "Awareness",
            "reasoning": "Based on page visit patterns and engagement metrics.",
            "signals": signals,
        }

    result["score"] = round(min(max(float(result.get("score", base_score)), 0), 10), 1)

    return {"intent": result}
