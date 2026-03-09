from urllib.parse import urlparse


def normalize_input(
    company_name: str | None = None,
    domain: str | None = None,
) -> dict:
    if not company_name and not domain:
        raise ValueError("Provide a company_name or domain")

    clean_domain = ""
    if domain:
        d = domain.strip().lower()
        if "://" in d:
            d = urlparse(d).netloc or d
        d = d.removeprefix("www.")
        d = d.rstrip("/")
        clean_domain = d

    return {
        "company_name": (company_name or "").strip(),
        "domain": clean_domain,
    }
