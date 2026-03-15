import httpx
from typing import Optional


async def lookup_ip(ip: str, timeout: int = 10) -> dict:
    """Reverse-lookup an IP via ip-api.com (free, no key required)."""
    clean_ip = ip.strip().replace("xxx", "0")
    url = f"http://ip-api.com/json/{clean_ip}?fields=status,message,country,regionName,city,isp,org,as,query"

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.get(url)
            data = resp.json()
            if data.get("status") == "success":
                return {
                    "ip": data.get("query", clean_ip),
                    "country": data.get("country", ""),
                    "region": data.get("regionName", ""),
                    "city": data.get("city", ""),
                    "isp": data.get("isp", ""),
                    "org": data.get("org", ""),
                    "as_info": data.get("as", ""),
                }
    except Exception:
        pass

    return {
        "ip": clean_ip,
        "country": "",
        "region": "",
        "city": "",
        "isp": "",
        "org": "",
        "as_info": "",
    }


def extract_company_hint(ip_data: dict) -> Optional[str]:
    """Try to pull a company name from IP org/ISP fields."""
    org = ip_data.get("org", "")
    if org and org.lower() not in ("", "unknown"):
        for noise in ("Inc", "LLC", "Corp", "Ltd", "Co.", "Technologies", "Hosting"):
            org = org.replace(noise, "").strip().rstrip(",").strip()
        if len(org) > 2:
            return org
    return None
