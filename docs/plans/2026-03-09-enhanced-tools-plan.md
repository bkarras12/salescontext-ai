# Enhanced Tools Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand SalesContext AI from a single battle card tool to a three-tool platform (battle card + meeting prep + competitive comparison) with research caching, PDF export, and copy-to-clipboard.

**Architecture:** Add in-memory research cache so the expensive research step runs once. Add two new generator agents (meeting prep, competitive comparison) that consume cached research. Frontend gets tool selector tabs and export buttons.

**Tech Stack:** Python/FastAPI (backend), OpenAI API (generation), React/Tailwind (frontend)

---

### Task 1: Research Cache

**Files:**
- Create: `backend/agents/research_cache.py`

**Step 1: Create cache module**

```python
import time
import uuid

_cache: dict[str, dict] = {}
TTL_SECONDS = 3600  # 1 hour


def store_research(company_name: str, domain: str, raw_research: str) -> str:
    """Store research result and return a research_id."""
    research_id = str(uuid.uuid4())
    key = domain.lower() or company_name.lower()
    entry = {
        "research_id": research_id,
        "company_name": company_name,
        "domain": domain,
        "raw_research": raw_research,
        "created_at": time.time(),
    }
    _cache[research_id] = entry
    _cache[f"domain:{key}"] = entry
    return research_id


def get_research(research_id: str = "", domain: str = "") -> dict | None:
    """Retrieve cached research by research_id or domain. Returns None if expired/missing."""
    entry = None
    if research_id:
        entry = _cache.get(research_id)
    if not entry and domain:
        entry = _cache.get(f"domain:{domain.lower()}")
    if entry and (time.time() - entry["created_at"]) > TTL_SECONDS:
        return None
    return entry
```

**Step 2: Commit**

```bash
git add backend/agents/research_cache.py
git commit -m "feat: add in-memory research cache with 1hr TTL"
```

---

### Task 2: Update Schemas — Add Objection Handling, Meeting Prep, Competitive Comparison

**Files:**
- Modify: `backend/models/schemas.py`

**Step 1: Update schemas**

Replace the full file with:

```python
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


class ObjectionResponse(BaseModel):
    objection: str
    response: str


class BattleCard(BaseModel):
    company_overview: str = ""
    recent_news: list[str] = []
    likely_pain_points: list[str] = []
    decision_maker_titles: list[str] = []
    tech_stack_signals: list[str] = []
    competitor_context: str = ""
    opening_lines: OpeningLines = OpeningLines()
    objection_handling: list[ObjectionResponse] = []


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
    meeting_agenda: list[AgendaItem] = []
    talking_points: list[str] = []
    questions_to_ask: list[str] = []
    objection_responses: list[ObjectionResponse] = []
    competitive_landscape: str = ""


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
    comparison_table: list[ComparisonRow] = []
    key_differentiators: list[str] = []
    landmine_questions: list[str] = []


class CompetitiveResponse(BaseModel):
    research_id: str
    company_name: str
    domain: str
    competitive: CompetitiveComparison
    generation_time_seconds: float
```

**Step 2: Commit**

```bash
git add backend/models/schemas.py
git commit -m "feat: add schemas for meeting prep, competitive comparison, objection handling"
```

---

### Task 3: Update Battle Card Prompt — Add Objection Handling

**Files:**
- Modify: `backend/prompts/battle_card_prompt.txt`

**Step 1: Update prompt**

Replace full file with:

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
  },
  "objection_handling": [
    {"objection": "common objection the prospect might raise", "response": "specific rebuttal using company context"},
    {"objection": "another objection", "response": "another rebuttal"}
  ]
}

Rules:
- Be specific. Use the company name, their actual product, their actual news.
- Do not use filler phrases like "cutting-edge" or "innovative."
- Opening lines must reference something real about the company — not generic templates.
- Objection handling should include 3-5 objections specific to this company's situation, industry, and likely concerns.
- If data is missing for a field, return an empty array or "Insufficient data."
- Return ONLY the JSON object, no other text.
```

**Step 2: Commit**

```bash
git add backend/prompts/battle_card_prompt.txt
git commit -m "feat: add objection handling to battle card prompt"
```

---

### Task 4: Meeting Prep Generator Agent

**Files:**
- Create: `backend/prompts/meeting_prep_prompt.txt`
- Create: `backend/agents/meeting_prep_generator.py`

**Step 1: Create prompt**

```
You are an expert sales strategist helping an SDR prepare for a booked meeting.

