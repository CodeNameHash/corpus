import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { PROVISIONS } from '../../data/provisions';
import { QA_DATABASE } from '../../data/qa';
import { WAR_STORIES } from '../../data/warStories';
import { NEGOTIATION_POINTS } from '../../data/negotiationPoints';
import { EXPLAINERS } from '../../data/explainers';
import { DEFINED_TERMS } from '../../data/definedTerms';
import { CASES } from '../../data/cases';
import { CONCEPTS, CONCEPT_CATEGORIES } from '../../data/concepts';
import { CLAUSES } from '../../data/clauses';
import { GOOGLE_FONTS, C, F } from '../../data/tokens';

const LEVELS = ['junior', 'mid', 'senior'];
const MAIN_TABS = ['explainer', 'qa', 'war_stories', 'negotiation', 'annotations', 'defined_terms', 'cases', 'concepts'];
const TAB_LABELS = {
  explainer: 'Explainer', qa: 'Q&A', war_stories: 'War Stories',
  negotiation: 'Negotiation', annotations: 'Annotations',
  defined_terms: 'Defined Terms', cases: 'Cases', concepts: 'Concepts',
};

// ─── Shared helpers ────────────────────────────────────────────────────────────

async function apiSave(table, record, adminPw) {
  const res = await fetch('/api/admin/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminPw}` },
    body: JSON.stringify({ table, record }),
  });
  return res.ok;
}

async function apiDelete(table, id, adminPw) {
  const res = await fetch('/api/admin/save', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminPw}` },
    body: JSON.stringify({ table, id }),
  });
  return res.ok;
}

// ─── UI primitives ─────────────────────────────────────────────────────────────

function Label({ children }) {
  return <div style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 700, color: C.inkLight, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 }}>{children}</div>;
}

function Field({ label, value, onChange, rows = 4, single = false, hint }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <Label>{label}</Label>}
      {hint && <div style={{ fontFamily: F.ui, fontSize: 11, color: C.inkLight, marginBottom: 6, fontStyle: 'italic' }}>{hint}</div>}
      {single
        ? <input value={value || ''} onChange={e => onChange(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', fontFamily: F.body, fontSize: 13, color: C.ink, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, outline: 'none', boxSizing: 'border-box' }} />
        : <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={rows}
            style={{ width: '100%', padding: '10px 14px', fontFamily: F.body, fontSize: 13, color: C.ink, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, outline: 'none', resize: 'vertical', lineHeight: 1.7, boxSizing: 'border-box' }} />
      }
    </div>
  );
}

function ArrayField({ label, value = [], onChange, hint }) {
  const str = Array.isArray(value) ? value.join('\n') : (value || '');
  return (
    <Field label={label} value={str} onChange={v => onChange(v.split('\n').filter(Boolean))}
      rows={4} hint={hint || 'One item per line'} />
  );
}

function SaveBtn({ onClick, saved, label = 'Save to Supabase' }) {
  return (
    <button onClick={onClick}
      style={{ padding: '10px 24px', background: saved ? '#1A5C35' : C.ink, color: C.white, fontFamily: F.ui, fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'background 0.3s' }}>
      {saved ? '✓ Saved' : label}
    </button>
  );
}

function DeleteBtn({ onClick }) {
  return (
    <button onClick={onClick}
      style={{ padding: '10px 18px', background: 'none', color: '#8B1A1A', fontFamily: F.ui, fontSize: 13, fontWeight: 600, border: `1px solid #D4A8A8`, borderRadius: 8, cursor: 'pointer', marginLeft: 10 }}>
      Delete
    </button>
  );
}

function Card({ children, accent = false }) {
  return (
    <div style={{ marginBottom: 24, padding: '20px 24px', background: C.white, border: `1px solid ${accent ? C.accent : C.border}`, borderRadius: 10 }}>
      {children}
    </div>
  );
}

// ─── AI Chat Panel ─────────────────────────────────────────────────────────────

