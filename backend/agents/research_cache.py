import time
import uuid

_cache: dict[str, dict] = {}
TTL_SECONDS = 3600  # 1 hour


def store_research(company_name: str, domain: str, raw_research: str) -> str:
    """Store research result and return a research_id."""
    research_id = str(uuid.uuid4())
    key = domain.lower() or company_name.lower()
    entry = {
        "research_id": research_id,
        "company_name": company_name,
        "domain": domain,
        "raw_research": raw_research,
        "created_at": time.time(),
    }
    _cache[research_id] = entry
    _cache[f"domain:{key}"] = entry
    return research_id


def get_research(research_id: str = "", domain: str = "") -> dict | None:
    """Retrieve cached research by research_id or domain. Returns None if expired/missing."""
    entry = None
    if research_id:
        entry = _cache.get(research_id)
    if not entry and domain:
        entry = _cache.get(f"domain:{domain.lower()}")
    if entry and (time.time() - entry["created_at"]) > TTL_SECONDS:
        return None
    return entry