Given the following research data about {company_name}, produce a comprehensive meeting preparation brief.

Research Data:
{raw_research_bundle}

Output the meeting prep brief in this exact JSON format:
{
  "executive_summary": "2-3 sentence summary of the company and why this meeting matters",
  "meeting_agenda": [
    {"item": "Introduction and rapport building", "minutes": 5},
    {"item": "Discovery: understand their current challenges", "minutes": 10},
    {"item": "Present relevant solution overview", "minutes": 8},
    {"item": "Handle objections and questions", "minutes": 5},
    {"item": "Next steps and close", "minutes": 2}
  ],
  "talking_points": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "questions_to_ask": ["question 1", "question 2", "question 3", "question 4", "question 5"],
  "objection_responses": [
    {"objection": "likely objection", "response": "detailed rebuttal with context"},
    {"objection": "another objection", "response": "another detailed rebuttal"}
  ],
  "competitive_landscape": "2-3 sentence summary of what tools/solutions they likely use today and how to position against them"
}

Rules:
- Be specific to this company. Reference their actual industry, size, products, and news.
- Talking points should be tailored to what matters to THIS prospect, not generic.
- Questions should uncover real pain points based on the research data.
- Include 5-7 objection/response pairs covering budget, timing, competition, and change management.
- Meeting agenda should total 30 minutes.
- Return ONLY the JSON object, no other text.
```

**Step 2: Create generator**

```python
import json
import pathlib

from openai import OpenAI
from config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

PROMPT_PATH = pathlib.Path(__file__).parent.parent / "prompts" / "meeting_prep_prompt.txt"


def generate_meeting_prep(company_name: str, domain: str, raw_research: str) -> dict:
    """Generate a meeting prep brief from raw research data."""
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
```

**Step 3: Commit**

```bash
git add backend/prompts/meeting_prep_prompt.txt backend/agents/meeting_prep_generator.py
git commit -m "feat: add meeting prep generator agent"
```

---

### Task 5: Competitive Comparison Generator Agent

**Files:**
- Create: `backend/prompts/competitive_prompt.txt`
- Create: `backend/agents/competitive_generator.py`

**Step 1: Create prompt**

```
You are an expert competitive intelligence analyst helping an SDR position against competitors.

Given the following research data about {company_name} and knowing the seller represents "{your_product}", produce a competitive comparison.

Research Data:
{raw_research_bundle}

Output the competitive comparison in this exact JSON format:
{
  "prospect_current_stack": ["tool 1", "tool 2", "tool 3"],
  "comparison_table": [
    {"category": "category name", "their_solution": "what they likely use", "your_advantage": "why your solution is better for this category"},
    {"category": "another category", "their_solution": "their current tool", "your_advantage": "your edge"}
  ],
  "key_differentiators": ["differentiator 1", "differentiator 2", "differentiator 3"],
  "landmine_questions": ["question that exposes competitor weakness 1", "question 2", "question 3"]
}

Rules:
- Be specific about what the prospect likely uses based on their tech stack, industry, and company size.
- Comparison table should have 4-6 rows covering relevant categories.
- Key differentiators should be specific to this prospect's situation, not generic product claims.
- Landmine questions should be subtle discovery questions that naturally reveal competitor weaknesses.
- If you cannot determine their current stack, infer from industry standards and company size.
- Return ONLY the JSON object, no other text.
```

**Step 2: Create generator**

```python
import json
import pathlib

from openai import OpenAI
from config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

PROMPT_PATH = pathlib.Path(__file__).parent.parent / "prompts" / "competitive_prompt.txt"


