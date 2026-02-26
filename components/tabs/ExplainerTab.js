import { EXPLAINERS } from '../../data/explainers';
import { C, F } from '../../data/tokens';

export default function ExplainerTab({ provisionId, level }) {
  const data = EXPLAINERS[provisionId]?.[level];
  if (!data) return (
    <div style={{ padding: '60px 0', textAlign: 'center' }}>
      <div style={{ fontFamily: F.display, fontSize: 22, color: C.inkLight }}>Coming Soon</div>
    </div>
  );
  return (
    <div style={{ maxWidth: 760 }}>
      <h2 style={{ fontFamily: F.display, fontSize: 28, fontWeight: 700, color: C.ink, lineHeight: 1.2, marginBottom: 20 }}>{data.headline}</h2>
      {data.body.split('\n\n').map((para, i) => (
        <p key={i} style={{ fontFamily: F.body, fontSize: 15, color: C.inkMid, lineHeight: 1.85, marginBottom: 20 }}>{para}</p>
      ))}
    </div>
  );
}
