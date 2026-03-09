# Enhanced Tools & Richer Output Design

## Goal

Expand SalesContext AI from a single battle card tool to a three-tool platform with export capabilities.

## New Tools

### 1. Enhanced Battle Card (existing, upgraded)
- Add `objection_handling` section: 3-5 `{ objection, response }` pairs
- Add PDF export (browser print-to-PDF with print-friendly CSS)
- Add copy-to-clipboard (plaintext format)

### 2. Meeting Prep Brief (new)
- `executive_summary` — 2-3 sentences
- `meeting_agenda` — suggested 30-min agenda with time allocations
- `talking_points` — 3-5 key points
- `questions_to_ask` — 5 tailored discovery questions
- `objection_responses` — 5-7 deeper objection/response pairs
- `competitive_landscape` — brief summary of current tools

### 3. Competitive Comparison (new)
- `prospect_current_stack` — tools they likely use
- `comparison_table` — `{ category, their_solution, your_advantage }` rows
- `key_differentiators` — 3-5 bullets
- `landmine_questions` — questions exposing competitor weaknesses
- Requires extra input: user's product/company name

## Architecture

Research orchestrator runs once per company, result cached in-memory (1hr TTL, keyed by domain). Each tool generates from the same cached research.

### API Endpoints
- `POST /research` — existing, enhanced with objection_handling in battle card + returns research_id
- `POST /meeting-prep` — takes research_id or company/domain, returns meeting prep brief
- `POST /competitive` — takes research_id or company/domain + user's product name, returns comparison

### Frontend
- Tool selector tabs above results: Battle Card | Meeting Prep | Competitive Comparison
- Competitive Comparison shows extra input for user's product before generating
- Export bar on all outputs: Copy to Clipboard + Download PDF
- Second/third tools show brief loading (~5s) since research is cached

### Error Handling
- Cache miss: re-run research automatically with loading state
- Competitive input blank: disable generate button
- PDF: browser print-to-PDF with print-friendly CSS
- Copy: clean plaintext, not JSON
- Timeout: clear error message instead of generic failure
