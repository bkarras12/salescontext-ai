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
