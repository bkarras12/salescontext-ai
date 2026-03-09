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

    if (results[tabId]) return;

    if (tabId === "competitive" && !yourProduct.trim()) return;

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