def generate_competitive(company_name: str, domain: str, raw_research: str, your_product: str) -> dict:
    """Generate a competitive comparison from raw research data."""
    template = PROMPT_PATH.read_text()
    prompt = (
        template.replace("{company_name}", company_name)
        .replace("{raw_research_bundle}", raw_research)
        .replace("{your_product}", your_product)
    )

    response = client.chat.completions.create(
        model="gpt-4o",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )

    text = response.choices[0].message.content
    return json.loads(text.strip())
```

**Step 3: Commit**

```bash
git add backend/prompts/competitive_prompt.txt backend/agents/competitive_generator.py
git commit -m "feat: add competitive comparison generator agent"
```

---

### Task 6: Update main.py — Cache + New Endpoints

**Files:**
- Modify: `backend/main.py`

**Step 1: Rewrite main.py with cache and new endpoints**

```python
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
```

**Step 2: Verify imports**

Run: `cd backend && python -c "from main import app; print('OK')"`
Expected: `OK`

**Step 3: Commit**

```bash
git add backend/main.py
git commit -m "feat: add meeting-prep and competitive endpoints with research caching"
```

---

### Task 7: Frontend API Client — New Endpoints

**Files:**
- Modify: `frontend/src/api/research.js`

**Step 1: Add new API functions**

```js
const API_BASE = import.meta.env.DEV ? "http://localhost:8000" : "/api";

async function post(endpoint, body) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Request failed");
  }

  return response.json();
}

export async function researchCompany(companyName, domain) {
  return post("/research", {
    company_name: companyName || undefined,
    domain: domain || undefined,
  });
}

export async function generateMeetingPrep(researchId) {
  return post("/meeting-prep", { research_id: researchId });
}

