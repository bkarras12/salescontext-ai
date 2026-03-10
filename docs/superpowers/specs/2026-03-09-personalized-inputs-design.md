# Personalized Inputs: Product & Location Fields

## Summary

Add two optional fields to the main search form — "What do you sell?" and "Your location" — so all generated outputs (battle card, meeting prep, competitive) are personalized to the user's offering and geographic context.

## Frontend

- **SearchBar** gets two new optional text inputs below the existing company name/domain field:
  - "What do you sell?" (placeholder: e.g. "Cloud security platform for mid-market")
  - "Your location" (placeholder: e.g. "Austin, TX")
- All three values sent with every API call (`/research`, `/meeting-prep`, `/competitive`)
- The Competitive tab's existing "What are you selling?" inline prompt is removed — it's now on the main form

## Backend

- **Request schemas** (`ResearchRequest`, `MeetingPrepRequest`, `CompetitiveRequest`) get two new optional string fields: `your_product` and `your_location`
- **All three prompt templates** (battle_card_prompt.txt, meeting_prep_prompt.txt, competitive_prompt.txt) get conditional personalization sections when fields are provided
- **Generators** pass `your_product` and `your_location` through to prompt formatting
- `CompetitiveRequest` already has `your_product` — unify so it comes from the same form field

## Behavior

- If both fields are blank, output is identical to today (no personalization)
- Research orchestration and caching are unaffected — personalization happens at the generation step, not the research step
- Agent pipeline structure unchanged
