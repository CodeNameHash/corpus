import { EXPLAINERS } from '../../data/explainers';
import { CONCEPTS } from '../../data/concepts';
import { CASES } from '../../data/cases';
import { C, F } from '../../data/tokens';
import InlineEmbed from '../InlineEmbed';

// Build lookup maps for inline embeds
const conceptsMap = Object.fromEntries(Object.values(CONCEPTS).map(c => [c.slug, c]));
const casesMap = CASES;

export default function ExplainerTab({ provisionId, level }) {
  const data = EXPLAINERS[provisionId]?.[level];
  if (!data) return (
    <div style={{ padding: '60px 0', textAlign: 'center' }}>
      <div style={{ fontFamily: F.display, fontSize: 22, color: C.inkLight }}>Coming Soon</div>
    </div>
  );
  return (
    <div style={{ maxWidth: 760 }}>
      <h2 style={{ fontFamily: F.display, fontSize: 28, fontWeight: 700, color: C.ink, lineHeight: 1.2, marginBottom: 24 }}>{data.headline}</h2>
      <InlineEmbed text={data.body} concepts={conceptsMap} cases={casesMap} />
    </div>
  );
}
