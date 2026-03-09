import os
import time

from fastapi import APIRouter, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models.schemas import (
    ResearchRequest, ResearchResponse, BattleCard, OpeningLines, ObjectionResponse,
    MeetingPrepRequest, MeetingPrepResponse, MeetingPrepBrief, AgendaItem,
    CompetitiveRequest, CompetitiveResponse, CompetitiveComparison, ComparisonRow,
)
from agents.input_handler import normalize_input
from agents.research_orchestrator import research_company
from agents.research_cache import store_research, get_research
from agents.battle_card_generator import generate_battle_card
from agents.meeting_prep_generator import generate_meeting_prep
from agents.competitive_generator import generate_competitive

app = FastAPI(title="SalesContext AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter()


async def _get_or_run_research(
    research_id: str | None, company_name: str | None, domain: str | None
) -> dict:
    """Return cached research or run fresh research. Returns cache entry dict."""
    if research_id:
        entry = get_research(research_id=research_id)
        if entry:
            return entry

    if domain or company_name:
        entry = get_research(domain=domain or company_name or "")
        if entry:
            return entry

    # No cache hit — run fresh research
    try:
        normalized = normalize_input(company_name=company_name, domain=domain)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    cn = normalized["company_name"]
    d = normalized["domain"]
    raw = await research_company(cn, d)
    rid = store_research(cn, d, raw)
    return get_research(research_id=rid)


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.post("/research", response_model=ResearchResponse)
async def research(req: ResearchRequest):
    start = time.time()

    entry = await _get_or_run_research(None, req.company_name, req.domain)
    company_name = entry["company_name"]
    domain = entry["domain"]

    card_data = generate_battle_card(
        company_name=company_name or domain,
        domain=domain,
        raw_research=entry["raw_research"],
    )

    objections = [
        ObjectionResponse(**o)
        for o in card_data.get("objection_handling", [])
    ]

    battle_card = BattleCard(
        company_overview=card_data.get("company_overview", ""),
        recent_news=card_data.get("recent_news", []),
        likely_pain_points=card_data.get("likely_pain_points", []),
        decision_maker_titles=card_data.get("decision_maker_titles", []),
        tech_stack_signals=card_data.get("tech_stack_signals", []),
        competitor_context=card_data.get("competitor_context", ""),
        opening_lines=OpeningLines(
            cold_email=card_data.get("opening_lines", {}).get("cold_email", []),
            cold_call=card_data.get("opening_lines", {}).get("cold_call", []),
        ),
        objection_handling=objections,
    )

    return ResearchResponse(
        research_id=entry["research_id"],
        company_name=company_name or domain,
        domain=domain,
        battle_card=battle_card,
        generation_time_seconds=round(time.time() - start, 1),
    )


@router.post("/meeting-prep", response_model=MeetingPrepResponse)
async def meeting_prep(req: MeetingPrepRequest):
    start = time.time()

    entry = await _get_or_run_research(req.research_id, req.company_name, req.domain)
    company_name = entry["company_name"]
    domain = entry["domain"]

    data = generate_meeting_prep(
        company_name=company_name or domain,
        domain=domain,
        raw_research=entry["raw_research"],
    )

    brief = MeetingPrepBrief(
        executive_summary=data.get("executive_summary", ""),
        meeting_agenda=[AgendaItem(**a) for a in data.get("meeting_agenda", [])],
        talking_points=data.get("talking_points", []),
        questions_to_ask=data.get("questions_to_ask", []),
        objection_responses=[ObjectionResponse(**o) for o in data.get("objection_responses", [])],
        competitive_landscape=data.get("competitive_landscape", ""),
    )

    return MeetingPrepResponse(
        research_id=entry["research_id"],
        company_name=company_name or domain,
        domain=domain,
        meeting_prep=brief,
        generation_time_seconds=round(time.time() - start, 1),
    )


@router.post("/competitive", response_model=CompetitiveResponse)
async def competitive(req: CompetitiveRequest):
    start = time.time()

    entry = await _get_or_run_research(req.research_id, req.company_name, req.domain)
    company_name = entry["company_name"]
    domain = entry["domain"]

    data = generate_competitive(
        company_name=company_name or domain,
        domain=domain,
        raw_research=entry["raw_research"],
        your_product=req.your_product,
    )

    comp = CompetitiveComparison(
        prospect_current_stack=data.get("prospect_current_stack", []),
        comparison_table=[ComparisonRow(**r) for r in data.get("comparison_table", [])],
        key_differentiators=data.get("key_differentiators", []),
        landmine_questions=data.get("landmine_questions", []),
    )

    return CompetitiveResponse(
        research_id=entry["research_id"],
        company_name=company_name or domain,
        domain=domain,
        competitive=comp,
        generation_time_seconds=round(time.time() - start, 1),
    )


# On Vercel, requests arrive at /api/...; locally, at /...
prefix = "/api" if os.environ.get("VERCEL") else ""
app.include_router(router, prefix=prefix)
