const API_BASE = import.meta.env.DEV ? "http://localhost:8000" : "/api";

async function post(endpoint, body) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 504) {
      throw new Error("Request timed out — the research step took too long. Try again or use a company domain for better results.");
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Request failed (${response.status})`);
  }

  return response.json();
}

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
