# Project Proposal
## SalesContext AI — AI-Powered Prospect Research and Battle Card Generator for SDR Teams

---

## 1. Problem Statement

Sales development representatives spend 30–60 minutes researching each prospect before a cold call or email sequence. The research is repetitive, inconsistently executed, and rarely results in a structured output that the rep can actually use during a conversation.

**Common Issues:**

- Reps manually comb LinkedIn, company websites, news articles, and CRMs before each outreach
- Research quality varies by rep experience and available time
- No standardized output format — insights live in browser tabs, not usable briefs
- Junior SDRs skip research entirely and send generic outreach, tanking reply rates
- Research done for one rep is never reused — duplicated effort across the team

**Business Impact:**

- 5–10 hours per rep per week lost to manual prospect research
- Lower reply rates from generic, un-personalized outreach
- New SDR ramp time extended by weeks due to lack of research tooling
- Opportunities missed because reps aren't prepared for objections specific to a prospect's company

**Market Signal:**

- Average SDR sends 50–100 outreach sequences per month
- At 30 minutes of research per prospect, that is 25–50 hours/month of research per rep
- At a $25/hr fully loaded cost, that is $625–$1,250 per rep per month spent on research alone

---

## 2. Solution Statement

SalesContext AI is a web application that accepts a company name or domain and returns a structured, ready-to-use SDR battle card in under 60 seconds.

**Capabilities:**

- Generates a company overview: industry, size, funding stage, key products, recent news
- Identifies likely pain points based on industry, growth signals, and tech stack
- Surfaces decision maker titles and relevant LinkedIn signals
- Produces 3–5 personalized opening line options for cold email or cold call
- Flags competitor context: what the prospect likely uses today, and what angles to use
- Outputs a clean, printable brief the rep can reference during the call

**Result:**

- Research time per prospect drops from 30–60 minutes to under 2 minutes
- Every rep — regardless of experience level — works from the same quality brief
- Outreach personalization improves without adding time to the rep's workflow
- Portfolio-quality product demonstrating Claude API integration, agentic research, and clean UX

---

## 3. System Design

**Scenario:** A 10-person SDR team at a B2B SaaS company. Each rep researches 50 prospects per month. Current process: 30 minutes per prospect, manual and inconsistent. Target: under 2 minutes per prospect, structured output.

---

### Agent 1 — Input Handler

**Trigger:** User submits a company name or domain via the web UI

**Tasks:**
- Normalize input (strip www., lowercase, resolve domain from company name if needed)
- Validate that input is a real company domain (basic DNS check)
- Generate a structured research request object

**Output:** Structured query `{ company_name, domain, timestamp }` passed to the Research Orchestrator

---

### Agent 2 — Research Orchestrator (Claude API)

**Trigger:** Structured query from Agent 1

**Tasks:**
- Issues a web search for the company using the Anthropic web search tool or SerpAPI
- Scrapes or summarizes the company homepage, About page, and LinkedIn overview
- Searches for recent news (last 90 days) via news search API
- Retrieves tech stack signals via BuiltWith API (free tier) or Wappalyzer
- Pulls funding/stage data from Crunchbase API or fallback to web search

**Output:** Raw research bundle (company facts, recent news, tech signals, funding data)

---

### Agent 3 — Battle Card Generator (Claude API)

**Trigger:** Raw research bundle from Agent 2

**Tasks:**
- Synthesizes raw data into structured battle card sections
- Infers likely pain points based on company stage, industry, and tech stack
- Generates 3–5 personalized opening lines (cold email and cold call variants)
- Identifies decision maker titles common to this company size and industry
- Flags which competitors the company likely uses based on tech signals and industry

**LLM Prompt Template:**

```
You are an expert sales researcher helping an SDR prepare for outreach.

Given the following research data about {company_name}, produce a structured battle card.

Research Data:
{raw_research_bundle}

Output the battle card in this exact JSON format:
{
  "company_overview": "2-3 sentence summary of what the company does, its size, and stage",
  "recent_news": ["item 1", "item 2", "item 3"],
  "likely_pain_points": ["pain 1", "pain 2", "pain 3"],
  "decision_maker_titles": ["title 1", "title 2", "title 3"],
  "tech_stack_signals": ["tool 1", "tool 2"],
  "competitor_context": "1-2 sentence note on what they likely use today and the angle to take",
  "opening_lines": {
    "cold_email": ["line 1", "line 2", "line 3"],
    "cold_call": ["line 1", "line 2"]
  }
}

Rules:
- Be specific. Use the company name, their actual product, their actual news.
- Do not use filler phrases like "cutting-edge" or "innovative."
- Opening lines must reference something real about the company — not generic templates.
- If data is missing for a field, return an empty array or "Insufficient data."
```

**Output:** Structured battle card JSON

---

### Agent 4 — Renderer

**Trigger:** Battle card JSON from Agent 3

