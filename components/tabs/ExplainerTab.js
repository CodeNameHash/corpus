import { EXPLAINERS } from '../../data/explainers';
import { CONCEPTS } from '../../data/concepts';
import { CASES } from '../../data/cases';
import { C, F } from '../../data/tokens';
import InlineEmbed from '../InlineEmbed';
import { useSupabaseData } from '../../lib/useSupabaseData';

// Build lookup maps for inline embeds
const conceptsMap = Object.fromEntries(Object.values(CONCEPTS).map(c => [c.slug, c]));
const casesMap = CASES;

export default function ExplainerTab({ provisionId, level }) {
  const staticData = EXPLAINERS[provisionId]?.[level] || null;

  const { data, loading } = useSupabaseData(
    async (sb) => {
      const { data: rows } = await sb.from('explainers').select('*')
        .eq('provision_id', provisionId).eq('level', level).limit(1);
      return rows?.[0] || null;
    },
    staticData,
    [provisionId, level]
  );

  if (loading) return (
    <div style={{ padding: '60px 0', textAlign: 'center' }}>
      <div style={{ fontFamily: F.ui, fontSize: 14, color: C.inkLight }}>Loading…</div>
    </div>
  );

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
