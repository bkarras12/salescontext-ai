# Personalized Inputs Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add optional "What do you sell?" and "Your location" fields to the main search form, personalizing all three outputs (battle card, meeting prep, competitive).

**Architecture:** Two new optional fields flow from SearchBar → App state → API calls → backend schemas → prompt templates. No changes to research/caching layer — personalization happens at the generation step only.

**Tech Stack:** React (frontend), Python/FastAPI (backend), OpenAI API (prompts)

---

## Chunk 1: Backend Schema & Generator Changes

### Task 1: Add fields to request schemas

**Files:**
- Modify: `backend/models/schemas.py:4-19`

- [ ] **Step 1: Add `your_product` and `your_location` to `ResearchRequest` and `MeetingPrepRequest`**

```python
class ResearchRequest(BaseModel):
    company_name: str | None = None
    domain: str | None = None
    your_product: str | None = None
    your_location: str | None = None


class MeetingPrepRequest(BaseModel):
    research_id: str | None = None
    company_name: str | None = None
    domain: str | None = None
    your_product: str | None = None
    your_location: str | None = None


class CompetitiveRequest(BaseModel):
    research_id: str | None = None
    company_name: str | None = None
    domain: str | None = None
    your_product: str
    your_location: str | None = None
```

Note: `CompetitiveRequest.your_product` stays required (it already is). Only `your_location` is added.

- [ ] **Step 2: Commit**

```bash
git add backend/models/schemas.py
git commit -m "feat: add your_product and your_location to request schemas"
```

### Task 2: Update battle card generator and prompt

**Files:**
- Modify: `backend/agents/battle_card_generator.py:12-17`
- Modify: `backend/prompts/battle_card_prompt.txt`

- [ ] **Step 1: Add `your_product` and `your_location` params to `generate_battle_card`**

```python
def generate_battle_card(company_name: str, domain: str, raw_research: str, your_product: str | None = None, your_location: str | None = None) -> dict:
    """Generate a structured battle card from raw research data."""
    template = PROMPT_PATH.read_text()
    prompt = template.replace("{company_name}", company_name).replace(
        "{raw_research_bundle}", raw_research
    )

    personalization = ""
    if your_product:
        personalization += f"\nThe seller represents: \"{your_product}\". Tailor the battle card to highlight how their offering connects to this prospect's pain points. Opening lines, objection handling, and the value proposition should all be framed from the perspective of selling {your_product}."
    if your_location:
        personalization += f"\nThe seller is based in: \"{your_location}\". Factor in geographic relevance — consider local competitors, regional market dynamics, proximity advantages, and any location-specific context that would help the SDR."

    prompt = prompt.replace("{personalization}", personalization)

    response = client.chat.completions.create(
        model="gpt-4o",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )

    text = response.choices[0].message.content
    return json.loads(text.strip())
```

- [ ] **Step 2: Add `{personalization}` placeholder to `battle_card_prompt.txt`**

Add this line after the "Research Data:" block (after `{raw_research_bundle}`, before "Output the battle card"):

```
{personalization}
```

- [ ] **Step 3: Commit**

```bash
git add backend/agents/battle_card_generator.py backend/prompts/battle_card_prompt.txt
git commit -m "feat: battle card generator accepts product and location for personalization"
```

### Task 3: Update meeting prep generator and prompt

**Files:**
- Modify: `backend/agents/meeting_prep_generator.py:12-17`
- Modify: `backend/prompts/meeting_prep_prompt.txt`

- [ ] **Step 1: Add `your_product` and `your_location` params to `generate_meeting_prep`**

Same pattern as battle card generator — add optional params, build personalization string, replace `{personalization}` in template.

```python
def generate_meeting_prep(company_name: str, domain: str, raw_research: str, your_product: str | None = None, your_location: str | None = None) -> dict:
    """Generate a meeting prep brief from raw research data."""
    template = PROMPT_PATH.read_text()
    prompt = template.replace("{company_name}", company_name).replace(
        "{raw_research_bundle}", raw_research
    )

    personalization = ""
    if your_product:
        personalization += f"\nThe seller represents: \"{your_product}\". Tailor talking points, questions, and objection responses to focus on how {your_product} addresses this prospect's specific challenges."
    if your_location:
        personalization += f"\nThe seller is based in: \"{your_location}\". Incorporate geographic context into rapport builders and talking points where relevant."

    prompt = prompt.replace("{personalization}", personalization)

    response = client.chat.completions.create(
        model="gpt-4o",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )

    text = response.choices[0].message.content
    return json.loads(text.strip())
```

