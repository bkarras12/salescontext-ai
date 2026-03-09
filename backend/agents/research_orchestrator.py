from openai import AsyncOpenAI
from config import OPENAI_API_KEY

client = AsyncOpenAI(api_key=OPENAI_API_KEY)


async def research_company(company_name: str, domain: str) -> str:
    """Use OpenAI with web search to gather raw research about a company."""
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

    response = await client.responses.create(
        model="gpt-4o-mini",
        tools=[{"type": "web_search_preview"}],
        input=prompt,
    )

    # Extract text from output items
    text_parts = []
    for item in response.output:
        if item.type == "message":
            for content in item.content:
                if content.type == "output_text":
                    text_parts.append(content.text)
    return "\n".join(text_parts)
