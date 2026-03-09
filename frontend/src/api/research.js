const API_BASE = "http://localhost:8000";

export async function researchCompany(companyName, domain) {
  const response = await fetch(`${API_BASE}/research`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      company_name: companyName || undefined,
      domain: domain || undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Research request failed");
  }

  return response.json();
}
