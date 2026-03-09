from pydantic import BaseModel


class ResearchRequest(BaseModel):
    company_name: str | None = None
    domain: str | None = None


class OpeningLines(BaseModel):
    cold_email: list[str] = []
    cold_call: list[str] = []


class BattleCard(BaseModel):
    company_overview: str = ""
    recent_news: list[str] = []
    likely_pain_points: list[str] = []
    decision_maker_titles: list[str] = []
    tech_stack_signals: list[str] = []
    competitor_context: str = ""
    opening_lines: OpeningLines = OpeningLines()


class ResearchResponse(BaseModel):
    company_name: str
    domain: str
    battle_card: BattleCard
    generation_time_seconds: float
