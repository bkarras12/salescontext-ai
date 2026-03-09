export default function MeetingPrep({ data }) {
  const { meeting_prep: prep, company_name, generation_time_seconds } = data;

  const Section = ({ title, children }) => (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-8">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Meeting Prep &mdash; {company_name}</h2>
        <span className="text-sm text-gray-400">{generation_time_seconds}s</span>
      </div>

      <Section title="Executive Summary">
        <p className="text-gray-700">{prep.executive_summary}</p>
      </Section>

      {prep.meeting_agenda.length > 0 && (
        <Section title="Suggested Agenda (30 min)">
          <div className="space-y-2">
            {prep.meeting_agenda.map((a, i) => (
              <div key={i} className="flex justify-between text-gray-700">
                <span>&bull; {a.item}</span>
                <span className="text-gray-400 text-sm ml-4 shrink-0">{a.minutes} min</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {prep.talking_points.length > 0 && (
        <Section title="Talking Points">
          <ul className="space-y-1">
            {prep.talking_points.map((p, i) => (
              <li key={i} className="text-gray-700">&bull; {p}</li>
            ))}
          </ul>
        </Section>
      )}

      {prep.questions_to_ask.length > 0 && (
        <Section title="Questions to Ask">
          <ol className="space-y-1 list-decimal list-inside">
            {prep.questions_to_ask.map((q, i) => (
              <li key={i} className="text-gray-700">{q}</li>
            ))}
          </ol>
        </Section>
      )}

      {prep.objection_responses.length > 0 && (
        <Section title="Objection Handling">
          <div className="space-y-3">
            {prep.objection_responses.map((o, i) => (
              <div key={i} className="border-l-2 border-blue-300 pl-4">
                <p className="text-gray-800 font-medium">&ldquo;{o.objection}&rdquo;</p>
                <p className="text-gray-600 mt-1">{o.response}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {prep.competitive_landscape && (
        <Section title="Competitive Landscape">
          <p className="text-gray-700">{prep.competitive_landscape}</p>
        </Section>
      )}
    </div>
  );
}