**Tasks:**
- Renders JSON into a clean React component (tabbed sections, readable layout)
- Provides a "Copy to Clipboard" button for the full brief
- Provides a "Download as PDF" option
- Stores the battle card in local history for the session (last 10 searches)

**Output:** Rendered battle card displayed in the web UI

---

### Pricing Tier Model

| Tier | Price | Battle Cards/Month | Features |
|------|-------|-------------------|----------|
| Free | $0 | 5 | Basic overview, 2 opening lines |
| Pro | $29/mo | 100 | Full battle card, PDF export, history |
| Team | $99/mo | Unlimited (up to 5 seats) | All Pro features + team dashboard |

---

## 4. KPI Targets

| Metric | Baseline | Target | Timeframe |
|--------|----------|--------|-----------|
| Research time per prospect | 30–60 min | Under 2 min | Day 1 of use |
| Battle card generation time | N/A | Under 60 seconds | MVP launch |
| Free-to-Pro conversion rate | N/A | 8–12% | 90 days post-launch |
| Monthly active users | 0 | 200 | 90 days post-launch |
| Monthly recurring revenue | $0 | $1,500–$3,000 | 6 months post-launch |

---

## 5. ROI and Business Case

**For End Users (SDR Teams):**

Assumptions: 1 rep, 50 prospects/month, 30 min research each, $25/hr fully loaded cost

- Current monthly research cost: 50 x 0.5 hrs x $25 = **$625/month per rep**
- With SalesContext AI Pro ($29/mo): research time drops to 2 min/prospect = 1.7 hrs/month
- Monthly research cost with tool: 1.7 hrs x $25 = $42.50 + $29 tool cost = **$71.50/month**
- **Monthly savings per rep: $553 | ROI: 19x on tool cost**

**For Brady (Revenue Potential):**

Assumptions: 200 MAU, 10% Pro conversion, average $29/mo

- Monthly recurring revenue at 200 MAU: 20 paying users x $29 = **$580/mo**
- At 500 MAU with 10% conversion: **$1,450/mo**
- Path to $3,000/mo MRR: ~100 paying users at blended $29–$99 ARPU

**Additional upside:** Affiliate partnerships with Apollo.io, Outreach, or Salesloft; API access tier for CRM integrations.

---

## 6. Technical Implementation Guide

### Recommended Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Frontend | React + Tailwind CSS | Fast UI development, clean component structure |
| Backend | Python + FastAPI | Async support for parallel agent calls, Brady's preferred stack |
| LLM | Anthropic Claude API (claude-sonnet-4-5) | Native web search tool use, strong synthesis |
| Search | SerpAPI or Anthropic built-in web search | Real-time company data retrieval |
| Tech Stack Data | BuiltWith API (free tier) | Tech signal retrieval without scraping |
| Funding Data | Crunchbase API or web search fallback | Stage and funding signals |
| Database | SQLite (dev) → PostgreSQL (prod) | Battle card history, user accounts |
| Auth | Clerk or Supabase Auth | Fast implementation, free tier |
| Payments | Stripe | Subscription billing, usage metering |
| Hosting | Railway or Render | Low-cost, simple deploys |
| PDF Export | WeasyPrint (Python) or jsPDF (frontend) | Battle card PDF download |

---

### System Architecture

```
User Input (React UI)
       |
       v
FastAPI /research endpoint
       |
       v
Agent 1: Input Handler
  - Normalize domain
  - Validate input
       |
       v
Agent 2: Research Orchestrator
  - Web search (SerpAPI / Claude web search)
  - BuiltWith API call
  - Crunchbase/news search
  - Returns: raw_research_bundle
       |
       v
Agent 3: Battle Card Generator (Claude API)
  - Structured prompt with raw data
  - Returns: battle_card JSON
       |
       v
Agent 4: Renderer
  - FastAPI returns JSON to React
  - React renders tabbed battle card UI
  - Copy / PDF export / session history
```

---

### File and Folder Structure

```
salescontext-ai/
├── backend/
│   ├── main.py                    # FastAPI app, route definitions
│   ├── agents/
│   │   ├── input_handler.py       # Domain normalization and validation
│   │   ├── research_orchestrator.py  # Web search, BuiltWith, Crunchbase
│   │   ├── battle_card_generator.py  # Claude API call, prompt construction
│   │   └── renderer_helper.py    # JSON post-processing before response
│   ├── prompts/
│   │   └── battle_card_prompt.txt # LLM prompt template (externalized)
│   ├── models/
│   │   └── schemas.py             # Pydantic models for request/response
│   ├── db/
│   │   ├── database.py            # SQLAlchemy setup
│   │   └── models.py              # BattleCard, User, SearchHistory tables
│   └── config.py                  # Environment variable loading
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── SearchBar.jsx      # Company name / domain input
│   │   │   ├── BattleCard.jsx     # Main card renderer (tabbed)
│   │   │   ├── LoadingState.jsx   # Animated loading while agents run
│   │   │   ├── HistoryPanel.jsx   # Last 10 searches
│   │   │   └── ExportButton.jsx   # Copy + PDF download
│   │   └── api/
│   │       └── research.js        # Axios calls to FastAPI backend
│   └── tailwind.config.js
├── tests/
│   ├── test_input_handler.py
│   ├── test_battle_card_generator.py
│   └── mock_research_bundle.json  # Fixture for LLM testing without API calls
├── .env.example
├── requirements.txt
├── README.md
└── SPEC.md                        # This document
```

