import { useState } from 'react';
import { C, F } from '../data/tokens';

export default function ConceptCard({ concept, defaultExpanded = false, showLink = true }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!concept) return null;

  return (
    <div style={{
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      overflow: 'hidden',
      marginBottom: 16,
      background: C.white,
    }}>
      {/* Header — always visible */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', cursor: 'pointer',
          background: expanded ? '#FFFBF3' : C.white,
          borderBottom: expanded ? `1px solid ${C.accentDim}` : 'none',
          transition: 'background 0.15s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: '#FFF3E0', border: `1px solid ${C.accentDim}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: F.ui, fontSize: 13, fontWeight: 700, color: C.accent,
            flexShrink: 0,
          }}>
            {concept.sort_order || '◆'}
          </div>
          <div>
            <div style={{ fontFamily: F.display, fontSize: 15, fontWeight: 700, color: C.ink }}>
              {concept.title}
            </div>
            <div style={{ fontFamily: F.body, fontSize: 12, color: C.inkLight, marginTop: 2 }}>
              {concept.summary}
            </div>
          </div>
        </div>
        <div style={{ fontFamily: F.ui, fontSize: 18, color: C.accent, marginLeft: 12, flexShrink: 0 }}>
          {expanded ? '▾' : '▸'}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: '20px 24px' }}>

          {/* Definition */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 700, color: C.accent, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Definition</div>
            <div style={{ fontFamily: F.body, fontSize: 13, color: C.inkMid, lineHeight: 1.8 }}>{concept.definition}</div>
          </div>

          {/* Mechanics */}
          {concept.mechanics?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 700, color: C.accent, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>How It Works</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {concept.mechanics.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: C.accent, color: C.white,
                      fontFamily: F.ui, fontSize: 11, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginTop: 1,
                    }}>{i + 1}</div>
                    <div style={{ fontFamily: F.body, fontSize: 13, color: C.inkMid, lineHeight: 1.7 }}>{step}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advantages / Disadvantages */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div style={{ background: C.buyerBg, border: `1px solid ${C.buyerBorder}`, borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 700, color: C.buyer, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Advantages</div>
              {concept.advantages?.map((a, i) => (
                <div key={i} style={{ fontFamily: F.body, fontSize: 12, color: C.inkMid, lineHeight: 1.6, marginBottom: 4, paddingLeft: 10, borderLeft: `2px solid ${C.buyer}` }}>{a}</div>
              ))}
            </div>
            <div style={{ background: C.sellerBg, border: `1px solid ${C.sellerBorder}`, borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 700, color: C.seller, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Disadvantages</div>
              {concept.disadvantages?.map((d, i) => (
                <div key={i} style={{ fontFamily: F.body, fontSize: 12, color: C.inkMid, lineHeight: 1.6, marginBottom: 4, paddingLeft: 10, borderLeft: `2px solid ${C.seller}` }}>{d}</div>
              ))}
            </div>
          </div>

          {/* Twitter deal relationship */}
          {concept.deal_relationship && (
            <div style={{ background: C.caseBg, border: `1px solid ${C.caseBorder}`, borderRadius: 8, padding: '14px 18px', marginBottom: 16 }}>
              <div style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 700, color: C.caseText, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>↳ Twitter / X Holdings Deal</div>
              <div style={{ fontFamily: F.body, fontSize: 13, color: C.inkMid, lineHeight: 1.75 }}>{concept.deal_relationship}</div>
            </div>
          )}

          {/* Link to full page */}
          {showLink && (
            <a href={`/concepts/${concept.slug}`} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontFamily: F.ui, fontSize: 12, fontWeight: 600, color: C.accent,
              textDecoration: 'none', borderBottom: `1px solid ${C.accentDim}`,
              paddingBottom: 1,
            }}>
              Full concept page →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
