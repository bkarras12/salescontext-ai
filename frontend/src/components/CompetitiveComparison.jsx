export default function CompetitiveComparison({ data }) {
  const { competitive: comp, company_name, generation_time_seconds } = data;

  const Section = ({ title, children }) => (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-8">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Competitive Analysis &mdash; {company_name}</h2>
        <span className="text-sm text-gray-400">{generation_time_seconds}s</span>
      </div>

      {comp.prospect_current_stack.length > 0 && (
        <Section title="Their Current Stack">
          <div className="flex flex-wrap gap-2">
            {comp.prospect_current_stack.map((tool, i) => (
              <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
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
                <tr className="border-b border-gray-200">
                  <th className="py-2 pr-4 font-semibold text-gray-600">Category</th>
                  <th className="py-2 pr-4 font-semibold text-gray-600">Their Solution</th>
                  <th className="py-2 font-semibold text-gray-600">Your Advantage</th>
                </tr>
              </thead>
              <tbody>
                {comp.comparison_table.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-medium text-gray-800">{row.category}</td>
                    <td className="py-2 pr-4 text-gray-600">{row.their_solution}</td>
                    <td className="py-2 text-green-700">{row.your_advantage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {comp.key_differentiators.length > 0 && (
        <Section title="Key Differentiators">
          <ul className="space-y-1">
            {comp.key_differentiators.map((d, i) => (
              <li key={i} className="text-gray-700">&bull; {d}</li>
            ))}
          </ul>
        </Section>
      )}

      {comp.landmine_questions.length > 0 && (
        <Section title="Landmine Questions">
          <ol className="space-y-1 list-decimal list-inside">
            {comp.landmine_questions.map((q, i) => (
              <li key={i} className="text-gray-700">{q}</li>
            ))}
          </ol>
        </Section>
      )}
    </div>
  );
}