export async function generateCompetitive(researchId, yourProduct) {
  return post("/competitive", {
    research_id: researchId,
    your_product: yourProduct,
  });
}
```

**Step 2: Commit**

```bash
git add frontend/src/api/research.js
git commit -m "feat: add API client functions for meeting prep and competitive"
```

---

### Task 8: Frontend — MeetingPrep Component

**Files:**
- Create: `frontend/src/components/MeetingPrep.jsx`

**Step 1: Create component**

```jsx
export default function MeetingPrep({ data }) {
  const { meeting_prep: prep, company_name, generation_time_seconds } = data;

  const Section = ({ title, children }) => (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-8">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Meeting Prep — {company_name}</h2>
        <span className="text-sm text-gray-400">{generation_time_seconds}s</span>
      </div>

      <Section title="Executive Summary">
        <p className="text-gray-700">{prep.executive_summary}</p>
      </Section>

      {prep.meeting_agenda.length > 0 && (
        <Section title="Suggested Agenda (30 min)">
          <div className="space-y-2">
            {prep.meeting_agenda.map((a, i) => (
              <div key={i} className="flex justify-between text-gray-700">
                <span>&bull; {a.item}</span>
                <span className="text-gray-400 text-sm ml-4 shrink-0">{a.minutes} min</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {prep.talking_points.length > 0 && (
        <Section title="Talking Points">
          <ul className="space-y-1">
            {prep.talking_points.map((p, i) => (
              <li key={i} className="text-gray-700">&bull; {p}</li>
            ))}
          </ul>
        </Section>
      )}

      {prep.questions_to_ask.length > 0 && (
        <Section title="Questions to Ask">
          <ol className="space-y-1 list-decimal list-inside">
            {prep.questions_to_ask.map((q, i) => (
              <li key={i} className="text-gray-700">{q}</li>
            ))}
          </ol>
        </Section>
      )}

      {prep.objection_responses.length > 0 && (
        <Section title="Objection Handling">
          <div className="space-y-3">
            {prep.objection_responses.map((o, i) => (
              <div key={i} className="border-l-2 border-blue-300 pl-4">
                <p className="text-gray-800 font-medium">"{o.objection}"</p>
                <p className="text-gray-600 mt-1">{o.response}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {prep.competitive_landscape && (
        <Section title="Competitive Landscape">
          <p className="text-gray-700">{prep.competitive_landscape}</p>
        </Section>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add frontend/src/components/MeetingPrep.jsx
git commit -m "feat: add MeetingPrep component"
```

---

### Task 9: Frontend — CompetitiveComparison Component

**Files:**
- Create: `frontend/src/components/CompetitiveComparison.jsx`

**Step 1: Create component**

```jsx
export default function CompetitiveComparison({ data }) {
  const { competitive: comp, company_name, generation_time_seconds } = data;

  const Section = ({ title, children }) => (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-8">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Competitive Analysis — {company_name}</h2>
        <span className="text-sm text-gray-400">{generation_time_seconds}s</span>
      </div>

      {comp.prospect_current_stack.length > 0 && (
        <Section title="Their Current Stack">
          <div className="flex flex-wrap gap-2">
            {comp.prospect_current_stack.map((tool, i) => (
              <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                {tool}
              </span>
            ))}
          </div>
        </Section>
      )}

      {comp.comparison_table.length > 0 && (
        <Section title="Comparison">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 pr-4 font-semibold text-gray-600">Category</th>
                  <th className="py-2 pr-4 font-semibold text-gray-600">Their Solution</th>
                  <th className="py-2 font-semibold text-gray-600">Your Advantage</th>
                </tr>
              </thead>
              <tbody>
                {comp.comparison_table.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-medium text-gray-800">{row.category}</td>
                    <td className="py-2 pr-4 text-gray-600">{row.their_solution}</td>
                    <td className="py-2 text-green-700">{row.your_advantage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {comp.key_differentiators.length > 0 && (
        <Section title="Key Differentiators">
          <ul className="space-y-1">
            {comp.key_differentiators.map((d, i) => (
              <li key={i} className="text-gray-700">&bull; {d}</li>
            ))}
          </ul>
        </Section>
      )}

      {comp.landmine_questions.length > 0 && (
        <Section title="Landmine Questions">
          <ol className="space-y-1 list-decimal list-inside">
            {comp.landmine_questions.map((q, i) => (
              <li key={i} className="text-gray-700">{q}</li>
            ))}
          </ol>
        </Section>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add frontend/src/components/CompetitiveComparison.jsx
git commit -m "feat: add CompetitiveComparison component"
```

---

### Task 10: Frontend — ExportBar Component

**Files:**
- Create: `frontend/src/components/ExportBar.jsx`

**Step 1: Create component**

```jsx
import { useState } from "react";

export default function ExportBar({ contentRef, title }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!contentRef.current) return;
    const text = contentRef.current.innerText;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePDF = () => {
    window.print();
  };

  return (
    <div className="flex gap-3 w-full max-w-3xl mx-auto mt-4 print:hidden">
      <button
        onClick={handleCopy}
        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700"
      >
        {copied ? "Copied!" : "Copy to Clipboard"}
      </button>
      <button
        onClick={handlePDF}
        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700"
      >
        Download PDF
      </button>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add frontend/src/components/ExportBar.jsx
git commit -m "feat: add ExportBar with copy-to-clipboard and print-to-PDF"
```

---

### Task 11: Frontend — Update BattleCard with Objection Handling

**Files:**
- Modify: `frontend/src/components/BattleCard.jsx`

**Step 1: Add objection handling section**

After the opening lines section (before the closing `</div>`), add:

```jsx
{card.objection_handling && card.objection_handling.length > 0 && (
  <Section title="Objection Handling">
    <div className="space-y-3">
      {card.objection_handling.map((o, i) => (
        <div key={i} className="border-l-2 border-blue-300 pl-4">
          <p className="text-gray-800 font-medium">"{o.objection}"</p>
          <p className="text-gray-600 mt-1">{o.response}</p>
        </div>
      ))}
    </div>
  </Section>
)}
```

**Step 2: Commit**

```bash
git add frontend/src/components/BattleCard.jsx
git commit -m "feat: add objection handling section to BattleCard"
```

---

### Task 12: Frontend — Update App.jsx with Tool Tabs, Export, and New Tools

**Files:**
- Modify: `frontend/src/App.jsx`

**Step 1: Full rewrite of App.jsx**

```jsx
import { useState, useRef } from "react";
import SearchBar from "./components/SearchBar";
import BattleCard from "./components/BattleCard";
import MeetingPrep from "./components/MeetingPrep";
import CompetitiveComparison from "./components/CompetitiveComparison";
import LoadingState from "./components/LoadingState";
import ExportBar from "./components/ExportBar";
import { researchCompany, generateMeetingPrep, generateCompetitive } from "./api/research";

const TABS = [
  { id: "battlecard", label: "Battle Card" },
  { id: "meetingprep", label: "Meeting Prep" },
  { id: "competitive", label: "Competitive" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("battlecard");
  const [results, setResults] = useState({});
  const [researchId, setResearchId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [yourProduct, setYourProduct] = useState("");
  const contentRef = useRef(null);

  const handleSearch = async (input) => {
    setLoading(true);
    setError(null);
    setResults({});
    setResearchId(null);
    setActiveTab("battlecard");

    try {
      const isDomain = input.includes(".");
      const data = await researchCompany(
        isDomain ? "" : input,
        isDomain ? input : ""
      );
      setResults({ battlecard: data });
      setResearchId(data.research_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = async (tabId) => {
    setActiveTab(tabId);

    if (results[tabId]) return; // already loaded

    if (tabId === "competitive" && !yourProduct.trim()) return; // need input first

    setLoading(true);
    setError(null);

    try {
      let data;
      if (tabId === "meetingprep") {
        data = await generateMeetingPrep(researchId);
      } else if (tabId === "competitive") {
        data = await generateCompetitive(researchId, yourProduct.trim());
      }
      setResults((prev) => ({ ...prev, [tabId]: data }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCompetitive = async () => {
    if (!yourProduct.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const data = await generateCompetitive(researchId, yourProduct.trim());
      setResults((prev) => ({ ...prev, competitive: data }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasResults = Object.keys(results).length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">SalesContext AI</h1>
        <p className="text-gray-500 text-lg">AI-powered prospect research in under 60 seconds</p>
      </div>

      <SearchBar onSearch={handleSearch} loading={loading} />

      {error && (
        <div className="max-w-2xl mx-auto mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {hasResults && (
        <div className="flex justify-center gap-2 mt-8 print:hidden">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              disabled={loading}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
              } disabled:opacity-50`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {loading && <LoadingState />}

      <div ref={contentRef}>
        {!loading && activeTab === "battlecard" && results.battlecard && (
          <BattleCard data={results.battlecard} />
        )}

        {!loading && activeTab === "meetingprep" && results.meetingprep && (
          <MeetingPrep data={results.meetingprep} />
        )}

        {!loading && activeTab === "competitive" && !results.competitive && researchId && (
          <div className="w-full max-w-3xl mx-auto mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What are you selling?</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={yourProduct}
                onChange={(e) => setYourProduct(e.target.value)}
                placeholder="Your product or company name"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleGenerateCompetitive}
                disabled={!yourProduct.trim() || loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate
              </button>
            </div>
          </div>
        )}

        {!loading && activeTab === "competitive" && results.competitive && (
          <CompetitiveComparison data={results.competitive} />
        )}
      </div>

      {!loading && hasResults && results[activeTab] && (
        <ExportBar contentRef={contentRef} />
      )}
    </div>
  );
}
```

**Step 2: Add print-friendly CSS to index.css**

Append to `frontend/src/index.css`:

```css

@media print {
  body {
    background: white;
  }
  .print\:hidden {
    display: none !important;
  }
}
```

**Step 3: Verify frontend builds**

Run: `cd frontend && npx vite build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add frontend/src/App.jsx frontend/src/index.css
git commit -m "feat: add tool selector tabs, competitive input, and export bar to App"
```

---

### Task 13: Verify and Final Commit

**Step 1: Verify backend imports**

Run: `cd backend && python -c "from main import app; print('OK')"`

**Step 2: Run input handler tests**

Run: `cd backend && python -m pytest tests/test_input_handler.py -v`

**Step 3: Verify frontend builds**

Run: `cd frontend && npx vite build`

**Step 4: Final commit and push**

```bash
git push origin main
```
