import { useState } from "react";
import SearchBar from "./components/SearchBar";
import BattleCard from "./components/BattleCard";
import LoadingState from "./components/LoadingState";
import { researchCompany } from "./api/research";

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (input) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Determine if input looks like a domain
      const isDomain = input.includes(".");
      const data = await researchCompany(
        isDomain ? "" : input,
        isDomain ? input : ""
      );
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

      {loading && <LoadingState />}
      {result && <BattleCard data={result} />}
    </div>
  );
}
