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
        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700"
      >
        {copied ? "Copied!" : "Copy to Clipboard"}
      </button>
      <button
        onClick={handlePDF}
        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700"
      >
        Download PDF
      </button>
    </div>
  );
}
