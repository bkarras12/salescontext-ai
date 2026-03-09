import json
import os
import pathlib
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


def test_generate_battle_card_structure():
    """Test that generator returns valid battle card JSON structure."""
    if not os.getenv("ANTHROPIC_API_KEY"):
        pytest.skip("ANTHROPIC_API_KEY not set")

    from agents.battle_card_generator import generate_battle_card

    mock_path = pathlib.Path(__file__).parent / "mock_research_bundle.json"
    mock_data = json.loads(mock_path.read_text())

    result = generate_battle_card(
        company_name=mock_data["company_name"],
        domain=mock_data["domain"],
        raw_research=mock_data["raw_research"],
    )

    assert "company_overview" in result
    assert "likely_pain_points" in result
    assert "opening_lines" in result
    assert isinstance(result["likely_pain_points"], list)
    assert isinstance(result["opening_lines"], dict)
