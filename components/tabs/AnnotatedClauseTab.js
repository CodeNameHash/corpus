import { useState, useEffect } from 'react';
import { CLAUSES } from '../../data/clauses';
import { DEFINED_TERMS } from '../../data/definedTerms';
import { C, F } from '../../data/tokens';

const HAS_SUPABASE = !!(
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
);

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

function renderText(text, onTermClick, ann, isOpen, onAnnClick) {
  if (!text) return text;

  let parts = [text];
  if (ann?.phrase) {
    const newParts = [];
    for (const part of parts) {
      if (typeof part !== 'string') { newParts.push(part); continue; }
      const idx = part.indexOf(ann.phrase);
      if (idx === -1) { newParts.push(part); continue; }
      newParts.push(part.slice(0, idx));
      newParts.push({ type: 'annotation', label: ann.phrase });
      newParts.push(part.slice(idx + ann.phrase.length));
    }
    parts = newParts;
  }

  const termIds = Object.keys(DEFINED_TERMS);
  termIds.sort((a, b) => DEFINED_TERMS[b].term.length - DEFINED_TERMS[a].term.length);
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
    if (p.type === 'term') return <TermSpan key={i} termId={p.id} label={p.label} onClick={onTermClick} />;
    if (p.type === 'annotation') {
      return (
        <span key={i}
          onClick={onAnnClick}
          style={{
            borderBottom: `2px solid ${C.accent}`,
            background: isOpen ? '#FFF3E0' : 'transparent',
            cursor: 'pointer',
            borderRadius: 2,
            padding: '0 1px',
            transition: 'background 0.15s',
          }}
        >{p.label}</span>
      );
    }
    return null;
  });
}

export default function AnnotatedClauseTab({ provisionId, level, onTermClick, clauses: propClauses, annotations: propAnnotations, sectionLabel }) {
  const [openAnnotation, setOpenAnnotation] = useState(null);
  const [dbClauses, setDbClauses] = useState(null);
  const [dbAnnotations, setDbAnnotations] = useState(null);
  const [loading, setLoading] = useState(HAS_SUPABASE);

  useEffect(() => {
    if (!HAS_SUPABASE) return;
    setLoading(true);
    (async () => {
      try {
        const mod = await import('../../lib/supabase');
        const { data: clauseRows } = await mod.supabase.from('clauses').select('id, label, text, provision_id')
          .eq('provision_id', provisionId).order('sort_order', { ascending: true });
        if (clauseRows?.length) setDbClauses(clauseRows);

        const { data: annRows } = await mod.supabase.from('annotations').select('*')
          .eq('provision_id', provisionId);
        if (annRows?.length) {
          const out = {};
          for (const row of annRows) {
            if (!out[row.clause_id]) out[row.clause_id] = {};
            out[row.clause_id][row.level] = { phrase: row.phrase, note: row.note };
          }
          setDbAnnotations(out);
        }
      } catch {}
      setLoading(false);
    })();
  }, [provisionId]);

  // Priority: prop clauses > DB clauses > static file
  const staticData = CLAUSES[provisionId];
  const items = propClauses?.length ? propClauses : (dbClauses?.length ? dbClauses : (staticData?.items || []));
  const section = sectionLabel || staticData?.section;
  const annotations = propAnnotations || dbAnnotations;

  function getAnnotation(item) {
    if (annotations?.[item.id]?.[level]) return annotations[item.id][level];
    return item.annotations?.[level] || null;
  }

  if (loading) return (
    <div style={{ padding: '60px 0', textAlign: 'center' }}>
      <div style={{ fontFamily: F.ui, fontSize: 14, color: C.inkLight }}>Loading clauses…</div>
    </div>
  );

  if (!items.length) return (
    <div style={{ padding: '60px 0', textAlign: 'center' }}>
      <div style={{ fontFamily: F.display, fontSize: 22, color: C.inkLight }}>Coming Soon</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 760 }}>
      {section && (
        <div style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 600, letterSpacing: 2, color: C.inkLight, textTransform: 'uppercase', marginBottom: 12 }}>{section}</div>
      )}

      <div style={{ fontFamily: F.ui, fontSize: 12, color: C.inkLight, marginBottom: 24 }}>
        <span style={{ borderBottom: `2px solid ${C.accent}`, paddingBottom: 1 }}>Double-underlined phrases</span>
        {' '}are annotations — click to expand
      </div>

      {items.map(item => {
        const ann = getAnnotation(item);
        const annKey = `${item.id}-${level}`;
        const isOpen = openAnnotation === annKey;

        return (
          <div key={item.id} style={{ marginBottom: 36 }}>
            <div style={{ fontFamily: F.ui, fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: 1, marginBottom: 8 }}>{item.label}</div>

            <div style={{
              padding: '20px 24px',
              background: C.white,
              border: `1px solid ${isOpen ? C.accent : C.border}`,
              borderRadius: isOpen ? '8px 8px 0 0' : 8,
              fontFamily: F.body, fontSize: 14, color: C.inkMid, lineHeight: 1.9,
              transition: 'border-color 0.2s, border-radius 0.2s',
            }}>
              {renderText(item.text, onTermClick, ann, isOpen, () => setOpenAnnotation(isOpen ? null : annKey))}
            </div>

            {ann && isOpen && (
              <div style={{
                padding: '14px 20px',
                background: '#FFFBF3',
                border: `1px solid ${C.accent}`,
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
                fontFamily: F.body, fontSize: 13, color: C.inkMid, lineHeight: 1.75,
              }}>
                <span style={{ fontWeight: 700, color: C.accent }}>"{ann.phrase}"</span> — {ann.note}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
