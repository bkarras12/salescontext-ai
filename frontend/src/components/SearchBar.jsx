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
