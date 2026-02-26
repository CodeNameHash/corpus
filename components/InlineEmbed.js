// components/InlineEmbed.js
// Renders body text with [[concept:slug]] and [[case:id]] tags
// replaced by expandable inline cards.
//
// Usage: <InlineEmbed text={body} concepts={conceptsMap} cases={casesMap} />

import { useState } from 'react';
import { C, F } from '../data/tokens';

// ─── Inline concept card ───────────────────────────────────────────────────────
function InlineConceptCard({ concept }) {
  const [open, setOpen] = useState(false);
  if (!concept) return null;
  return (
    <span style={{ display: 'block', margin: '16px 0' }}>
      <span
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
          background: open ? '#FFF3E0' : C.bg,
          border: `1px solid ${open ? C.accent : C.border}`,
          transition: 'all 0.15s',
        }}
      >
        <span style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.accent }}>CONCEPT</span>
        <span style={{ fontFamily: F.display, fontSize: 14, fontWeight: 700, color: C.ink }}>{concept.title}</span>
        <span style={{ fontFamily: F.body, fontSize: 12, color: C.inkLight }}>— {concept.summary}</span>
        <span style={{ fontFamily: F.ui, fontSize: 14, color: C.accent, marginLeft: 4 }}>{open ? '▾' : '▸'}</span>
      </span>
      {open && (
        <span style={{ display: 'block', marginTop: 4, padding: '16px 20px', background: '#FFFBF3', border: `1px solid ${C.accent}`, borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
          <span style={{ display: 'block', fontFamily: F.body, fontSize: 13, color: C.inkMid, lineHeight: 1.8, marginBottom: 12 }}>{concept.definition}</span>
          {concept.advantages?.length > 0 && (
            <span style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <span style={{ display: 'block', padding: '10px 14px', background: C.buyerBg, border: `1px solid ${C.buyerBorder}`, borderRadius: 6 }}>
                <span style={{ display: 'block', fontFamily: F.ui, fontSize: 10, fontWeight: 700, color: C.buyer, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>Advantages</span>
                {concept.advantages.map((a, i) => <span key={i} style={{ display: 'block', fontFamily: F.body, fontSize: 12, color: C.inkMid, lineHeight: 1.6, marginBottom: 3 }}>· {a}</span>)}
              </span>
              <span style={{ display: 'block', padding: '10px 14px', background: C.sellerBg, border: `1px solid ${C.sellerBorder}`, borderRadius: 6 }}>
                <span style={{ display: 'block', fontFamily: F.ui, fontSize: 10, fontWeight: 700, color: C.seller, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>Disadvantages</span>
                {concept.disadvantages.map((d, i) => <span key={i} style={{ display: 'block', fontFamily: F.body, fontSize: 12, color: C.inkMid, lineHeight: 1.6, marginBottom: 3 }}>· {d}</span>)}
              </span>
            </span>
          )}
          <a href={`/concepts/${concept.slug}`} style={{ fontFamily: F.ui, fontSize: 12, fontWeight: 600, color: C.accent, textDecoration: 'none', borderBottom: `1px solid ${C.accentDim}` }}>
            Full concept page →
          </a>
        </span>
      )}
    </span>
  );
}

// ─── Inline case card ─────────────────────────────────────────────────────────
function InlineCaseCard({ cas }) {
  const [open, setOpen] = useState(false);
  if (!cas) return null;
  return (
    <span style={{ display: 'block', margin: '16px 0' }}>
      <span
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
          background: open ? C.caseBg : C.bg,
          border: `1px solid ${open ? C.caseBorder : C.border}`,
          transition: 'all 0.15s',
        }}
      >
        <span style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.caseText }}>CASE</span>
        <span style={{ fontFamily: F.display, fontSize: 14, fontWeight: 700, color: C.ink }}>{cas.name}</span>
        <span style={{ fontFamily: F.ui, fontSize: 12, color: C.inkLight }}>{cas.court} {cas.year}</span>
        <span style={{ fontFamily: F.ui, fontSize: 14, color: C.caseText, marginLeft: 4 }}>{open ? '▾' : '▸'}</span>
      </span>
      {open && (
        <span style={{ display: 'block', marginTop: 4, padding: '16px 20px', background: C.caseBg, border: `1px solid ${C.caseBorder}`, borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
          <span style={{ display: 'block', fontFamily: F.ui, fontSize: 11, color: C.inkLight, marginBottom: 10 }}>{cas.cite}</span>
          <span style={{ display: 'block', fontFamily: F.body, fontSize: 13, color: C.inkMid, lineHeight: 1.8, marginBottom: 12 }}>{cas.summary}</span>
          {cas.holdings?.length > 0 && (
            <span style={{ display: 'block', marginBottom: 10 }}>
              <span style={{ display: 'block', fontFamily: F.ui, fontSize: 10, fontWeight: 700, color: C.caseText, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>Holdings</span>
              {cas.holdings.map((h, i) => (
                <span key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.caseText, flexShrink: 0, marginTop: 2 }}>{i + 1}.</span>
                  <span style={{ fontFamily: F.body, fontSize: 13, color: C.inkMid, lineHeight: 1.7 }}>{h}</span>
                </span>
              ))}
            </span>
          )}
          {cas.decision_url && (
            <a href={cas.decision_url} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: F.ui, fontSize: 12, fontWeight: 600, color: C.caseText, textDecoration: 'none', borderBottom: `1px solid ${C.caseBorder}` }}>
              Read full opinion →
            </a>
          )}
        </span>
      )}
    </span>
  );
}

// ─── Main renderer ────────────────────────────────────────────────────────────
// Parses text for [[concept:slug]] and [[case:id]] tokens
// and replaces them with interactive cards. Everything else renders as paragraphs.

export default function InlineEmbed({ text, concepts = {}, cases = {} }) {
  if (!text) return null;

  // Split on embed tokens — keep delimiters via capture group
  const TOKEN_RE = /(\[\[(?:concept|case):[^\]]+\]\])/g;
  const parts = text.split(TOKEN_RE);

  const elements = [];
  let paraBuffer = [];

  function flushPara() {
    if (!paraBuffer.length) return;
    const paras = paraBuffer.join('').split(/\n\n+/);
    paras.forEach((p, i) => {
      const trimmed = p.trim();
      if (trimmed) {
        elements.push(
          <p key={`p-${elements.length}-${i}`} style={{ fontFamily: F.body, fontSize: 15, color: C.inkMid, lineHeight: 1.85, margin: '0 0 18px 0' }}>
            {trimmed}
          </p>
        );
      }
    });
    paraBuffer = [];
  }

  for (const part of parts) {
    const conceptMatch = part.match(/^\[\[concept:([^\]]+)\]\]$/);
    const caseMatch = part.match(/^\[\[case:([^\]]+)\]\]$/);

    if (conceptMatch) {
      flushPara();
      const slug = conceptMatch[1];
      const concept = concepts[slug];
      elements.push(<InlineConceptCard key={`concept-${slug}-${elements.length}`} concept={concept} />);
    } else if (caseMatch) {
      flushPara();
      const id = caseMatch[1];
      const cas = cases[id];
      elements.push(<InlineCaseCard key={`case-${id}-${elements.length}`} cas={cas} />);
    } else {
      paraBuffer.push(part);
    }
  }
  flushPara();

  return <div>{elements}</div>;
}
