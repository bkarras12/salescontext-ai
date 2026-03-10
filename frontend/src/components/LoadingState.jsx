import { useState, useEffect } from "react";

const MESSAGES = [
  "Searching the web for company data...",
  "Gathering recent news and announcements...",
  "Analyzing tech stack and competitors...",
  "Identifying decision makers and pain points...",
  "Generating your battle card...",
  "Almost there — finalizing results...",
];

export default function LoadingState() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 text-center">
      <div className="space-y-4">
        <div className="h-6 bg-white/5 rounded-lg w-3/4 mx-auto animate-pulse"></div>
        <div className="h-4 bg-white/5 rounded-lg w-1/2 mx-auto animate-pulse"></div>
        <div className="h-4 bg-white/5 rounded-lg w-2/3 mx-auto animate-pulse"></div>
      </div>
      <div className="mt-8 flex items-center justify-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
        <p className="text-slate-400 text-lg">{MESSAGES[index]}</p>
      </div>
    </div>
  );
}
