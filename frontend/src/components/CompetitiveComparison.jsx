export default function CompetitiveComparison({ data }) {
  const { competitive: comp, company_name, generation_time_seconds } = data;

  const Section = ({ title, children }) => (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-white">Competitive Analysis &mdash; {company_name}</h2>
        <span className="text-xs text-slate-600 bg-white/5 px-2.5 py-1 rounded-full">{generation_time_seconds}s</span>
      </div>

      {comp.prospect_current_stack.length > 0 && (
        <Section title="Their Current Stack">
          <div className="flex flex-wrap gap-2">
            {comp.prospect_current_stack.map((tool, i) => (
              <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-slate-300">
                {tool}
              </span>
            ))}
          </div>
        </Section>
      )}

      {comp.comparison_table.length > 0 && (
        <Section title="Comparison">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-2.5 pr-4 font-semibold text-slate-400">Category</th>
                  <th className="py-2.5 pr-4 font-semibold text-slate-400">Their Solution</th>
                  <th className="py-2.5 font-semibold text-slate-400">Your Advantage</th>
                </tr>
              </thead>
              <tbody>
                {comp.comparison_table.map((row, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-2.5 pr-4 font-medium text-slate-200">{row.category}</td>
                    <td className="py-2.5 pr-4 text-slate-400">{row.their_solution}</td>
                    <td className="py-2.5 text-emerald-400">{row.your_advantage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {comp.key_differentiators.length > 0 && (
        <Section title="Key Differentiators">
          <ul className="space-y-1.5">
            {comp.key_differentiators.map((d, i) => (
              <li key={i} className="text-slate-300">&bull; {d}</li>
            ))}
          </ul>
        </Section>
      )}

      {comp.landmine_questions.length > 0 && (
        <Section title="Landmine Questions">
          <ol className="space-y-1.5 list-decimal list-inside">
            {comp.landmine_questions.map((q, i) => (
              <li key={i} className="text-slate-300">{q}</li>
            ))}
          </ol>
        </Section>
      )}
    </div>
  );
}