- [ ] **Step 2: Add `{personalization}` placeholder to `meeting_prep_prompt.txt`**

Add after `{raw_research_bundle}`, before "Output the meeting prep brief":

```
{personalization}
```

- [ ] **Step 3: Commit**

```bash
git add backend/agents/meeting_prep_generator.py backend/prompts/meeting_prep_prompt.txt
git commit -m "feat: meeting prep generator accepts product and location for personalization"
```

### Task 4: Update competitive generator and prompt

**Files:**
- Modify: `backend/agents/competitive_generator.py:12-19`
- Modify: `backend/prompts/competitive_prompt.txt`

- [ ] **Step 1: Add `your_location` param to `generate_competitive`**

`your_product` is already a param. Just add `your_location`.

```python
def generate_competitive(company_name: str, domain: str, raw_research: str, your_product: str, your_location: str | None = None) -> dict:
    """Generate a competitive comparison from raw research data."""
    template = PROMPT_PATH.read_text()
    prompt = (
        template.replace("{company_name}", company_name)
        .replace("{raw_research_bundle}", raw_research)
        .replace("{your_product}", your_product)
    )

    personalization = ""
    if your_location:
        personalization += f"\nThe seller is based in: \"{your_location}\". Factor in geographic competitive advantages, local market presence, and regional context when comparing solutions."

    prompt = prompt.replace("{personalization}", personalization)

    response = client.chat.completions.create(
        model="gpt-4o",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )

    text = response.choices[0].message.content
    return json.loads(text.strip())
```

- [ ] **Step 2: Add `{personalization}` placeholder to `competitive_prompt.txt`**

Add after `{raw_research_bundle}`, before "Output the competitive comparison":

```
{personalization}
```

- [ ] **Step 3: Commit**

```bash
git add backend/agents/competitive_generator.py backend/prompts/competitive_prompt.txt
git commit -m "feat: competitive generator accepts location for personalization"
```

### Task 5: Wire new fields through API endpoints in main.py

**Files:**
- Modify: `backend/main.py:87-135` (research endpoint)
- Modify: `backend/main.py:138-179` (meeting-prep endpoint)
- Modify: `backend/main.py:182-223` (competitive endpoint)

- [ ] **Step 1: Pass `your_product` and `your_location` to `generate_battle_card`**

In the `research` endpoint (~line 96):

```python
        card_data = generate_battle_card(
            company_name=company_name or domain,
            domain=domain,
            raw_research=entry["raw_research"],
            your_product=req.your_product,
            your_location=req.your_location,
        )
```

- [ ] **Step 2: Pass `your_product` and `your_location` to `generate_meeting_prep`**

In the `meeting_prep` endpoint (~line 147):

```python
        data = generate_meeting_prep(
            company_name=company_name or domain,
            domain=domain,
            raw_research=entry["raw_research"],
            your_product=req.your_product,
            your_location=req.your_location,
        )
```

- [ ] **Step 3: Pass `your_location` to `generate_competitive`**

In the `competitive` endpoint (~line 191):

```python
        data = generate_competitive(
            company_name=company_name or domain,
            domain=domain,
            raw_research=entry["raw_research"],
            your_product=req.your_product,
            your_location=req.your_location,
        )
```

- [ ] **Step 4: Commit**

```bash
git add backend/main.py
git commit -m "feat: wire product and location fields through all API endpoints"
```

## Chunk 2: Frontend Changes

### Task 6: Update SearchBar to include new fields

**Files:**
- Modify: `frontend/src/components/SearchBar.jsx`

- [ ] **Step 1: Add state and inputs for product and location**

Replace the full SearchBar component:

