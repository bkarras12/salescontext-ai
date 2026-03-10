import { useState, useRef, lazy, Suspense } from "react";
import SearchBar from "./components/SearchBar";
import BattleCard from "./components/BattleCard";
import MeetingPrep from "./components/MeetingPrep";
import CompetitiveComparison from "./components/CompetitiveComparison";
import LoadingState from "./components/LoadingState";
import ExportBar from "./components/ExportBar";
const ParticleNetwork = lazy(() => import("./components/ParticleNetwork"));
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
    <div className="min-h-screen py-12 px-4 relative">
      <div className="absolute inset-0 overflow-hidden print:hidden">
        <Suspense fallback={null}>
          <ParticleNetwork fadeOut={hasResults} />
        </Suspense>
      </div>

      <div className="relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
            Sales<span className="text-blue-500">Context</span> AI
          </h1>
          <p className="text-slate-400 text-lg">AI-powered prospect research in under 60 seconds</p>
        </div>

        <SearchBar onSearch={handleSearch} loading={loading} />

        {error && (
          <div className="max-w-2xl mx-auto mt-6 p-4 bg-red-950/50 border border-red-800/50 rounded-xl text-red-400 backdrop-blur-sm">
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
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                    : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-slate-200"
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
            <div className="w-full max-w-3xl mx-auto mt-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8">
              <h3 className="text-lg font-semibold text-white mb-4">What are you selling?</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={yourProduct}
                  onChange={(e) => setYourProduct(e.target.value)}
                  placeholder="Your product or company name"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                />
                <button
                  onClick={handleGenerateCompetitive}
                  disabled={!yourProduct.trim() || loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
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
    </div>
  );
}
