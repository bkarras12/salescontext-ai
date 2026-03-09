import time

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models.schemas import ResearchRequest, ResearchResponse, BattleCard, OpeningLines
from agents.input_handler import normalize_input
from agents.research_orchestrator import research_company
from agents.battle_card_generator import generate_battle_card

app = FastAPI(title="SalesContext AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/research", response_model=ResearchResponse)
async def research(req: ResearchRequest):
    start = time.time()

    # Step 1: Normalize input
    try:
        normalized = normalize_input(
            company_name=req.company_name, domain=req.domain
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    company_name = normalized["company_name"]
    domain = normalized["domain"]

    # Step 2: Research
    raw_research = await research_company(company_name, domain)

    # Step 3: Generate battle card
    card_data = generate_battle_card(
        company_name=company_name or domain,
        domain=domain,
        raw_research=raw_research,
    )

    # Step 4: Build response
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
    )

    return ResearchResponse(
        company_name=company_name or domain,
        domain=domain,
        battle_card=battle_card,
        generation_time_seconds=round(time.time() - start, 1),
    )
