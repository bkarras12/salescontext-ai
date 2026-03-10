export default function MeetingPrep({ data }) {
  const { meeting_prep: prep, company_name, generation_time_seconds } = data;

  const Section = ({ title, children }) => (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-white">Meeting Prep &mdash; {company_name}</h2>
        <span className="text-xs text-slate-600 bg-white/5 px-2.5 py-1 rounded-full">{generation_time_seconds}s</span>
      </div>

      <Section title="Executive Summary">
        <p className="text-slate-300">{prep.executive_summary}</p>
      </Section>

      {prep.company_background && (
        <Section title="Company Background">
          <p className="text-slate-300">{prep.company_background}</p>
        </Section>
      )}

      {prep.rapport_builders && prep.rapport_builders.length > 0 && (
        <Section title="Rapport Builders">
          <div className="space-y-1.5">
            {prep.rapport_builders.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-amber-400">
                <span className="mt-0.5 shrink-0">&#x1F4AC;</span>
                <span className="text-slate-300">{r}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {prep.meeting_agenda.length > 0 && (
        <Section title="Suggested Agenda (40 min)">
          <div className="space-y-2">
            {prep.meeting_agenda.map((a, i) => (
              <div key={i} className="flex justify-between text-slate-300">
                <span>&bull; {a.item}</span>
                <span className="text-slate-500 text-sm ml-4 shrink-0 bg-white/5 px-2 py-0.5 rounded">{a.minutes} min</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {prep.talking_points.length > 0 && (
        <Section title="Talking Points">
          <ul className="space-y-1.5">
            {prep.talking_points.map((p, i) => (
              <li key={i} className="text-slate-300">&bull; {p}</li>
            ))}
          </ul>
        </Section>
      )}

      {prep.questions_to_ask.length > 0 && (
        <Section title="Questions to Ask">
          <ol className="space-y-1.5 list-decimal list-inside">
            {prep.questions_to_ask.map((q, i) => (
              <li key={i} className="text-slate-300">{q}</li>
            ))}
          </ol>
        </Section>
      )}

      {prep.objection_responses.length > 0 && (
        <Section title="Objection Handling">
          <div className="space-y-3">
            {prep.objection_responses.map((o, i) => (
              <div key={i} className="border-l-2 border-blue-500/40 pl-4">
                <p className="text-slate-200 font-medium">&ldquo;{o.objection}&rdquo;</p>
                <p className="text-slate-400 mt-1">{o.response}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {prep.competitive_landscape && (
        <Section title="Competitive Landscape">
          <p className="text-slate-300">{prep.competitive_landscape}</p>
        </Section>
      )}

      {prep.success_metrics && prep.success_metrics.length > 0 && (
        <Section title="Success Metrics">
          <div className="space-y-1.5">
            {prep.success_metrics.map((m, i) => (
              <div key={i} className="flex items-start gap-2 text-emerald-400">
                <span className="mt-0.5 shrink-0">&#x2714;</span>
                <span>{m}</span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
