import json
import pathlib

from openai import OpenAI
from config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

PROMPT_PATH = pathlib.Path(__file__).parent.parent / "prompts" / "battle_card_prompt.txt"


def generate_battle_card(company_name: str, domain: str, raw_research: str, your_product: str | None = None, your_location: str | None = None) -> dict:
    """Generate a structured battle card from raw research data."""
    template = PROMPT_PATH.read_text()

    personalization = ""
    if your_product:
        personalization += f'\nThe seller represents: "{your_product}". Tailor the battle card to highlight how their offering connects to this prospect\'s pain points. Opening lines, objection handling, and the value proposition should all be framed from the perspective of selling {your_product}.'
    if your_location:
        personalization += f'\nThe seller is based in: "{your_location}". Factor in geographic relevance — consider local competitors, regional market dynamics, proximity advantages, and any location-specific context that would help the SDR.'

    prompt = template.replace("{company_name}", company_name).replace(
        "{raw_research_bundle}", raw_research
    ).replace("{personalization}", personalization)

    response = client.chat.completions.create(
        model="gpt-4o",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )

    text = response.choices[0].message.content
    return json.loads(text.strip())
