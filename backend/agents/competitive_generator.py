import json
import pathlib

from openai import OpenAI
from config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

PROMPT_PATH = pathlib.Path(__file__).parent.parent / "prompts" / "competitive_prompt.txt"


def generate_competitive(company_name: str, domain: str, raw_research: str, your_product: str, your_location: str | None = None) -> dict:
    """Generate a competitive comparison from raw research data."""
    template = PROMPT_PATH.read_text()

    personalization = ""
    if your_location:
        personalization += f'\nThe seller is based in: "{your_location}". Factor in geographic competitive advantages, local market presence, and regional context when comparing solutions.'

    prompt = (
        template.replace("{company_name}", company_name)
        .replace("{raw_research_bundle}", raw_research)
        .replace("{your_product}", your_product)
        .replace("{personalization}", personalization)
    )

    response = client.chat.completions.create(
        model="gpt-4o",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )

    text = response.choices[0].message.content
    return json.loads(text.strip())
