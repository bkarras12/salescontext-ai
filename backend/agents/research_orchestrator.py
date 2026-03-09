import anthropic
from config import ANTHROPIC_API_KEY

client = anthropic.AsyncAnthropic(api_key=ANTHROPIC_API_KEY)


async def research_company(company_name: str, domain: str) -> str:
    """Use Claude with web search to gather raw research about a company."""
    query_parts = []
    if company_name:
        query_parts.append(company_name)
    if domain:
        query_parts.append(domain)
    query = " ".join(query_parts)

    prompt = f"""Research the company "{query}" thoroughly. Find and report:

1. Company overview: what they do, size, industry, founding year
2. Recent news from the last 90 days
3. Key products or services
4. Technology stack they likely use
5. Funding history and current stage
6. Key competitors
7. Leadership team and decision-maker titles

Return ALL findings as a detailed research report. Include specific facts, numbers, and names. If you cannot find information for a category, say so explicitly."""

    response = await client.messages.create(
        model="claude-sonnet-4-5-20250514",
        max_tokens=4096,
        tools=[{"type": "web_search_20250305"}],
        messages=[{"role": "user", "content": prompt}],
    )

    # Extract all text blocks from the response
    text_parts = []
    for block in response.content:
        if hasattr(block, "text"):
            text_parts.append(block.text)
    return "\n".join(text_parts)
