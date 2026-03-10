from pydantic import BaseModel


class ResearchRequest(BaseModel):
    company_name: str | None = None
    domain: str | None = None


class MeetingPrepRequest(BaseModel):
    research_id: str | None = None
    company_name: str | None = None
    domain: str | None = None


class CompetitiveRequest(BaseModel):
    research_id: str | None = None
    company_name: str | None = None
    domain: str | None = None
    your_product: str


class OpeningLines(BaseModel):
    cold_email: list[str] = []
    cold_call: list[str] = []
    linkedin: list[str] = []


class ObjectionResponse(BaseModel):
    objection: str
    response: str


class BattleCard(BaseModel):
    company_overview: str = ""
    recent_news: list[str] = []
    industry_trends: list[str] = []
    likely_pain_points: list[str] = []
    decision_maker_titles: list[str] = []
    buying_signals: list[str] = []
    tech_stack_signals: list[str] = []
    competitor_context: str = ""
    opening_lines: OpeningLines = OpeningLines()
    objection_handling: list[ObjectionResponse] = []
    value_proposition: str = ""
    recommended_next_steps: list[str] = []


class ResearchResponse(BaseModel):
    research_id: str
    company_name: str
    domain: str
    battle_card: BattleCard
    generation_time_seconds: float


class AgendaItem(BaseModel):
    item: str
    minutes: int


class MeetingPrepBrief(BaseModel):
    executive_summary: str = ""
    company_background: str = ""
    meeting_agenda: list[AgendaItem] = []
    talking_points: list[str] = []
    questions_to_ask: list[str] = []
    rapport_builders: list[str] = []
    objection_responses: list[ObjectionResponse] = []
    competitive_landscape: str = ""
    success_metrics: list[str] = []


class MeetingPrepResponse(BaseModel):
    research_id: str
    company_name: str
    domain: str
    meeting_prep: MeetingPrepBrief
    generation_time_seconds: float


class ComparisonRow(BaseModel):
    category: str
    their_solution: str
    your_advantage: str


class CompetitiveComparison(BaseModel):
    prospect_current_stack: list[str] = []
    stack_analysis: str = ""
    comparison_table: list[ComparisonRow] = []
    key_differentiators: list[str] = []
    competitive_weaknesses: list[str] = []
    landmine_questions: list[str] = []
    win_themes: list[str] = []
    switching_cost_mitigators: list[str] = []


class CompetitiveResponse(BaseModel):
    research_id: str
    company_name: str
    domain: str
    competitive: CompetitiveComparison
    generation_time_seconds: float
