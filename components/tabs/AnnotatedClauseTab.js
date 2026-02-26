import { useState } from 'react';
import { CLAUSES } from '../../data/clauses';
import { DEFINED_TERMS } from '../../data/definedTerms';
import { C, F } from '../../data/tokens';

function TermSpan({ termId, label, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <span
      onClick={() => onClick(termId)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ borderBottom: `1px solid ${C.accent}`, color: hover ? C.accent : 'inherit', cursor: 'pointer', transition: 'color 0.15s' }}
    >{label}</span>
  );
}

function renderText(text, onTermClick) {
  if (!text) return text;
  const termIds = Object.keys(DEFINED_TERMS);
  termIds.sort((a, b) => DEFINED_TERMS[b].term.length - DEFINED_TERMS[a].term.length);
  let parts = [text];
  for (const tid of termIds) {
    const searchStr = DEFINED_TERMS[tid].term;
    const newParts = [];
    for (const part of parts) {
      if (typeof part !== 'string') { newParts.push(part); continue; }
      const idx = part.indexOf(searchStr);
      if (idx === -1) { newParts.push(part); continue; }
      newParts.push(part.slice(0, idx));
      newParts.push({ type: 'term', id: tid, label: searchStr });
      newParts.push(part.slice(idx + searchStr.length));
    }
    parts = newParts;
  }
  return parts.map((p, i) => {
    if (typeof p === 'string') return <span key={i}>{p}</span>;
    return <TermSpan key={i} termId={p.id} label={p.label} onClick={onTermClick} />;
  });
}

export default function AnnotatedClauseTab({ provisionId, level, onTermClick }) {
  const [openAnnotation, setOpenAnnotation] = useState(null);
  const data = CLAUSES[provisionId];
  if (!data) return (
    <div style={{ padding: '60px 0', textAlign: 'center' }}>
      <div style={{ fontFamily: F.display, fontSize: 22, color: C.inkLight }}>Coming Soon</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 600, letterSpacing: 2, color: C.inkLight, textTransform: 'uppercase', marginBottom: 20 }}>{data.section}</div>
      {data.items.map(item => {
        const ann = item.annotations?.[level];
        const annKey = `${item.id}-${level}`;
        const isOpen = openAnnotation === annKey;
        return (
          <div key={item.id} style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: F.ui, fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: 1, marginBottom: 8 }}>{item.label}</div>
            <div style={{ padding: '20px 24px', background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: F.body, fontSize: 14, color: C.inkMid, lineHeight: 1.8 }}>
              {renderText(item.text, onTermClick)}
            </div>
            {ann && (
              <div style={{ marginTop: 8 }}>
                <button
                  onClick={() => setOpenAnnotation(isOpen ? null : annKey)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', padding: '8px 0', fontFamily: F.ui, fontSize: 12, fontWeight: 600, color: C.accent, cursor: 'pointer' }}
                >
                  <span style={{ fontSize: 16 }}>{isOpen ? '▾' : '▸'}</span>
                  <span>Annotation: "{ann.phrase.slice(0, 50)}{ann.phrase.length > 50 ? '…' : ''}"</span>
                </button>
                {isOpen && (
                  <div style={{ padding: '14px 18px', background: '#FFFBF3', border: `1px solid ${C.accentDim}`, borderLeft: `3px solid ${C.accent}`, borderRadius: 6, fontFamily: F.body, fontSize: 13, color: C.inkMid, lineHeight: 1.75 }}>
                    <span style={{ fontWeight: 700, color: C.accent }}>"{ann.phrase}"</span> — {ann.note}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
