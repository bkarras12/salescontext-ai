import json
import pathlib

from openai import OpenAI
from config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

PROMPT_PATH = pathlib.Path(__file__).parent.parent / "prompts" / "battle_card_prompt.txt"


def generate_battle_card(company_name: str, domain: str, raw_research: str) -> dict:
    """Generate a structured battle card from raw research data."""
    template = PROMPT_PATH.read_text()
    prompt = template.replace("{company_name}", company_name).replace(
        "{raw_research_bundle}", raw_research
    )

    response = client.chat.completions.create(
        model="gpt-4o",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )

    text = response.choices[0].message.content
    return json.loads(text.strip())
