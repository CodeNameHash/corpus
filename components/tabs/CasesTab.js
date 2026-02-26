import { CASES } from '../../data/cases';
import { DEFINED_TERMS } from '../../data/definedTerms';
import { C, F } from '../../data/tokens';

export default function CasesTab({ provisionId, onTermClick }) {
  const provisionCases = Object.values(CASES).filter(c => c.provisions.includes(provisionId));
  if (!provisionCases.length) return (
    <div style={{ padding: '60px 0', textAlign: 'center', fontFamily: F.body, fontSize: 14, color: C.inkLight }}>
      No cases for this provision yet.
    </div>
  );

  return (
    <div style={{ maxWidth: 760 }}>
      {provisionCases.map(c => (
        <div key={c.id} style={{ marginBottom: 28, background: C.white, border: `1px solid ${C.caseBorder}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', background: C.caseBg, borderBottom: `1px solid ${C.caseBorder}` }}>
            <div style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, color: C.caseText }}>{c.name}</div>
            <div style={{ fontFamily: F.ui, fontSize: 12, color: C.inkLight, marginTop: 4 }}>{c.court} · {c.year} · {c.cite}</div>
          </div>
          <div style={{ padding: '20px 24px' }}>
            <p style={{ fontFamily: F.body, fontSize: 13, color: C.inkMid, lineHeight: 1.8, marginBottom: 20 }}>{c.summary}</p>
            <div style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 600, letterSpacing: 2, color: C.caseText, textTransform: 'uppercase', marginBottom: 12 }}>Holdings</div>
            {c.holdings.map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                <span style={{ color: C.caseText, fontWeight: 700, fontSize: 14, marginTop: 2, flexShrink: 0 }}>{i + 1}.</span>
                <span style={{ fontFamily: F.body, fontSize: 13, color: C.inkMid, lineHeight: 1.7 }}>{h}</span>
              </div>
            ))}
            {c.terms?.length > 0 && (
              <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {c.terms.map(tid => DEFINED_TERMS[tid] && (
                  <button key={tid} onClick={() => onTermClick && onTermClick(tid)}
                    style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 600, color: C.accent, background: '#FFF3E0', borderRadius: 4, padding: '3px 8px', border: `1px solid ${C.accentDim}`, cursor: 'pointer' }}>
                    {DEFINED_TERMS[tid].term}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
