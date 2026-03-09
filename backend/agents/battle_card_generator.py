import json
import pathlib

import anthropic
from config import ANTHROPIC_API_KEY

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

PROMPT_PATH = pathlib.Path(__file__).parent.parent / "prompts" / "battle_card_prompt.txt"


def generate_battle_card(company_name: str, domain: str, raw_research: str) -> dict:
    """Generate a structured battle card from raw research data."""
    template = PROMPT_PATH.read_text()
    prompt = template.replace("{company_name}", company_name).replace(
        "{raw_research_bundle}", raw_research
    )

    response = client.messages.create(
        model="claude-sonnet-4-5-20250514",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    )

    text = response.content[0].text

    # Extract JSON from response (handle markdown code blocks)
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0]
    elif "```" in text:
        text = text.split("```")[1].split("```")[0]

    return json.loads(text.strip())
