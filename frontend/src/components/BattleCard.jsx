export default function BattleCard({ data }) {
  const { battle_card: card, company_name, domain, generation_time_seconds } = data;

  const Section = ({ title, children }) => (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</h3>
      {children}
    </div>
  );

  const List = ({ items }) => (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="text-gray-700">&bull; {item}</li>
      ))}
    </ul>
  );

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{company_name}</h2>
          {domain && <p className="text-gray-500">{domain}</p>}
        </div>
        <span className="text-sm text-gray-400">{generation_time_seconds}s</span>
      </div>

      <Section title="Company Overview">
        <p className="text-gray-700">{card.company_overview}</p>
      </Section>

      {card.recent_news.length > 0 && (
        <Section title="Recent News">
          <List items={card.recent_news} />
        </Section>
      )}

      {card.likely_pain_points.length > 0 && (
        <Section title="Likely Pain Points">
          <List items={card.likely_pain_points} />
        </Section>
      )}

      {card.decision_maker_titles.length > 0 && (
        <Section title="Decision Maker Titles">
          <List items={card.decision_maker_titles} />
        </Section>
      )}

      {card.tech_stack_signals.length > 0 && (
        <Section title="Tech Stack Signals">
          <List items={card.tech_stack_signals} />
        </Section>
      )}

      {card.competitor_context && (
        <Section title="Competitor Context">
          <p className="text-gray-700">{card.competitor_context}</p>
        </Section>
      )}

      {(card.opening_lines.cold_email.length > 0 || card.opening_lines.cold_call.length > 0) && (
        <Section title="Opening Lines">
          {card.opening_lines.cold_email.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-600 mb-1">Cold Email</h4>
              <List items={card.opening_lines.cold_email} />
            </div>
          )}
          {card.opening_lines.cold_call.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-1">Cold Call</h4>
              <List items={card.opening_lines.cold_call} />
            </div>
          )}
        </Section>
      )}

      {card.objection_handling && card.objection_handling.length > 0 && (
        <Section title="Objection Handling">
          <div className="space-y-3">
            {card.objection_handling.map((o, i) => (
              <div key={i} className="border-l-2 border-blue-300 pl-4">
                <p className="text-gray-800 font-medium">&ldquo;{o.objection}&rdquo;</p>
                <p className="text-gray-600 mt-1">{o.response}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
