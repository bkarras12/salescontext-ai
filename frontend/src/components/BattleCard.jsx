export default function BattleCard({ data }) {
  const { battle_card: card, company_name, domain, generation_time_seconds } = data;

  const Section = ({ title, children }) => (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">{title}</h3>
      {children}
    </div>
  );

  const List = ({ items }) => (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="text-slate-300">&bull; {item}</li>
      ))}
    </ul>
  );

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{company_name}</h2>
          {domain && <p className="text-slate-500">{domain}</p>}
        </div>
        <span className="text-xs text-slate-600 bg-white/5 px-2.5 py-1 rounded-full">{generation_time_seconds}s</span>
      </div>

      <Section title="Company Overview">
        <p className="text-slate-300">{card.company_overview}</p>
      </Section>

      {card.value_proposition && (
        <Section title="Tailored Value Proposition">
          <p className="text-slate-300 bg-blue-500/5 border border-blue-500/10 rounded-lg p-4">{card.value_proposition}</p>
        </Section>
      )}

      {card.recent_news.length > 0 && (
        <Section title="Recent News">
          <List items={card.recent_news} />
        </Section>
      )}

      {card.industry_trends && card.industry_trends.length > 0 && (
        <Section title="Industry Trends">
          <List items={card.industry_trends} />
        </Section>
      )}

      {card.likely_pain_points.length > 0 && (
        <Section title="Likely Pain Points">
          <List items={card.likely_pain_points} />
        </Section>
      )}

      {card.buying_signals && card.buying_signals.length > 0 && (
        <Section title="Buying Signals">
          <div className="space-y-1.5">
            {card.buying_signals.map((signal, i) => (
              <div key={i} className="flex items-start gap-2 text-emerald-400">
                <span className="mt-0.5 shrink-0">&#x2714;</span>
                <span>{signal}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {card.decision_maker_titles.length > 0 && (
        <Section title="Decision Maker Titles">
          <List items={card.decision_maker_titles} />
        </Section>
      )}

      {card.tech_stack_signals.length > 0 && (
        <Section title="Tech Stack Signals">
          <div className="flex flex-wrap gap-2">
            {card.tech_stack_signals.map((tool, i) => (
              <span key={i} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-300">
                {tool}
              </span>
            ))}
          </div>
        </Section>
      )}

      {card.competitor_context && (
        <Section title="Competitor Context">
          <p className="text-slate-300">{card.competitor_context}</p>
        </Section>
      )}

      {(card.opening_lines.cold_email.length > 0 || card.opening_lines.cold_call.length > 0 || (card.opening_lines.linkedin && card.opening_lines.linkedin.length > 0)) && (
        <Section title="Opening Lines">
          {card.opening_lines.cold_email.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-slate-400 mb-1">Cold Email</h4>
              <List items={card.opening_lines.cold_email} />
            </div>
          )}
          {card.opening_lines.cold_call.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-slate-400 mb-1">Cold Call</h4>
              <List items={card.opening_lines.cold_call} />
            </div>
          )}
          {card.opening_lines.linkedin && card.opening_lines.linkedin.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-1">LinkedIn</h4>
              <List items={card.opening_lines.linkedin} />
            </div>
          )}
        </Section>
      )}

      {card.objection_handling && card.objection_handling.length > 0 && (
        <Section title="Objection Handling">
          <div className="space-y-3">
            {card.objection_handling.map((o, i) => (
              <div key={i} className="border-l-2 border-blue-500/40 pl-4">
                <p className="text-slate-200 font-medium">&ldquo;{o.objection}&rdquo;</p>
                <p className="text-slate-400 mt-1">{o.response}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {card.recommended_next_steps && card.recommended_next_steps.length > 0 && (
        <Section title="Recommended Next Steps">
          <ol className="space-y-1.5 list-decimal list-inside">
            {card.recommended_next_steps.map((step, i) => (
              <li key={i} className="text-slate-300">{step}</li>
            ))}
          </ol>
        </Section>
      )}
    </div>
  );
}
