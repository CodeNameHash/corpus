import { NEGOTIATION_POINTS } from '../../data/negotiationPoints';
import { C, F } from '../../data/tokens';
import { useSupabaseData } from '../../lib/useSupabaseData';

export default function NegotiationTab({ provisionId }) {
  const staticPoints = NEGOTIATION_POINTS[provisionId] || [];

  const { data: points } = useSupabaseData(
    async (sb) => {
      const { data } = await sb.from('negotiation_points').select('*')
        .eq('provision_id', provisionId)
        .order('sort_order', { ascending: true });
      return data?.length ? data : null;
    },
    staticPoints,
    [provisionId]
  );
  if (!points || !points.length) return (
    <div style={{ padding: '60px 0', textAlign: 'center' }}>
      <div style={{ fontFamily: F.display, fontSize: 22, color: C.inkLight }}>Coming Soon</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 820 }}>
      {points.map(pt => (
        <div key={pt.id} style={{ marginBottom: 36, background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}`, background: C.bg }}>
            <div style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, color: C.ink }}>{pt.title}</div>
            <div style={{ fontFamily: F.body, fontSize: 13, color: C.inkLight, fontStyle: 'italic', marginTop: 4 }}>
              This deal: {pt.deal_context}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ padding: '20px 24px', borderRight: `1px solid ${C.border}` }}>
              <div style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: C.buyer, textTransform: 'uppercase', marginBottom: 10 }}>Buyer's Position</div>
              <p style={{ fontFamily: F.body, fontSize: 13, color: C.inkMid, lineHeight: 1.75 }}>{pt.buyer_position}</p>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: C.seller, textTransform: 'uppercase', marginBottom: 10 }}>Seller's Position</div>
              <p style={{ fontFamily: F.body, fontSize: 13, color: C.inkMid, lineHeight: 1.75 }}>{pt.seller_position}</p>
            </div>
          </div>
          <div style={{ padding: '16px 24px', borderTop: `1px solid ${C.border}`, background: '#FAFAF8' }}>
            <div style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 600, letterSpacing: 2, color: C.inkLight, textTransform: 'uppercase', marginBottom: 10 }}>Key Points</div>
            {pt.key_points.map((kp, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                <span style={{ color: C.accent, fontWeight: 700, fontSize: 14, marginTop: 1 }}>·</span>
                <span style={{ fontFamily: F.body, fontSize: 13, color: C.inkMid, lineHeight: 1.7 }}>{kp}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
