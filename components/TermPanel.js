import { DEFINED_TERMS } from '../data/definedTerms';
import { PROVISIONS } from '../data/provisions';
import { CASES } from '../data/cases';
import { C, F } from '../data/tokens';

export default function TermPanel({ termId, onClose, onProvisionClick }) {
  if (!termId) return null;
  const term = DEFINED_TERMS[termId];
  if (!term) return null;

  const relatedProvisions = (term.appears_in || []).map(pid => PROVISIONS.find(p => p.id === pid)).filter(Boolean);
  const relatedCases = (term.related_cases || []).map(cid => CASES[cid]).filter(Boolean);

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 199 }} />
      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, width: 420, height: '100vh',
        background: C.white, borderLeft: `1px solid ${C.border}`, zIndex: 200,
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
      }}>
        {/* Header */}
        <div style={{ padding: '24px 24px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: C.white, position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <div style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 600, letterSpacing: 2, color: C.accent, textTransform: 'uppercase', marginBottom: 6 }}>Defined Term</div>
            <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.ink }}>{term.term}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: C.inkLight, padding: 4, marginTop: 2, cursor: 'pointer' }}>✕</button>
        </div>

        {/* Short def */}
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}`, background: C.bg }}>
          <p style={{ fontFamily: F.body, fontSize: 13, color: C.inkMid, lineHeight: 1.6, fontStyle: 'italic' }}>{term.short}</p>
        </div>

        {/* Long def */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 600, letterSpacing: 2, color: C.inkLight, textTransform: 'uppercase', marginBottom: 12 }}>Full Definition</div>
          <p style={{ fontFamily: F.body, fontSize: 13, color: C.inkMid, lineHeight: 1.75 }}>{term.long}</p>
        </div>

        {/* Appears in */}
        {relatedProvisions.length > 0 && (
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 600, letterSpacing: 2, color: C.inkLight, textTransform: 'uppercase', marginBottom: 12 }}>Appears In</div>
            {relatedProvisions.map(p => (
              <button key={p.id} onClick={() => { onProvisionClick && onProvisionClick(p.id); onClose(); }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '10px 14px', marginBottom: 6, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ fontFamily: F.ui, fontSize: 12, fontWeight: 600, color: C.ink }}>
                  {p.number}. {p.title}
                </span>
                <span style={{ fontFamily: F.ui, fontSize: 11, color: C.inkLight }}>{p.sections}</span>
              </button>
            ))}
          </div>
        )}

        {/* Related cases */}
        {relatedCases.length > 0 && (
          <div style={{ padding: '20px 24px' }}>
            <div style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 600, letterSpacing: 2, color: C.inkLight, textTransform: 'uppercase', marginBottom: 12 }}>Related Cases</div>
            {relatedCases.map(c => (
              <div key={c.id} style={{ padding: '12px 14px', marginBottom: 8, background: C.caseBg, border: `1px solid ${C.caseBorder}`, borderRadius: 6 }}>
                <div style={{ fontFamily: F.ui, fontSize: 12, fontWeight: 600, color: C.caseText }}>{c.name}</div>
                <div style={{ fontFamily: F.ui, fontSize: 11, color: C.inkLight, marginTop: 2, marginBottom: 6 }}>{c.court} {c.year} · {c.cite}</div>
                <p style={{ fontFamily: F.body, fontSize: 12, color: C.inkMid, lineHeight: 1.6 }}>{c.summary.slice(0, 200)}…</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
