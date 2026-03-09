# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SalesContext AI is a web app that generates structured SDR battle cards from a company name or domain. It uses an agentic pipeline: Input Handler → Research Orchestrator → Battle Card Generator → Renderer. Full specification is in `PROPOSAL.md`.

## Tech Stack

- **Frontend:** React + Tailwind CSS (hosted on Vercel)
- **Backend:** Python + FastAPI (hosted on Railway/Render)
- **LLM:** Anthropic Claude API (claude-sonnet-4-5) with built-in web search tool
- **Database:** SQLite (dev) → PostgreSQL (prod)
- **Auth:** Clerk | **Payments:** Stripe | **PDF:** WeasyPrint or jsPDF

## Planned Commands

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload              # dev server on :8000
pytest tests/ -v                       # run tests

# Frontend
cd frontend
npm install
npm run dev                            # dev server on :3000
npm run build                          # production build
```

## Architecture

Four-agent pipeline, all orchestrated by a single FastAPI `/research` POST endpoint:

1. **Input Handler** (`backend/agents/input_handler.py`) — normalizes domain, validates input
2. **Research Orchestrator** (`backend/agents/research_orchestrator.py`) — Claude web search, BuiltWith API, Crunchbase/news
3. **Battle Card Generator** (`backend/agents/battle_card_generator.py`) — Claude API call with prompt from `backend/prompts/battle_card_prompt.txt`
4. **Renderer** — FastAPI returns JSON; React renders tabbed UI with copy/PDF export

## Key Design Decisions

- MVP (Phase 1) has no auth, no payments, no database — just end-to-end generation
- LLM prompt is externalized in `backend/prompts/battle_card_prompt.txt` — output quality depends heavily on this file
- Battle card output is a fixed JSON schema (see PROPOSAL.md Section 3, Agent 3)
- Rate limiting: IP-based before auth (Phase 2), user-based after auth (Phase 3)
- If any agent step fails, return partial battle card with available data

## Environment Variables

```
ANTHROPIC_API_KEY       # Required for all phases
BUILTWITH_API_KEY       # Tech stack signals
SERPAPI_KEY             # Optional — Claude web search used by default
DATABASE_URL            # Phase 2+ (PostgreSQL)
STRIPE_SECRET_KEY       # Phase 3
STRIPE_WEBHOOK_SECRET   # Phase 3
CLERK_SECRET_KEY        # Phase 3
```

## Development Phases

- **Phase 1 (MVP):** End-to-end battle card generation, no persistence
- **Phase 2 (Core):** Tabbed UI, localStorage history, PDF export, rate limiting, deploy
- **Phase 3 (Monetize):** Clerk auth, Stripe billing, PostgreSQL, shareable card links, team dashboard
