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
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
      </div>
      <p className="mt-6 text-gray-500 text-lg transition-opacity duration-500">
        {MESSAGES[index]}
      </p>
    </div>
  );
}