```jsx
import { useState } from "react";

export default function SearchBar({ onSearch, loading }) {
  const [input, setInput] = useState("");
  const [yourProduct, setYourProduct] = useState("");
  const [yourLocation, setYourLocation] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSearch(input.trim(), yourProduct.trim(), yourLocation.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter company name or domain (e.g. notion.so)"
          className="flex-1 px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-lg backdrop-blur-sm"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-7 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
        >
          {loading ? "Researching..." : "Research"}
        </button>
      </div>
      <div className="flex gap-3 mt-3">
        <input
          type="text"
          value={yourProduct}
          onChange={(e) => setYourProduct(e.target.value)}
          placeholder="What do you sell? (e.g. Cloud security platform)"
          className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm backdrop-blur-sm"
          disabled={loading}
        />
        <input
          type="text"
          value={yourLocation}
          onChange={(e) => setYourLocation(e.target.value)}
          placeholder="Your location (e.g. Austin, TX)"
          className="w-56 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm backdrop-blur-sm"
          disabled={loading}
        />
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/SearchBar.jsx
git commit -m "feat: add product and location fields to SearchBar"
```

### Task 7: Update App.jsx to pass new fields through all API calls

**Files:**
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Update `handleSearch` to accept and store product/location**

Key changes in App.jsx:

1. Add `yourLocation` state (line ~23, next to existing `yourProduct` state)
2. Update `handleSearch` to accept 3 args and store product/location
3. Pass `yourProduct` and `yourLocation` to all API calls
4. Remove the inline "What are you selling?" prompt from the Competitive tab (lines 144-163)
5. Auto-trigger competitive generation when tab is clicked (if `yourProduct` is available)

```jsx
// State: add yourLocation next to yourProduct (line ~23)
const [yourLocation, setYourLocation] = useState("");

// handleSearch: accept product and location from SearchBar
const handleSearch = async (input, product, location) => {
  setLoading(true);
  setError(null);
  setResults({});
  setResearchId(null);
  setActiveTab("battlecard");
  setYourProduct(product);
  setYourLocation(location);

  try {
    const isDomain = input.includes(".");
    const data = await researchCompany(
      isDomain ? "" : input,
      isDomain ? input : "",
      product || undefined,
      location || undefined
    );
    setResults({ battlecard: data });
    setResearchId(data.research_id);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

// handleTabClick: pass product/location to meeting-prep and competitive
const handleTabClick = async (tabId) => {
  setActiveTab(tabId);
  if (results[tabId]) return;
  if (tabId === "competitive" && !yourProduct.trim()) return;

  setLoading(true);
  setError(null);

  try {
    let data;
    if (tabId === "meetingprep") {
      data = await generateMeetingPrep(researchId, yourProduct || undefined, yourLocation || undefined);
    } else if (tabId === "competitive") {
      data = await generateCompetitive(researchId, yourProduct.trim(), yourLocation || undefined);
    }
    setResults((prev) => ({ ...prev, [tabId]: data }));
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

Remove the `handleGenerateCompetitive` function entirely (lines 73-86).

Remove the inline competitive input UI block (lines 144-163 — the "What are you selling?" section). Replace with a message when no product was provided:

```jsx
{!loading && activeTab === "competitive" && !results.competitive && researchId && !yourProduct && (
  <div className="w-full max-w-3xl mx-auto mt-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 text-center">
    <p className="text-slate-400">Enter what you sell in the search form above to generate a competitive comparison.</p>
  </div>
)}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/App.jsx
git commit -m "feat: wire product and location through all tabs, remove inline competitive input"
```

### Task 8: Update API client to pass new fields

**Files:**
- Modify: `frontend/src/api/research.js`

- [ ] **Step 1: Add params to API functions**

```js
export async function researchCompany(companyName, domain, yourProduct, yourLocation) {
  return post("/research", {
    company_name: companyName || undefined,
    domain: domain || undefined,
    your_product: yourProduct || undefined,
    your_location: yourLocation || undefined,
  });
}

export async function generateMeetingPrep(researchId, yourProduct, yourLocation) {
  return post("/meeting-prep", {
    research_id: researchId,
    your_product: yourProduct || undefined,
    your_location: yourLocation || undefined,
  });
}

export async function generateCompetitive(researchId, yourProduct, yourLocation) {
  return post("/competitive", {
    research_id: researchId,
    your_product: yourProduct,
    your_location: yourLocation || undefined,
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/api/research.js
git commit -m "feat: pass product and location in all API client calls"
```
