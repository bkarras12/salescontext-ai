import { useState } from "react";

export default function ExportBar({ contentRef }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!contentRef.current) return;
    const text = contentRef.current.innerText;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePDF = () => {
    window.print();
  };

  return (
    <div className="flex gap-3 w-full max-w-3xl mx-auto mt-4 print:hidden">
      <button
        onClick={handleCopy}
        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
      >
        {copied ? "Copied!" : "Copy to Clipboard"}
      </button>
      <button
        onClick={handlePDF}
        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
      >
        Download PDF
      </button>
    </div>
  );
}