---

### Data Models

**battle_cards table:**
```
id               UUID, primary key
user_id          UUID, foreign key (nullable for anonymous free tier)
company_name     VARCHAR(255)
domain           VARCHAR(255)
raw_research     JSON
battle_card      JSON
created_at       TIMESTAMP
```

**users table:**
```
id               UUID, primary key
email            VARCHAR(255), unique
stripe_customer_id  VARCHAR(255)
plan             ENUM('free', 'pro', 'team')
cards_used_this_month  INTEGER
created_at       TIMESTAMP
```

---

### Key APIs and Environment Variables

```
ANTHROPIC_API_KEY        # Claude API — battle card generation and web search
SERPAPI_KEY              # Web search fallback if not using Claude web search tool
BUILTWITH_API_KEY        # Tech stack signals (free tier: 1 lookup/day, upgrade for prod)
CRUNCHBASE_API_KEY       # Funding and stage data (optional — web search can substitute)
STRIPE_SECRET_KEY        # Payment processing
STRIPE_WEBHOOK_SECRET    # Webhook signature verification
DATABASE_URL             # PostgreSQL connection string (prod)
CLERK_SECRET_KEY         # Auth (if using Clerk)
```

---

### Phased Build Plan

**Phase 1 — MVP (Week 1)**

Goal: End-to-end battle card generation with no auth, no payments, no database.

Tasks:
- FastAPI backend with `/research` POST endpoint
- Input handler: normalize domain, validate
- Research orchestrator: Claude API with built-in web search tool (no SerpAPI needed for MVP)
- Battle card generator: Claude API call with prompt template
- React frontend: search bar, loading state, rendered battle card (single page, no tabs)
- Manual test with 10 real companies — validate output quality

Validation: Battle card for each test company contains accurate company overview, at least 2 relevant pain points, and at least 1 specific opening line. Reject and re-prompt if generic.

**Phase 2 — Core Product (Week 2)**

Goal: Shippable product with free tier, session history, and PDF export.

Tasks:
- Tabbed battle card UI (Overview / Pain Points / Opening Lines / Competitor Context)
- Session-based history (localStorage, last 10 searches, no auth required)
- PDF export via jsPDF or backend WeasyPrint endpoint
- Rate limiting on free tier (5 searches per day by IP)
- BuiltWith API integration for tech stack signals
- Error handling: graceful fallback if any agent step fails
- Deploy backend to Railway, frontend to Vercel

Validation: End-to-end test from domain input to PDF download. Measure average generation time — target under 60 seconds.

**Phase 3 — Monetization and Polish (Week 3–4)**

Goal: Paid tier live, user accounts, shareable battle cards.

Tasks:
- Clerk auth integration (sign up, sign in, session management)
- Stripe integration: Pro and Team plan checkout, webhook for plan updates
- PostgreSQL migration, battle card history stored per user
- Shareable battle card links (unique URL per card, publicly accessible)
- Team dashboard (Team plan): see all searches by team members
- SEO landing page with example battle cards for common industries
- Crunchbase API integration for funding stage

Validation: Full Stripe checkout flow tested end-to-end. 5 test users complete signup → search → payment → history retrieval flow. Check Stripe dashboard for correct plan assignment.

---

### Testing Strategy

| Phase | What to Test | How |
|-------|-------------|-----|
| Phase 1 | LLM output quality | Manual review of 10 test companies against expected output |
| Phase 1 | API endpoint | Pytest with mock research bundle (no API calls) |
| Phase 2 | End-to-end flow | Manual: domain input → battle card → PDF download |
| Phase 2 | Rate limiting | Simulate 6 requests from same IP, confirm 6th is rejected |
| Phase 3 | Payment flow | Stripe test mode — confirm plan upgrade, webhook handling |
| Phase 3 | Auth | Clerk test users — confirm session persistence and plan gating |

---

## Handoff Note

This proposal is structured to be handed directly to Claude Code. Open Claude Code, paste or upload this document, and say: "Build this system based on the proposal." The Technical Implementation Guide in Section 6 contains everything it needs to start — stack, architecture, file structure, data models, phased plan, and LLM prompts.

To optimize the handoff further, the following can be generated on request:
- A standalone `SPEC.md` or `BUILD_INSTRUCTIONS.md` extracted from Section 6
- A numbered task list Claude Code can execute sequentially, phase by phase
- A starter `README.md` Claude Code can scaffold the project from