function AIChatPanel({ context, adminPw }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminPw}` },
        body: JSON.stringify({
          messages: newMessages,
          systemPrompt: `You are an expert M&A attorney and legal educator helping draft content for Corpus, a professional training platform teaching merger agreements to law firm associates. Teaching deal: Twitter/X Holdings merger agreement ($44B, April 2022). ${context} Write for sophisticated legal professionals — precise, substantive, no filler. Never hedge.`,
        }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role: 'assistant', content: data.text || `Error: ${data.error}` }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: `Error: ${e.message}` }]);
    }
    setLoading(false);
  }

  const lastAI = [...messages].reverse().find(m => m.role === 'assistant');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ padding: '12px 18px', borderBottom: `1px solid ${C.border}`, background: C.bg, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: F.ui, fontSize: 12, fontWeight: 700, color: C.accent }}>AI Drafting Assistant</span>
        {lastAI && (
          <button onClick={() => navigator.clipboard?.writeText(lastAI.content).then(() => alert('Copied — paste into field'))}
            style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.white, background: C.accent, border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}>
            Copy last response
          </button>
        )}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.length === 0 && (
          <div style={{ fontFamily: F.body, fontSize: 13, color: C.inkFaint, fontStyle: 'italic', textAlign: 'center', marginTop: 20 }}>
            Describe what you want to draft. Context is loaded automatically.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ padding: '10px 14px', borderRadius: 8, alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', background: m.role === 'user' ? C.ink : C.bg, border: m.role === 'assistant' ? `1px solid ${C.border}` : 'none', maxWidth: '92%' }}>
            <pre style={{ fontFamily: m.role === 'user' ? F.ui : F.body, fontSize: 13, color: m.role === 'user' ? C.white : C.inkMid, whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, lineHeight: 1.7 }}>{m.content}</pre>
          </div>
        ))}
        {loading && <div style={{ padding: '10px 14px', borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, alignSelf: 'flex-start', fontFamily: F.ui, fontSize: 13, color: C.inkLight }}>Drafting…</div>}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: '10px 14px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 8 }}>
        <textarea value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Describe what to draft… Enter to send, Shift+Enter for newline"
          rows={2} style={{ flex: 1, padding: '10px 12px', fontFamily: F.ui, fontSize: 13, color: C.ink, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, outline: 'none', resize: 'none', lineHeight: 1.5 }} />
        <button onClick={send} disabled={loading || !input.trim()}
          style={{ padding: '0 14px', background: C.ink, color: C.white, fontFamily: F.ui, fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 8, cursor: 'pointer', opacity: loading || !input.trim() ? 0.4 : 1 }}>Send</button>
      </div>
    </div>
  );
}

// ─── Content Editors ───────────────────────────────────────────────────────────

function ExplainerEditor({ provision, level, adminPw }) {
  const initial = EXPLAINERS[provision]?.[level] || { headline: '', body: '' };
  const [data, setData] = useState(initial);
  const [saved, setSaved] = useState(false);
  async function save() {
    const ok = await apiSave('explainers', { id: `${provision}-${level}`, provision_id: provision, level, ...data }, adminPw);
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  }
  return (
    <div>
      <Field label="Headline" value={data.headline} onChange={v => setData(d => ({ ...d, headline: v }))} single />
      <Field label="Body (blank line = new paragraph)" value={data.body} onChange={v => setData(d => ({ ...d, body: v }))} rows={14} />
      <SaveBtn onClick={save} saved={saved} />
    </div>
  );
}

function QAEditor({ provision, level, adminPw }) {
  const initial = QA_DATABASE.filter(q => q.provision_id === provision && q.level === level);
  const [items, setItems] = useState(initial.length ? initial : [{ id: `${provision}-${level}-q1`, provision_id: provision, level, question: '', answer: '', concepts: [] }]);
  const [saved, setSaved] = useState(false);
  function update(i, k, v) { setItems(items => items.map((item, idx) => idx === i ? { ...item, [k]: v } : item)); }
  function add() { setItems(items => [...items, { id: `${provision}-${level}-q${Date.now()}`, provision_id: provision, level, question: '', answer: '', concepts: [] }]); }
  async function save() {
    for (const item of items) await apiSave('qa', item, adminPw);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }
  async function remove(item) {
    await apiDelete('qa', item.id, adminPw);
    setItems(items => items.filter(i => i.id !== item.id));
  }
  return (
    <div>
      {items.map((item, i) => (
        <Card key={item.id}>
          <div style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 12 }}>Q{i + 1}</div>
          <Field label="Question" value={item.question} onChange={v => update(i, 'question', v)} rows={2} />
          <Field label="Answer" value={item.answer} onChange={v => update(i, 'answer', v)} rows={7} />
          <ArrayField label="Concepts" value={item.concepts} onChange={v => update(i, 'concepts', v)} hint="One concept per line" />
          <DeleteBtn onClick={() => remove(item)} />
        </Card>
      ))}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={add} style={{ padding: '10px 18px', background: C.bg, color: C.inkMid, fontFamily: F.ui, fontSize: 13, fontWeight: 600, border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer' }}>+ Add Question</button>
        <SaveBtn onClick={save} saved={saved} />
      </div>
    </div>
  );
}

function WarStoriesEditor({ provision, level, adminPw }) {
  const initial = WAR_STORIES.filter(s => s.provision_id === provision && s.level === level);
  const [items, setItems] = useState(initial.length ? initial : [{ id: `${provision}-${level}-ws1`, provision_id: provision, level, title: '', story: '', concepts: [] }]);
  const [saved, setSaved] = useState(false);
  function update(i, k, v) { setItems(items => items.map((item, idx) => idx === i ? { ...item, [k]: v } : item)); }
  async function save() {
    for (const item of items) await apiSave('war_stories', item, adminPw);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }
  async function remove(item) {
    await apiDelete('war_stories', item.id, adminPw);
    setItems(items => items.filter(i => i.id !== item.id));
  }
  return (
    <div>
      {items.map((item, i) => (
        <Card key={item.id}>
          <div style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 12 }}>Story {i + 1}</div>
          <Field label="Title" value={item.title} onChange={v => update(i, 'title', v)} single />
          <Field label="Story" value={item.story} onChange={v => update(i, 'story', v)} rows={10} />
          <ArrayField label="Concepts" value={item.concepts} onChange={v => update(i, 'concepts', v)} />
          <DeleteBtn onClick={() => remove(item)} />
        </Card>
      ))}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => setItems(items => [...items, { id: `${provision}-${level}-ws${Date.now()}`, provision_id: provision, level, title: '', story: '', concepts: [] }])}
          style={{ padding: '10px 18px', background: C.bg, color: C.inkMid, fontFamily: F.ui, fontSize: 13, fontWeight: 600, border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer' }}>+ Add Story</button>
        <SaveBtn onClick={save} saved={saved} />
      </div>
    </div>
  );
}

function NegotiationEditor({ provision, adminPw }) {
  const initial = NEGOTIATION_POINTS[provision] || [];
  const [items, setItems] = useState(initial.length ? initial : [{ id: `${provision}-np1`, provision_id: provision, title: '', deal_context: '', buyer_position: '', seller_position: '', key_points: [] }]);
  const [saved, setSaved] = useState(false);
  function update(i, k, v) { setItems(items => items.map((item, idx) => idx === i ? { ...item, [k]: v } : item)); }
  async function save() {
    for (const item of items) await apiSave('negotiation_points', item, adminPw);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }
  return (
    <div>
      {items.map((item, i) => (
        <Card key={item.id}>
          <div style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 12 }}>Point {i + 1}</div>
          <Field label="Title" value={item.title} onChange={v => update(i, 'title', v)} single />
          <Field label="This Deal" value={item.deal_context} onChange={v => update(i, 'deal_context', v)} rows={2} />
          <Field label="Buyer Position" value={item.buyer_position} onChange={v => update(i, 'buyer_position', v)} rows={4} />
          <Field label="Seller Position" value={item.seller_position} onChange={v => update(i, 'seller_position', v)} rows={4} />
          <ArrayField label="Key Points" value={item.key_points} onChange={v => update(i, 'key_points', v)} />
        </Card>
      ))}
      <SaveBtn onClick={save} saved={saved} />
    </div>
  );
}

function AnnotationsEditor({ provision, level, adminPw }) {
  const clauseData = CLAUSES[provision];
  const items = clauseData?.items || [];
  const [anns, setAnns] = useState(() => {
    const out = {};
    for (const item of items) {
      out[item.id] = {
        phrase: item.annotations?.[level]?.phrase || '',
        note: item.annotations?.[level]?.note || '',
      };
    }
    return out;
  });
  const [saved, setSaved] = useState(false);

  async function save() {
    for (const clauseId of Object.keys(anns)) {
      await apiSave('annotations', {
        id: `${provision}-${clauseId}-${level}`,
        provision_id: provision,
        clause_id: clauseId,
        level,
        phrase: anns[clauseId].phrase,
        note: anns[clauseId].note,
      }, adminPw);
    }
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  if (!clauseData) return <div style={{ fontFamily: F.body, fontSize: 14, color: C.inkLight, padding: '20px 0' }}>No clauses defined for this provision yet.</div>;

  return (
    <div>
      <div style={{ fontFamily: F.body, fontSize: 13, color: C.inkLight, marginBottom: 24, lineHeight: 1.7 }}>
        For each clause, set the exact phrase to underline and the annotation note shown when clicked. Phrase must match clause text exactly (case-sensitive).
      </div>
      {items.map(item => (
        <Card key={item.id} accent={!!anns[item.id]?.phrase}>
          <div style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 8 }}>{item.label}</div>
          <div style={{ fontFamily: F.mono, fontSize: 11, color: C.inkLight, background: C.bg, borderRadius: 6, padding: '10px 14px', marginBottom: 16, lineHeight: 1.7, maxHeight: 80, overflow: 'hidden' }}>
            {item.text?.slice(0, 200)}…
          </div>
          <Field label="Phrase to underline (must match clause text exactly)"
            value={anns[item.id]?.phrase || ''}
            onChange={v => setAnns(a => ({ ...a, [item.id]: { ...a[item.id], phrase: v } }))}
            single hint="Copy-paste from the clause text above" />
          <Field label="Annotation note"
            value={anns[item.id]?.note || ''}
            onChange={v => setAnns(a => ({ ...a, [item.id]: { ...a[item.id], note: v } }))}
            rows={4} />
        </Card>
      ))}
      <SaveBtn onClick={save} saved={saved} />
    </div>
  );
}

function DefinedTermsEditor({ adminPw }) {
  const initialTerms = Object.values(DEFINED_TERMS);
  const [terms, setTerms] = useState(initialTerms);
  const [selected, setSelected] = useState(initialTerms[0]?.id || null);
  const [saved, setSaved] = useState(false);

  const term = terms.find(t => t.id === selected);

  function update(k, v) {
    setTerms(terms => terms.map(t => t.id === selected ? { ...t, [k]: v } : t));
  }

  function addNew() {
    const id = `term-${Date.now()}`;
    const newTerm = { id, term: 'New Term', short_def: '', long: '', appears_in: [], related_cases: [], related_terms: [] };
    setTerms(t => [...t, newTerm]);
    setSelected(id);
  }

  async function save() {
    await apiSave('defined_terms', {
      id: term.id,
      term: term.term,
      short_def: term.short || term.short_def || '',
      long_def: term.long || term.long_def || '',
      appears_in: term.appears_in || [],
      related_cases: term.related_cases || [],
      related_terms: term.related_terms || [],
    }, adminPw);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  async function remove() {
    if (!confirm(`Delete "${term.term}"?`)) return;
    await apiDelete('defined_terms', term.id, adminPw);
    setTerms(t => t.filter(x => x.id !== selected));
    setSelected(terms[0]?.id);
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, minHeight: 500 }}>
      {/* Term list */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.inkLight, textTransform: 'uppercase', letterSpacing: 1 }}>Terms</span>
          <button onClick={addNew} style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.accent, background: 'none', border: 'none', cursor: 'pointer' }}>+ New</button>
        </div>
        <div style={{ overflowY: 'auto', maxHeight: 500 }}>
          {terms.map(t => (
            <div key={t.id} onClick={() => setSelected(t.id)}
              style={{ padding: '10px 16px', fontFamily: F.ui, fontSize: 13, color: selected === t.id ? C.accent : C.inkMid, background: selected === t.id ? '#FFFBF3' : 'transparent', borderLeft: `3px solid ${selected === t.id ? C.accent : 'transparent'}`, cursor: 'pointer', fontWeight: selected === t.id ? 600 : 400 }}>
              {t.term}
            </div>
          ))}
        </div>
      </div>

      {/* Term editor */}
      {term && (
        <div>
          <Field label="Term (display text — must match clause text for underlining)" value={term.term} onChange={v => update('term', v)} single />
          <Field label="Short definition (shown in tooltip)" value={term.short || term.short_def} onChange={v => update('short', v)} rows={2} />
          <Field label="Long definition (shown in term panel)" value={term.long || term.long_def} onChange={v => update('long', v)} rows={8} />
          <ArrayField label="Appears in (provision IDs, one per line)" value={term.appears_in} onChange={v => update('appears_in', v)} hint="e.g. structure, mae, termination" />
          <ArrayField label="Related cases (case IDs)" value={term.related_cases} onChange={v => update('related_cases', v)} hint="e.g. twitter_musk, akorn" />
          <ArrayField label="Related terms (term IDs)" value={term.related_terms} onChange={v => update('related_terms', v)} />
          <div style={{ display: 'flex', gap: 10 }}>
            <SaveBtn onClick={save} saved={saved} />
            <DeleteBtn onClick={remove} />
          </div>
        </div>
      )}
    </div>
  );
}

function CasesEditor({ adminPw }) {
  const initialCases = Object.values(CASES);
  const [cases, setCases] = useState(initialCases);
  const [selected, setSelected] = useState(initialCases[0]?.id || null);
  const [saved, setSaved] = useState(false);

  const c = cases.find(x => x.id === selected);

  function update(k, v) { setCases(cases => cases.map(x => x.id === selected ? { ...x, [k]: v } : x)); }

  function addNew() {
    const id = `case-${Date.now()}`;
    const newCase = { id, name: 'New Case', court: '', year: new Date().getFullYear(), cite: '', summary: '', holdings: [], provisions: [], terms: [] };
    setCases(c => [...c, newCase]);
    setSelected(id);
  }

  async function save() {
    await apiSave('cases', c, adminPw);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  async function remove() {
    if (!confirm(`Delete "${c.name}"?`)) return;
    await apiDelete('cases', c.id, adminPw);
    setCases(cases => cases.filter(x => x.id !== selected));
    setSelected(cases[0]?.id);
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, minHeight: 500 }}>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.inkLight, textTransform: 'uppercase', letterSpacing: 1 }}>Cases</span>
          <button onClick={addNew} style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.accent, background: 'none', border: 'none', cursor: 'pointer' }}>+ New</button>
        </div>
        <div style={{ overflowY: 'auto', maxHeight: 500 }}>
          {cases.map(x => (
            <div key={x.id} onClick={() => setSelected(x.id)}
              style={{ padding: '10px 16px', fontFamily: F.ui, fontSize: 12, color: selected === x.id ? C.accent : C.inkMid, background: selected === x.id ? '#FFFBF3' : 'transparent', borderLeft: `3px solid ${selected === x.id ? C.accent : 'transparent'}`, cursor: 'pointer', fontWeight: selected === x.id ? 600 : 400 }}>
              {x.name}<div style={{ fontSize: 10, color: C.inkLight, marginTop: 2 }}>{x.court} {x.year}</div>
            </div>
          ))}
        </div>
      </div>

      {c && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 1fr', gap: 12, marginBottom: 4 }}>
            <Field label="Case name" value={c.name} onChange={v => update('name', v)} single />
            <Field label="Year" value={String(c.year || '')} onChange={v => update('year', parseInt(v) || v)} single />
            <Field label="Court" value={c.court} onChange={v => update('court', v)} single />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Citation" value={c.cite} onChange={v => update('cite', v)} single />
            <Field label="Decision URL (link to full opinion)" value={c.decision_url || ''} onChange={v => update('decision_url', v)} single hint="e.g. https://courts.delaware.gov/..." />
          </div>
          <Field label="Category ID" value={c.category_id || ''} onChange={v => update('category_id', v)} single hint="e.g. cat-delaware, cat-mac — from Folders & Categories" />
          <Field label="Summary" value={c.summary} onChange={v => update('summary', v)} rows={5} />
          <ArrayField label="Holdings (one per line)" value={c.holdings} onChange={v => update('holdings', v)} />
          <Field label="Full Decision Text" value={c.full_decision || ''} onChange={v => update('full_decision', v)} rows={16} hint="Paste full opinion text here. Rendered on the case page." />
          <ArrayField label="Provisions (provision IDs, one per line)" value={c.provisions} onChange={v => update('provisions', v)} hint="e.g. structure, mae, termination" />
          <ArrayField label="Terms (term IDs, one per line)" value={c.terms} onChange={v => update('terms', v)} />
          {/* Embed syntax reminder */}
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
            <div style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 700, color: C.inkLight, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>Embed this case in any Explainer body</div>
            <div style={{ fontFamily: F.mono, fontSize: 13, color: C.caseText, userSelect: 'all' }}>
              {`[[case:${c.id || 'case-id'}]]`}
            </div>
            <div style={{ fontFamily: F.ui, fontSize: 11, color: C.inkLight, marginTop: 6 }}>Paste this token anywhere in an Explainer body — it renders as an expandable inline card with holdings.</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <SaveBtn onClick={save} saved={saved} />
            <DeleteBtn onClick={remove} />
          </div>({ adminPw }) {
  const initialConcepts = Object.values(CONCEPTS);
  const [concepts, setConcepts] = useState(initialConcepts);
  const [selected, setSelected] = useState(initialConcepts[0]?.id || null);
  const [saved, setSaved] = useState(false);

  const concept = concepts.find(x => x.id === selected);

  function update(k, v) { setConcepts(concepts => concepts.map(x => x.id === selected ? { ...x, [k]: v } : x)); }

  function addNew() {
    const id = `concept-${Date.now()}`;
    const slug = `new-concept-${Date.now()}`;
    const newConcept = { id, slug, title: 'New Concept', category: 'merger-structures', provision_ids: [], summary: '', definition: '', mechanics: [], when_used: '', advantages: [], disadvantages: [], deal_relationship: '', related_concepts: [], related_cases: [], sort_order: 99 };
    setConcepts(c => [...c, newConcept]);
    setSelected(id);
  }

  async function save() {
    await apiSave('concepts', concept, adminPw);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  async function remove() {
    if (!confirm(`Delete "${concept.title}"?`)) return;
    await apiDelete('concepts', concept.id, adminPw);
    setConcepts(concepts => concepts.filter(x => x.id !== selected));
    setSelected(concepts[0]?.id);
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, minHeight: 500 }}>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.inkLight, textTransform: 'uppercase', letterSpacing: 1 }}>Concepts</span>
          <button onClick={addNew} style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.accent, background: 'none', border: 'none', cursor: 'pointer' }}>+ New</button>
        </div>
        <div style={{ overflowY: 'auto', maxHeight: 500 }}>
          {concepts.map(x => (
            <div key={x.id} onClick={() => setSelected(x.id)}
              style={{ padding: '10px 16px', fontFamily: F.ui, fontSize: 12, color: selected === x.id ? C.accent : C.inkMid, background: selected === x.id ? '#FFFBF3' : 'transparent', borderLeft: `3px solid ${selected === x.id ? C.accent : 'transparent'}`, cursor: 'pointer', fontWeight: selected === x.id ? 600 : 400 }}>
              {x.title}<div style={{ fontSize: 10, color: C.inkLight, marginTop: 2 }}>{x.category}</div>
            </div>
          ))}
        </div>
      </div>

      {concept && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Title" value={concept.title} onChange={v => update('title', v)} single />
            <Field label="Slug (URL path)" value={concept.slug} onChange={v => update('slug', v)} single />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 12 }}>
            <Field label="Category ID (folder)" value={concept.category_id || concept.category || ''} onChange={v => update('category_id', v)} single hint="e.g. cat-merger-structures — from Folders & Categories" />
            <Field label="Category slug (legacy)" value={concept.category} onChange={v => update('category', v)} single hint="e.g. merger-structures" />
            <Field label="Order" value={String(concept.sort_order || '')} onChange={v => update('sort_order', parseInt(v) || 0)} single />
          </div>
          <ArrayField label="Folder path (breadcrumb labels, one per line)" value={concept.folder_path || []} onChange={v => update('folder_path', v)} hint="e.g. Merger Structures / Triangular Mergers — display only" />
          <Field label="Summary (one line)" value={concept.summary} onChange={v => update('summary', v)} single />
          <Field label="Definition" value={concept.definition} onChange={v => update('definition', v)} rows={4} />
          <ArrayField label="Mechanics (one step per line)" value={concept.mechanics} onChange={v => update('mechanics', v)} />
          <Field label="When Used" value={concept.when_used} onChange={v => update('when_used', v)} rows={3} />
          <ArrayField label="Advantages (one per line)" value={concept.advantages} onChange={v => update('advantages', v)} />
          <ArrayField label="Disadvantages (one per line)" value={concept.disadvantages} onChange={v => update('disadvantages', v)} />
          <Field label="Deal Relationship (Twitter/X Holdings)" value={concept.deal_relationship} onChange={v => update('deal_relationship', v)} rows={4} />
          <ArrayField label="Provision IDs (one per line)" value={concept.provision_ids} onChange={v => update('provision_ids', v)} hint="e.g. structure, mae" />
          <ArrayField label="Related Concepts (slugs, one per line)" value={concept.related_concepts} onChange={v => update('related_concepts', v)} />
          <ArrayField label="Related Cases (case IDs, one per line)" value={concept.related_cases} onChange={v => update('related_cases', v)} />
          {/* Embed syntax reminder */}
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
            <div style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 700, color: C.inkLight, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>Embed this concept in any Explainer body</div>
            <div style={{ fontFamily: F.mono, fontSize: 13, color: C.accent, userSelect: 'all' }}>
              {`[[concept:${concept.slug || 'your-slug'}]]`}
            </div>
            <div style={{ fontFamily: F.ui, fontSize: 11, color: C.inkLight, marginTop: 6 }}>Paste this token anywhere in an Explainer body — it renders as an expandable inline card.</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <SaveBtn onClick={save} saved={saved} />
            <DeleteBtn onClick={remove} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main admin page ───────────────────────────────────────────────────────────

export default function AdminEdit() {
  const router = useRouter();
  const [adminPw, setAdminPw] = useState('');
  const [provision, setProvision] = useState('structure');
  const [level, setLevel] = useState('junior');
  const [tab, setTab] = useState('explainer');

  useEffect(() => {
    const pw = sessionStorage.getItem('corpus_admin_pw');
    if (!pw) { router.replace('/admin/login'); return; }
    setAdminPw(pw);
  }, []);

  const currentProvision = PROVISIONS.find(p => p.id === provision);
  const needsLevel = ['explainer', 'qa', 'war_stories', 'annotations'].includes(tab);
  const needsProvision = !['defined_terms', 'cases', 'concepts'].includes(tab);

  const aiContext = `Provision: ${currentProvision?.title}. Level: ${level}. Content type: ${tab}.`;

  return (
    <>
      <Head><title>Corpus Admin</title><link href={GOOGLE_FONTS} rel="stylesheet" /></Head>
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: F.ui }}>

        {/* Top bar */}
        <div style={{ height: 52, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, letterSpacing: 4, color: C.ink, textTransform: 'uppercase' }}>CORPUS<span style={{ color: C.accent }}>.</span></span>
            <span style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.accent, background: '#FFF3E0', borderRadius: 4, padding: '3px 8px' }}>ADMIN</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <a href="/admin/structure" style={{ fontFamily: F.ui, fontSize: 12, color: C.inkLight, textDecoration: 'none' }}>Provisions & Folders →</a>
            <a href="/" target="_blank" style={{ fontFamily: F.ui, fontSize: 12, color: C.inkLight, textDecoration: 'none' }}>View site →</a>
            <button onClick={() => { sessionStorage.removeItem('corpus_admin_pw'); router.push('/admin/login'); }}
              style={{ fontFamily: F.ui, fontSize: 12, color: C.inkLight, background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}>Sign out</button>
          </div>
        </div>

        <div style={{ display: 'flex', height: 'calc(100vh - 52px)' }}>
          {/* Left: controls + editor */}
          <div style={{ width: '56%', overflowY: 'auto', padding: '24px 28px' }}>

            {/* Tab selector */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
              {MAIN_TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{ padding: '7px 14px', fontFamily: F.ui, fontSize: 12, fontWeight: 600, background: tab === t ? C.accent : C.white, color: tab === t ? C.white : C.inkMid, border: `1px solid ${tab === t ? C.accent : C.border}`, borderRadius: 8, cursor: 'pointer' }}>
                  {TAB_LABELS[t]}
                </button>
              ))}
            </div>

            {/* Provision + level selectors (contextual) */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              {needsProvision && (
                <div>
                  <Label>Provision</Label>
                  <select value={provision} onChange={e => setProvision(e.target.value)}
                    style={{ padding: '8px 12px', fontFamily: F.ui, fontSize: 13, color: C.ink, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, outline: 'none' }}>
                    {PROVISIONS.map(p => <option key={p.id} value={p.id}>{p.number}. {p.title}</option>)}
                  </select>
                </div>
              )}
              {needsLevel && (
                <div>
                  <Label>Level</Label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {LEVELS.map(l => (
                      <button key={l} onClick={() => setLevel(l)}
                        style={{ padding: '8px 14px', fontFamily: F.ui, fontSize: 12, fontWeight: 600, background: level === l ? C.ink : C.white, color: level === l ? C.white : C.inkMid, border: `1px solid ${level === l ? C.ink : C.border}`, borderRadius: 8, cursor: 'pointer' }}>
                        {l.charAt(0).toUpperCase() + l.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Editors */}
            {tab === 'explainer'     && <ExplainerEditor    provision={provision} level={level} adminPw={adminPw} />}
            {tab === 'qa'            && <QAEditor            provision={provision} level={level} adminPw={adminPw} />}
            {tab === 'war_stories'   && <WarStoriesEditor    provision={provision} level={level} adminPw={adminPw} />}
            {tab === 'negotiation'   && <NegotiationEditor   provision={provision} adminPw={adminPw} />}
            {tab === 'annotations'   && <AnnotationsEditor   provision={provision} level={level} adminPw={adminPw} />}
            {tab === 'defined_terms' && <DefinedTermsEditor  adminPw={adminPw} />}
            {tab === 'cases'         && <CasesEditor         adminPw={adminPw} />}
            {tab === 'concepts'      && <ConceptsEditor      adminPw={adminPw} />}
          </div>

          {/* Right: AI panel */}
          <div style={{ width: '44%', padding: '24px 28px 24px 0', display: 'flex', flexDirection: 'column' }}>
            <AIChatPanel context={aiContext} adminPw={adminPw} />
          </div>
        </div>
      </div>
    </>
  );
}
