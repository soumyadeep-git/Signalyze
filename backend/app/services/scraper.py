import httpx
from bs4 import BeautifulSoup
import json
import re


TECH_SIGNATURES = {
    "Google Analytics": ["google-analytics.com", "gtag/js", "ga.js", "analytics.js"],
    "Google Tag Manager": ["googletagmanager.com", "gtm.js"],
    "HubSpot": ["js.hs-scripts.com", "hubspot.com", "hs-analytics"],
    "Salesforce": ["force.com", "salesforce.com", "pardot.com"],
    "Marketo": ["marketo.com", "munchkin", "mktoForms"],
    "WordPress": ["wp-content", "wp-includes", "wordpress"],
    "Shopify": ["cdn.shopify.com", "shopify.com"],
    "React": ["react.production.min", "_reactRootContainer", "react-dom"],
    "Next.js": ["_next/static", "__NEXT_DATA__", "next/"],
    "Vue.js": ["vue.min.js", "vue.runtime", "__vue__"],
    "Angular": ["ng-version", "angular.min.js", "ng-app"],
    "jQuery": ["jquery.min.js", "jquery-"],
    "Bootstrap": ["bootstrap.min.css", "bootstrap.min.js"],
    "Tailwind CSS": ["tailwindcss", "tailwind.min.css"],
    "Intercom": ["intercom.io", "intercomSettings"],
    "Drift": ["drift.com", "driftt.com"],
    "Zendesk": ["zendesk.com", "zdassets.com"],
    "Segment": ["segment.com", "analytics.min.js", "cdn.segment.com"],
    "Mixpanel": ["mixpanel.com", "mixpanel.min.js"],
    "Hotjar": ["hotjar.com", "hj.js"],
    "Cloudflare": ["cloudflare.com", "cdnjs.cloudflare.com", "cf-ray"],
    "AWS": ["amazonaws.com", "aws-sdk"],
    "Stripe": ["stripe.com", "stripe.js"],
    "Mailchimp": ["mailchimp.com", "mc.js"],
    "Slack": ["slack.com"],
    "Zoom": ["zoom.us"],
    "Freshdesk": ["freshdesk.com"],
    "Calendly": ["calendly.com"],
}


async def scrape_website(url: str, timeout: int = 12) -> dict:
    """Scrape a website and extract metadata + technology signatures."""
    if not url.startswith("http"):
        url = f"https://{url}"

    result = {
        "url": url,
        "title": "",
        "meta_description": "",
        "detected_technologies": [],
        "raw_text": "",
        "success": False,
    }

    try:
        async with httpx.AsyncClient(
            timeout=timeout,
            follow_redirects=True,
            headers={"User-Agent": "Mozilla/5.0 (compatible; FelloBot/1.0)"},
        ) as client:
            resp = await client.get(url)
            html = resp.text
            result["success"] = True
    except Exception:
        return result

    soup = BeautifulSoup(html, "lxml")

    title_tag = soup.find("title")
    if title_tag:
        result["title"] = title_tag.get_text(strip=True)

    meta_desc = soup.find("meta", attrs={"name": "description"})
    if meta_desc:
        result["meta_description"] = meta_desc.get("content", "")

    html_lower = html.lower()
    detected = []
    for tech, signatures in TECH_SIGNATURES.items():
        for sig in signatures:
            if sig.lower() in html_lower:
                detected.append(tech)
                break
    result["detected_technologies"] = detected

    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()
    text = soup.get_text(separator=" ", strip=True)
    result["raw_text"] = text[:3000]

    return result
