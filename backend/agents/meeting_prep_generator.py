import json
import pathlib

from openai import OpenAI
from config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

PROMPT_PATH = pathlib.Path(__file__).parent.parent / "prompts" / "meeting_prep_prompt.txt"


def generate_meeting_prep(company_name: str, domain: str, raw_research: str, your_product: str | None = None, your_location: str | None = None) -> dict:
    """Generate a meeting prep brief from raw research data."""
    template = PROMPT_PATH.read_text()

    personalization = ""
    if your_product:
        personalization += f'\nThe seller represents: "{your_product}". Tailor talking points, questions, and objection responses to focus on how {your_product} addresses this prospect\'s specific challenges.'
    if your_location:
        personalization += f'\nThe seller is based in: "{your_location}". Incorporate geographic context into rapport builders and talking points where relevant.'

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
