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

async function apiSave(table, record, adminPw) {
  const res = await fetch('/api/admin/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminPw}` },
    body: JSON.stringify({ table, record }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
  return res.json();
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
    <div style={{ marginBottom: 16 }}>
      {label && <Label>{label}</Label>}
      {hint && <div style={{ fontFamily: F.ui, fontSize: 11, color: C.inkFaint, marginBottom: 5, fontStyle: 'italic' }}>{hint}</div>}
      {single
        ? <input value={value || ''} onChange={e => onChange(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', fontFamily: F.body, fontSize: 13, color: C.ink, background: C.white, border: `1px solid ${C.border}`, borderRadius: 7, outline: 'none', boxSizing: 'border-box' }} />
        : <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={rows}
            style={{ width: '100%', padding: '9px 12px', fontFamily: F.body, fontSize: 13, color: C.ink, background: C.white, border: `1px solid ${C.border}`, borderRadius: 7, outline: 'none', resize: 'vertical', lineHeight: 1.7, boxSizing: 'border-box' }} />
      }
    </div>
  );
}

function ArrayField({ label, value = [], onChange, hint }) {
  const str = Array.isArray(value) ? value.join('\n') : (value || '');
  return <Field label={label} value={str} onChange={v => onChange(v.split('\n').filter(Boolean))} rows={3} hint={hint || 'One item per line'} />;
}

function SaveBtn({ onClick, saved }) {
  return (
    <button onClick={onClick}
      style={{ padding: '9px 22px', background: saved ? '#1A5C35' : C.ink, color: C.white, fontFamily: F.ui, fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 7, cursor: 'pointer', transition: 'background 0.3s' }}>
      {saved ? '✓ Saved' : 'Save to Supabase'}
    </button>
  );
}

function Btn({ onClick, children, variant = 'ghost', small = false, disabled = false, full = false }) {
  const variants = {
    ghost:  { background: 'none', color: C.inkMid, border: `1px solid ${C.border}` },
    danger: { background: 'none', color: '#8B1A1A', border: '1px solid #D4A8A8' },
    accent: { background: C.accent, color: C.white, border: 'none' },
    ink:    { background: C.ink, color: C.white, border: 'none' },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ padding: small ? '5px 11px' : '9px 18px', fontFamily: F.ui, fontSize: small ? 11 : 13, fontWeight: 600, borderRadius: 7, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.4 : 1, width: full ? '100%' : 'auto', ...variants[variant] }}>
      {children}
    </button>
  );
}

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 14, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
      <div onClick={() => setOpen(o => !o)} style={{ padding: '9px 14px', background: C.bg, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 700, color: C.inkMid, textTransform: 'uppercase', letterSpacing: 1 }}>{title}</span>
        <span style={{ color: C.inkLight, fontSize: 13 }}>{open ? '▾' : '▸'}</span>
      </div>
      {open && <div style={{ padding: '14px 14px 2px' }}>{children}</div>}
    </div>
  );
}

function EmbedToken({ prefix, id }) {
  const token = `[[${prefix}:${id || 'id'}]]`;
  return (
    <div style={{ background: '#F8F6F0', border: `1px solid ${C.border}`, borderRadius: 7, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div>
        <div style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 700, color: C.inkFaint, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 }}>Embed in Explainer body</div>
        <code style={{ fontFamily: F.mono || 'monospace', fontSize: 13, color: C.accent }}>{token}</code>
      </div>
      <Btn small onClick={() => navigator.clipboard?.writeText(token)}>Copy</Btn>
    </div>
  );
}

// ─── ConceptPicker ─────────────────────────────────────────────────────────────

function ConceptPicker({ value = [], onChange, onCreateNew, allConcepts }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = allConcepts.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.category || '').toLowerCase().includes(search.toLowerCase())
  );

  function toggle(slug) {
    onChange(value.includes(slug) ? value.filter(v => v !== slug) : [...value, slug]);
  }

  const selected = value.map(slug => allConcepts.find(c => c.slug === slug)).filter(Boolean);

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Label>Concepts</Label>
        <Btn small variant="accent" onClick={() => onCreateNew?.('')}>＋ New concept</Btn>
      </div>
      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {selected.map(c => (
            <span key={c.slug} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: '#FFF3E0', border: `1px solid ${C.accentDim || '#F0C882'}`, borderRadius: 20, fontFamily: F.ui, fontSize: 12, fontWeight: 600, color: C.accent }}>
              {c.title}
              <span onClick={() => toggle(c.slug)} style={{ cursor: 'pointer', color: C.accent, opacity: 0.5, fontSize: 14, lineHeight: 1 }}>×</span>
            </span>
          ))}
        </div>
      )}
      <div style={{ position: 'relative' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search to add…"
          style={{ width: '100%', padding: '8px 11px', fontFamily: F.ui, fontSize: 13, color: C.ink, background: C.white, border: `1px solid ${C.border}`, borderRadius: 7, outline: 'none', boxSizing: 'border-box' }} />
        {open && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: C.white, border: `1px solid ${C.border}`, borderRadius: 7, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', maxHeight: 200, overflowY: 'auto', marginTop: 2 }}>
            {filtered.length === 0
              ? <div style={{ padding: '11px 13px', fontFamily: F.ui, fontSize: 12, color: C.inkFaint }}>
                  No match — <span onClick={() => onCreateNew?.(search)} style={{ color: C.accent, cursor: 'pointer', fontWeight: 600 }}>create "{search}" →</span>
                </div>
              : filtered.map(c => (
                  <div key={c.slug} onClick={() => { toggle(c.slug); setSearch(''); }}
                    style={{ padding: '8px 13px', cursor: 'pointer', background: value.includes(c.slug) ? '#FFFBF3' : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontFamily: F.ui, fontSize: 13, fontWeight: 600, color: C.ink }}>{c.title}</div>
                      <div style={{ fontFamily: F.ui, fontSize: 10, color: C.inkFaint }}>{c.category}</div>
                    </div>
                    {value.includes(c.slug) && <span style={{ color: C.accent }}>✓</span>}
                  </div>
                ))
            }
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CasePicker ────────────────────────────────────────────────────────────────

function CasePicker({ value = [], onChange, onCreateNew, allCases }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = allCases.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.court || '').toLowerCase().includes(search.toLowerCase())
  );

  function toggle(id) {
    onChange(value.includes(id) ? value.filter(v => v !== id) : [...value, id]);
  }

  const selected = value.map(id => allCases.find(c => c.id === id)).filter(Boolean);

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Label>Cases</Label>
        <Btn small onClick={() => onCreateNew?.('')}>＋ New case</Btn>
      </div>
      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {selected.map(c => (
            <span key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: C.caseBg || '#F0F4FF', border: `1px solid ${C.caseBorder || '#B8C8F0'}`, borderRadius: 20, fontFamily: F.ui, fontSize: 12, fontWeight: 600, color: C.caseText || '#2A4A8A' }}>
              {c.name}
              <span onClick={() => toggle(c.id)} style={{ cursor: 'pointer', opacity: 0.5, fontSize: 14, lineHeight: 1 }}>×</span>
            </span>
          ))}
        </div>
      )}
      <div style={{ position: 'relative' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search to add…"
          style={{ width: '100%', padding: '8px 11px', fontFamily: F.ui, fontSize: 13, color: C.ink, background: C.white, border: `1px solid ${C.border}`, borderRadius: 7, outline: 'none', boxSizing: 'border-box' }} />
        {open && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: C.white, border: `1px solid ${C.border}`, borderRadius: 7, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', maxHeight: 200, overflowY: 'auto', marginTop: 2 }}>
            {filtered.length === 0
              ? <div style={{ padding: '11px 13px', fontFamily: F.ui, fontSize: 12, color: C.inkFaint }}>
                  No match — <span onClick={() => onCreateNew?.(search)} style={{ color: C.accent, cursor: 'pointer', fontWeight: 600 }}>add "{search}" →</span>
                </div>
              : filtered.map(c => (
                  <div key={c.id} onClick={() => { toggle(c.id); setSearch(''); }}
                    style={{ padding: '8px 13px', cursor: 'pointer', background: value.includes(c.id) ? '#F0F4FF' : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontFamily: F.ui, fontSize: 13, fontWeight: 600, color: C.ink }}>{c.name}</div>
                      <div style={{ fontFamily: F.ui, fontSize: 10, color: C.inkFaint }}>{c.court} {c.year}</div>
                    </div>
                    {value.includes(c.id) && <span style={{ color: C.caseText || '#2A4A8A' }}>✓</span>}
                  </div>
                ))
            }
          </div>
        )}
      </div>
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
    setMessages(newMessages); setInput(''); setLoading(true);
    try {
      const res = await fetch('/api/admin/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminPw}` },
        body: JSON.stringify({
          messages: newMessages,
          systemPrompt: `You are an expert M&A attorney and legal educator drafting content for Corpus — a professional training platform teaching merger agreements to law firm associates. Teaching deal: Twitter/X Holdings ($44B, April 2022). ${context} Write for sophisticated legal professionals. Precise, substantive, no filler.`,
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
      <div style={{ padding: '11px 16px', borderBottom: `1px solid ${C.border}`, background: C.bg, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: F.ui, fontSize: 12, fontWeight: 700, color: C.accent }}>AI Drafting Assistant</span>
        {lastAI && <Btn small onClick={() => navigator.clipboard?.writeText(lastAI.content)}>Copy last</Btn>}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.length === 0 && <div style={{ fontFamily: F.body, fontSize: 13, color: C.inkFaint, fontStyle: 'italic', textAlign: 'center', marginTop: 24 }}>Context loaded. Describe what to draft.</div>}
        {messages.map((m, i) => (
          <div key={i} style={{ padding: '9px 12px', borderRadius: 8, alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', background: m.role === 'user' ? C.ink : C.bg, border: m.role === 'assistant' ? `1px solid ${C.border}` : 'none', maxWidth: '93%' }}>
            <pre style={{ fontFamily: m.role === 'user' ? F.ui : F.body, fontSize: 13, color: m.role === 'user' ? C.white : C.inkMid, whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, lineHeight: 1.7 }}>{m.content}</pre>
          </div>
        ))}
        {loading && <div style={{ padding: '9px 12px', borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, alignSelf: 'flex-start', fontFamily: F.ui, fontSize: 13, color: C.inkLight }}>Drafting…</div>}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: '9px 12px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 7 }}>
        <textarea value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Describe what to draft… Enter to send"
          rows={2} style={{ flex: 1, padding: '8px 11px', fontFamily: F.ui, fontSize: 13, color: C.ink, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, outline: 'none', resize: 'none', lineHeight: 1.5 }} />
        <button onClick={send} disabled={loading || !input.trim()}
          style={{ padding: '0 13px', background: C.ink, color: C.white, fontFamily: F.ui, fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 7, cursor: 'pointer', opacity: loading || !input.trim() ? 0.4 : 1 }}>Send</button>
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
    await apiSave('explainers', { id: `${provision}-${level}`, provision_id: provision, level, ...data }, adminPw);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }
  return (
    <div>
      <Field label="Headline" value={data.headline} onChange={v => setData(d => ({ ...d, headline: v }))} single />
      <Field label="Body" value={data.body} onChange={v => setData(d => ({ ...d, body: v }))} rows={14}
        hint="Blank line = new paragraph. Embed: [[concept:slug]]  [[case:id]]" />
      <SaveBtn onClick={save} saved={saved} />
    </div>
  );
}

function QAEditor({ provision, level, adminPw, onNavigateTo, allConcepts, allCases }) {
  const initial = QA_DATABASE.filter(q => q.provision_id === provision && q.level === level);
  const [items, setItems] = useState(initial.length ? initial : [{ id: `${provision}-${level}-q1`, provision_id: provision, level, question: '', answer: '', concepts: [], cases: [] }]);
  const [saved, setSaved] = useState(false);

  function update(i, k, v) { setItems(items => items.map((item, idx) => idx === i ? { ...item, [k]: v } : item)); }
  function add() { setItems(items => [...items, { id: `${provision}-${level}-q${Date.now()}`, provision_id: provision, level, question: '', answer: '', concepts: [], cases: [] }]); }
  async function save() { for (const item of items) await apiSave('qa', item, adminPw); setSaved(true); setTimeout(() => setSaved(false), 2000); }
  async function remove(item) { await apiDelete('qa', item.id, adminPw); setItems(items => items.filter(i => i.id !== item.id)); }

  return (
    <div>
      {items.map((item, i) => (
        <div key={item.id} style={{ marginBottom: 18, padding: '16px 18px', background: C.white, border: `1px solid ${C.border}`, borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.accent }}>Q{i + 1}</span>
            <Btn small variant="danger" onClick={() => remove(item)}>Delete</Btn>
          </div>
          <Field label="Question" value={item.question} onChange={v => update(i, 'question', v)} rows={2} />
          <Field label="Answer" value={item.answer} onChange={v => update(i, 'answer', v)} rows={6} />
          <ConceptPicker value={item.concepts || []} onChange={v => update(i, 'concepts', v)} onCreateNew={name => onNavigateTo('concepts', name)} allConcepts={allConcepts} />
          <CasePicker value={item.cases || []} onChange={v => update(i, 'cases', v)} onCreateNew={() => onNavigateTo('cases')} allCases={allCases} />
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8 }}><Btn variant="ghost" onClick={add}>＋ Add Question</Btn><SaveBtn onClick={save} saved={saved} /></div>
    </div>
  );
}

function WarStoriesEditor({ provision, level, adminPw, onNavigateTo, allConcepts, allCases }) {
  const initial = WAR_STORIES.filter(s => s.provision_id === provision && s.level === level);
  const [items, setItems] = useState(initial.length ? initial : [{ id: `${provision}-${level}-ws1`, provision_id: provision, level, title: '', story: '', concepts: [], cases: [] }]);
  const [saved, setSaved] = useState(false);

  function update(i, k, v) { setItems(items => items.map((item, idx) => idx === i ? { ...item, [k]: v } : item)); }
  async function save() { for (const item of items) await apiSave('war_stories', item, adminPw); setSaved(true); setTimeout(() => setSaved(false), 2000); }
  async function remove(item) { await apiDelete('war_stories', item.id, adminPw); setItems(items => items.filter(i => i.id !== item.id)); }

  return (
    <div>
      {items.map((item, i) => (
        <div key={item.id} style={{ marginBottom: 18, padding: '16px 18px', background: C.white, border: `1px solid ${C.border}`, borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.accent }}>Story {i + 1}</span>
            <Btn small variant="danger" onClick={() => remove(item)}>Delete</Btn>
          </div>
          <Field label="Title" value={item.title} onChange={v => update(i, 'title', v)} single />
          <Field label="Story" value={item.story} onChange={v => update(i, 'story', v)} rows={9} />
          <ConceptPicker value={item.concepts || []} onChange={v => update(i, 'concepts', v)} onCreateNew={name => onNavigateTo('concepts', name)} allConcepts={allConcepts} />
          <CasePicker value={item.cases || []} onChange={v => update(i, 'cases', v)} onCreateNew={() => onNavigateTo('cases')} allCases={allCases} />
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8 }}>
        <Btn variant="ghost" onClick={() => setItems(items => [...items, { id: `${provision}-${level}-ws${Date.now()}`, provision_id: provision, level, title: '', story: '', concepts: [], cases: [] }])}>＋ Add Story</Btn>
        <SaveBtn onClick={save} saved={saved} />
      </div>
    </div>
  );
}

function NegotiationEditor({ provision, adminPw, onNavigateTo, allConcepts, allCases }) {
  const initial = NEGOTIATION_POINTS[provision] || [];
  const [items, setItems] = useState(initial.length ? initial : [{ id: `${provision}-np1`, provision_id: provision, title: '', deal_context: '', buyer_position: '', seller_position: '', key_points: [], concepts: [], cases: [] }]);
  const [saved, setSaved] = useState(false);

  function update(i, k, v) { setItems(items => items.map((item, idx) => idx === i ? { ...item, [k]: v } : item)); }
  async function save() { for (const item of items) await apiSave('negotiation_points', item, adminPw); setSaved(true); setTimeout(() => setSaved(false), 2000); }

  return (
    <div>
      {items.map((item, i) => (
        <div key={item.id} style={{ marginBottom: 18, padding: '16px 18px', background: C.white, border: `1px solid ${C.border}`, borderRadius: 8 }}>
          <span style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.accent, display: 'block', marginBottom: 12 }}>Point {i + 1}</span>
          <Field label="Title" value={item.title} onChange={v => update(i, 'title', v)} single />
          <Field label="This Deal" value={item.deal_context} onChange={v => update(i, 'deal_context', v)} rows={2} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Buyer Position" value={item.buyer_position} onChange={v => update(i, 'buyer_position', v)} rows={5} />
            <Field label="Seller Position" value={item.seller_position} onChange={v => update(i, 'seller_position', v)} rows={5} />
          </div>
          <ArrayField label="Key Points" value={item.key_points} onChange={v => update(i, 'key_points', v)} />
          <ConceptPicker value={item.concepts || []} onChange={v => update(i, 'concepts', v)} onCreateNew={name => onNavigateTo('concepts', name)} allConcepts={allConcepts} />
          <CasePicker value={item.cases || []} onChange={v => update(i, 'cases', v)} onCreateNew={() => onNavigateTo('cases')} allCases={allCases} />
        </div>
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
    for (const item of items) out[item.id] = { phrase: item.annotations?.[level]?.phrase || '', note: item.annotations?.[level]?.note || '' };
    return out;
  });
  const [saved, setSaved] = useState(false);

  async function save() {
    for (const clauseId of Object.keys(anns)) {
      await apiSave('annotations', { id: `${provision}-${clauseId}-${level}`, provision_id: provision, clause_id: clauseId, level, ...anns[clauseId] }, adminPw);
    }
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  if (!clauseData) return <div style={{ fontFamily: F.body, fontSize: 14, color: C.inkLight, padding: '20px 0' }}>No clauses defined for this provision yet.</div>;

  return (
    <div>
      {items.map(item => (
        <div key={item.id} style={{ marginBottom: 14, padding: '14px 16px', background: anns[item.id]?.phrase ? '#FFFBF3' : C.white, border: `1px solid ${anns[item.id]?.phrase ? C.accent : C.border}`, borderRadius: 8 }}>
          <div style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 8 }}>{item.label}</div>
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: C.inkLight, background: C.bg, borderRadius: 6, padding: '7px 11px', marginBottom: 12, lineHeight: 1.6, maxHeight: 56, overflow: 'hidden' }}>{item.text?.slice(0, 180)}…</div>
          <Field label="Phrase to underline" value={anns[item.id]?.phrase || ''} onChange={v => setAnns(a => ({ ...a, [item.id]: { ...a[item.id], phrase: v } }))} single hint="Copy-paste from clause text — must match exactly" />
          <Field label="Annotation note" value={anns[item.id]?.note || ''} onChange={v => setAnns(a => ({ ...a, [item.id]: { ...a[item.id], note: v } }))} rows={3} />
        </div>
      ))}
      <SaveBtn onClick={save} saved={saved} />
    </div>
  );
}

function DefinedTermsEditor({ adminPw }) {
  const [terms, setTerms] = useState(Object.values(DEFINED_TERMS));
  const [selected, setSelected] = useState(Object.values(DEFINED_TERMS)[0]?.id || null);
  const [saved, setSaved] = useState(false);
  const term = terms.find(t => t.id === selected);

  function update(k, v) { setTerms(terms => terms.map(t => t.id === selected ? { ...t, [k]: v } : t)); }
  function addNew() { const id = `term-${Date.now()}`; setTerms(t => [...t, { id, term: 'New Term', short_def: '', long: '', appears_in: [], related_cases: [], related_terms: [] }]); setSelected(id); }
  async function save() {
    await apiSave('defined_terms', { id: term.id, term: term.term, short_def: term.short || term.short_def || '', long_def: term.long || term.long_def || '', appears_in: term.appears_in || [], related_cases: term.related_cases || [], related_terms: term.related_terms || [] }, adminPw);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }
  async function remove() { if (!confirm(`Delete "${term.term}"?`)) return; await apiDelete('defined_terms', term.id, adminPw); setTerms(t => t.filter(x => x.id !== selected)); setSelected(terms[0]?.id); }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16 }}>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '9px 13px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 700, color: C.inkLight, textTransform: 'uppercase', letterSpacing: 1 }}>Terms</span>
          <button onClick={addNew} style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.accent, background: 'none', border: 'none', cursor: 'pointer' }}>+ New</button>
        </div>
        <div style={{ overflowY: 'auto', maxHeight: 520 }}>
          {terms.map(t => (
            <div key={t.id} onClick={() => setSelected(t.id)}
              style={{ padding: '8px 13px', fontFamily: F.ui, fontSize: 12, color: selected === t.id ? C.accent : C.inkMid, background: selected === t.id ? '#FFFBF3' : 'transparent', borderLeft: `3px solid ${selected === t.id ? C.accent : 'transparent'}`, cursor: 'pointer', fontWeight: selected === t.id ? 600 : 400 }}>
              {t.term}
            </div>
          ))}
        </div>
      </div>
      {term && (
        <div>
          <Field label="Term (must match clause text exactly)" value={term.term} onChange={v => update('term', v)} single />
          <Field label="Short definition (tooltip)" value={term.short || term.short_def} onChange={v => update('short', v)} rows={2} />
          <Field label="Long definition (term panel)" value={term.long || term.long_def} onChange={v => update('long', v)} rows={8} />
          <ArrayField label="Appears in (provision IDs)" value={term.appears_in} onChange={v => update('appears_in', v)} hint="e.g. structure, mae" />
          <ArrayField label="Related cases (case IDs)" value={term.related_cases} onChange={v => update('related_cases', v)} />
          <ArrayField label="Related terms (term IDs)" value={term.related_terms} onChange={v => update('related_terms', v)} />
          <div style={{ display: 'flex', gap: 8 }}><SaveBtn onClick={save} saved={saved} /><Btn variant="danger" onClick={remove}>Delete</Btn></div>
        </div>
      )}
    </div>
  );
}

// ─── Cases Editor ──────────────────────────────────────────────────────────────

function CasesEditor({ adminPw, prefillName, setCasesRef }) {
  const [cases, setCasesState] = useState(Object.values(CASES));
  const [selected, setSelected] = useState(Object.values(CASES)[0]?.id || null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Quick-add
  const [qName, setQName] = useState(prefillName || '');
  const [qCourt, setQCourt] = useState('Del. Ch.');
  const [qYear, setQYear] = useState(String(new Date().getFullYear()));
  const [adding, setAdding] = useState(false);

  // Expose setter so parent can sync allCases
  useEffect(() => { if (setCasesRef) setCasesRef(setCasesState); }, []);

  const c = cases.find(x => x.id === selected);
  function update(k, v) { setCasesState(cases => cases.map(x => x.id === selected ? { ...x, [k]: v } : x)); }

  async function quickAdd() {
    if (!qName.trim()) return;
    setAdding(true); setError('');
    const id = `case-${Date.now()}`;
    const stub = { id, name: qName.trim(), court: qCourt, year: parseInt(qYear) || new Date().getFullYear(), cite: '', summary: '', holdings: [], provisions: [], terms: [], full_decision: '', decision_url: '' };
    try { await apiSave('cases', stub, adminPw); setCasesState(c => [...c, stub]); setSelected(id); setQName(''); }
    catch (e) { setError(e.message); }
    setAdding(false);
  }

  async function save() {
    try { await apiSave('cases', c, adminPw); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    catch (e) { setError(e.message); }
  }

  async function remove() {
    if (!confirm(`Delete "${c.name}"?`)) return;
    await apiDelete('cases', c.id, adminPw);
    setCasesState(cases => cases.filter(x => x.id !== selected));
    setSelected(cases[0]?.id);
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr', gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Quick-add */}
        <div style={{ background: C.white, border: `1px solid ${C.accent}`, borderRadius: 8, padding: '13px' }}>
          <div style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 9 }}>＋ New Case</div>
          <input value={qName} onChange={e => setQName(e.target.value)} onKeyDown={e => e.key === 'Enter' && quickAdd()} placeholder="Case name *"
            style={{ width: '100%', padding: '7px 9px', fontFamily: F.ui, fontSize: 12, color: C.ink, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, outline: 'none', marginBottom: 5, boxSizing: 'border-box' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 55px', gap: 5, marginBottom: 7 }}>
            <input value={qCourt} onChange={e => setQCourt(e.target.value)} placeholder="Court"
              style={{ padding: '6px 9px', fontFamily: F.ui, fontSize: 12, color: C.ink, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, outline: 'none', boxSizing: 'border-box' }} />
            <input value={qYear} onChange={e => setQYear(e.target.value)} placeholder="Year"
              style={{ padding: '6px 9px', fontFamily: F.ui, fontSize: 12, color: C.ink, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <button onClick={quickAdd} disabled={!qName.trim() || adding}
            style={{ width: '100%', padding: '7px', fontFamily: F.ui, fontSize: 12, fontWeight: 700, color: C.white, background: qName.trim() ? C.accent : '#CCC', border: 'none', borderRadius: 6, cursor: qName.trim() ? 'pointer' : 'default' }}>
            {adding ? 'Adding…' : 'Create & edit →'}
          </button>
        </div>
        {/* List */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden', flex: 1 }}>
          <div style={{ padding: '8px 13px', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 700, color: C.inkLight, textTransform: 'uppercase', letterSpacing: 1 }}>All Cases ({cases.length})</span>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 400 }}>
            {cases.map(x => (
              <div key={x.id} onClick={() => setSelected(x.id)}
                style={{ padding: '8px 13px', cursor: 'pointer', background: selected === x.id ? (C.caseBg || '#F0F4FF') : 'transparent', borderLeft: `3px solid ${selected === x.id ? (C.caseText || '#2A4A8A') : 'transparent'}` }}>
                <div style={{ fontFamily: F.ui, fontSize: 12, fontWeight: 600, color: selected === x.id ? (C.caseText || '#2A4A8A') : C.inkMid }}>{x.name}</div>
                <div style={{ fontFamily: F.ui, fontSize: 10, color: C.inkFaint, marginTop: 1 }}>{x.court} {x.year}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {c && (
        <div style={{ overflowY: 'auto' }}>
          {error && <div style={{ padding: '7px 11px', background: '#FBF0F0', border: '1px solid #D4A8A8', borderRadius: 6, fontFamily: F.ui, fontSize: 12, color: '#8B1A1A', marginBottom: 12 }}>{error}</div>}

          <Section title="Basic Info">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 1fr', gap: 10 }}>
              <Field label="Case Name" value={c.name} onChange={v => update('name', v)} single />
              <Field label="Year" value={String(c.year || '')} onChange={v => update('year', parseInt(v) || v)} single />
              <Field label="Court" value={c.court} onChange={v => update('court', v)} single />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Citation" value={c.cite} onChange={v => update('cite', v)} single />
              <Field label="Decision URL" value={c.decision_url || ''} onChange={v => update('decision_url', v)} single hint="Link to full opinion" />
            </div>
            <Field label="Category ID" value={c.category_id || ''} onChange={v => update('category_id', v)} single hint="e.g. cat-delaware" />
          </Section>

          <Section title="Summary & Holdings">
            <Field label="Summary" value={c.summary} onChange={v => update('summary', v)} rows={4} />
            <ArrayField label="Holdings (one per line)" value={c.holdings} onChange={v => update('holdings', v)} />
          </Section>

          <Section title="Linked Content">
            <ArrayField label="Provisions (one per line)" value={c.provisions} onChange={v => update('provisions', v)} hint="e.g. structure, mae" />
            <ArrayField label="Terms (one per line)" value={c.terms} onChange={v => update('terms', v)} />
          </Section>

          <Section title="Full Decision Text" defaultOpen={false}>
            <Field label="" value={c.full_decision || ''} onChange={v => update('full_decision', v)} rows={18} hint="Paste full opinion text." />
          </Section>

          <EmbedToken prefix="case" id={c.id} />
          <div style={{ display: 'flex', gap: 8 }}><SaveBtn onClick={save} saved={saved} /><Btn variant="danger" onClick={remove}>Delete</Btn></div>
        </div>
      )}
    </div>
  );
}

// ─── Concepts Editor ───────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { id: 'cat-merger-structures', label: 'Merger Structures' },
  { id: 'cat-mae',               label: 'MAE Standards' },
  { id: 'cat-earnouts',          label: 'Earnout Mechanics' },
  { id: 'cat-rw',                label: 'Reps & Warranties' },
];

function ConceptsEditor({ adminPw, prefillTitle }) {
  const [concepts, setConcepts] = useState(Object.values(CONCEPTS));
  const [selected, setSelected] = useState(Object.values(CONCEPTS)[0]?.id || null);
  const [saved, setSaved] = useState(false);

  // Quick-add
  const [qTitle, setQTitle] = useState(prefillTitle || '');
  const [qCat, setQCat] = useState('cat-merger-structures');
  const [adding, setAdding] = useState(false);

  const concept = concepts.find(x => x.id === selected);
  function update(k, v) { setConcepts(concepts => concepts.map(x => x.id === selected ? { ...x, [k]: v } : x)); }

  async function quickAdd() {
    if (!qTitle.trim()) return;
    setAdding(true);
    const id = `concept-${Date.now()}`;
    const slug = qTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const stub = { id, slug, title: qTitle.trim(), category: qCat, category_id: qCat, provision_ids: [], summary: '', definition: '', mechanics: [], when_used: '', advantages: [], disadvantages: [], deal_relationship: '', related_concepts: [], related_cases: [], sort_order: 99 };
    try { await apiSave('concepts', stub, adminPw); setConcepts(c => [...c, stub]); setSelected(id); setQTitle(''); }
    catch {}
    setAdding(false);
  }

  async function save() { await apiSave('concepts', concept, adminPw); setSaved(true); setTimeout(() => setSaved(false), 2000); }
  async function remove() {
    if (!confirm(`Delete "${concept.title}"?`)) return;
    await apiDelete('concepts', concept.id, adminPw);
    setConcepts(concepts => concepts.filter(x => x.id !== selected));
    setSelected(concepts[0]?.id);
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr', gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Quick-add */}
        <div style={{ background: C.white, border: `1px solid ${C.accent}`, borderRadius: 8, padding: '13px' }}>
          <div style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 9 }}>＋ New Concept</div>
          <input value={qTitle} onChange={e => setQTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && quickAdd()} placeholder="Title *"
            style={{ width: '100%', padding: '7px 9px', fontFamily: F.ui, fontSize: 12, color: C.ink, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, outline: 'none', marginBottom: 5, boxSizing: 'border-box' }} />
          <select value={qCat} onChange={e => setQCat(e.target.value)}
            style={{ width: '100%', padding: '6px 9px', fontFamily: F.ui, fontSize: 12, color: C.ink, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, outline: 'none', marginBottom: 7, boxSizing: 'border-box' }}>
            {CATEGORY_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
          <button onClick={quickAdd} disabled={!qTitle.trim() || adding}
            style={{ width: '100%', padding: '7px', fontFamily: F.ui, fontSize: 12, fontWeight: 700, color: C.white, background: qTitle.trim() ? C.accent : '#CCC', border: 'none', borderRadius: 6, cursor: qTitle.trim() ? 'pointer' : 'default' }}>
            {adding ? 'Creating…' : 'Create & edit →'}
          </button>
        </div>
        {/* List grouped by category */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden', flex: 1 }}>
          <div style={{ padding: '8px 13px', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 700, color: C.inkLight, textTransform: 'uppercase', letterSpacing: 1 }}>All ({concepts.length})</span>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 400 }}>
            {CATEGORY_OPTIONS.map(cat => {
              const group = concepts.filter(x => (x.category_id || x.category) === cat.id);
              if (!group.length) return null;
              return (
                <div key={cat.id}>
                  <div style={{ padding: '5px 13px', fontFamily: F.ui, fontSize: 10, fontWeight: 700, color: C.inkFaint, textTransform: 'uppercase', letterSpacing: 1, background: C.bg }}>{cat.label}</div>
                  {group.map(x => (
                    <div key={x.id} onClick={() => setSelected(x.id)}
                      style={{ padding: '7px 13px 7px 18px', cursor: 'pointer', background: selected === x.id ? '#FFFBF3' : 'transparent', borderLeft: `3px solid ${selected === x.id ? C.accent : 'transparent'}` }}>
                      <div style={{ fontFamily: F.ui, fontSize: 12, fontWeight: 600, color: selected === x.id ? C.accent : C.inkMid }}>{x.title}</div>
                      {x.summary && <div style={{ fontFamily: F.ui, fontSize: 10, color: C.inkFaint, marginTop: 1, overflow: 'hidden', maxHeight: 26, lineHeight: 1.4 }}>{x.summary}</div>}
                    </div>
                  ))}
                </div>
              );
            })}
            {concepts.filter(x => !CATEGORY_OPTIONS.find(c => c.id === (x.category_id || x.category))).map(x => (
              <div key={x.id} onClick={() => setSelected(x.id)}
                style={{ padding: '7px 13px', cursor: 'pointer', background: selected === x.id ? '#FFFBF3' : 'transparent', borderLeft: `3px solid ${selected === x.id ? C.accent : 'transparent'}` }}>
                <div style={{ fontFamily: F.ui, fontSize: 12, fontWeight: 600, color: selected === x.id ? C.accent : C.inkMid }}>{x.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {concept && (
        <div style={{ overflowY: 'auto' }}>
          <Section title="Identity">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Title" value={concept.title} onChange={v => update('title', v)} single />
              <Field label="Slug" value={concept.slug} onChange={v => update('slug', v)} single hint="URL path — change carefully" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: 10 }}>
              <div style={{ marginBottom: 16 }}>
                <Label>Folder / Category</Label>
                <select value={concept.category_id || concept.category || ''} onChange={e => { update('category_id', e.target.value); update('category', e.target.value); }}
                  style={{ width: '100%', padding: '9px 11px', fontFamily: F.ui, fontSize: 13, color: C.ink, background: C.white, border: `1px solid ${C.border}`, borderRadius: 7, outline: 'none', boxSizing: 'border-box' }}>
                  {CATEGORY_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                  <option value="">— Uncategorized —</option>
                </select>
              </div>
              <Field label="Order" value={String(concept.sort_order || '')} onChange={v => update('sort_order', parseInt(v) || 0)} single />
            </div>
            <Field label="Summary (one line — shown in lists and cards)" value={concept.summary} onChange={v => update('summary', v)} single />
            <ArrayField label="Provision IDs (one per line)" value={concept.provision_ids} onChange={v => update('provision_ids', v)} hint="e.g. structure, mae" />
          </Section>

          <Section title="Core Content">
            <Field label="Definition" value={concept.definition} onChange={v => update('definition', v)} rows={4} />
            <ArrayField label="Mechanics (one step per line)" value={concept.mechanics} onChange={v => update('mechanics', v)} />
            <Field label="When Used" value={concept.when_used} onChange={v => update('when_used', v)} rows={3} />
          </Section>

          <Section title="Analysis" defaultOpen={false}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <ArrayField label="Advantages" value={concept.advantages} onChange={v => update('advantages', v)} />
              <ArrayField label="Disadvantages" value={concept.disadvantages} onChange={v => update('disadvantages', v)} />
            </div>
            <Field label="Twitter/X Holdings — why used or not" value={concept.deal_relationship} onChange={v => update('deal_relationship', v)} rows={4} />
          </Section>

          <Section title="Related Items" defaultOpen={false}>
            <ArrayField label="Related Concepts (slugs)" value={concept.related_concepts} onChange={v => update('related_concepts', v)} />
            <ArrayField label="Related Cases (case IDs)" value={concept.related_cases} onChange={v => update('related_cases', v)} />
          </Section>

          <EmbedToken prefix="concept" id={concept.slug} />
          <div style={{ display: 'flex', gap: 8 }}><SaveBtn onClick={save} saved={saved} /><Btn variant="danger" onClick={remove}>Delete</Btn></div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AdminEdit() {
  const router = useRouter();
  const [adminPw, setAdminPw] = useState('');
  const [provision, setProvision] = useState('structure');
  const [level, setLevel] = useState('junior');
  const [tab, setTab] = useState('explainer');
  const [conceptPrefill, setConceptPrefill] = useState('');
  const [casePrefill, setCasePrefill] = useState('');

  // Live concept/case lists — updated when new items are created in their editors
  const [allConcepts, setAllConcepts] = useState(Object.values(CONCEPTS));
  const [allCases, setAllCases] = useState(Object.values(CASES));

  useEffect(() => {
    const pw = sessionStorage.getItem('corpus_admin_pw');
    if (!pw) { router.replace('/admin/login'); return; }
    setAdminPw(pw);
  }, []);

  function navigateTo(targetTab, prefill = '') {
    if (targetTab === 'concepts') { setConceptPrefill(prefill); setTab('concepts'); }
    if (targetTab === 'cases')    { setCasePrefill(prefill);    setTab('cases'); }
    document.getElementById('editor-pane')?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const needsLevel = ['explainer', 'qa', 'war_stories', 'annotations'].includes(tab);
  const needsProvision = !['defined_terms', 'cases', 'concepts'].includes(tab);
  const aiContext = `Provision: ${PROVISIONS.find(p => p.id === provision)?.title || ''}. Level: ${level}. Content type: ${TAB_LABELS[tab]}.`;

  return (
    <>
      <Head><title>Corpus Admin</title><link href={GOOGLE_FONTS} rel="stylesheet" /></Head>
      <div style={{ minHeight: '100vh', background: C.bg }}>
        {/* Top bar */}
        <div style={{ height: 50, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 300, letterSpacing: 4, color: C.ink, textTransform: 'uppercase' }}>CORPUS<span style={{ color: C.accent }}>.</span></span>
            <span style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 700, color: C.accent, background: '#FFF3E0', borderRadius: 4, padding: '3px 7px' }}>ADMIN</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <a href="/admin/structure" style={{ fontFamily: F.ui, fontSize: 12, color: C.inkLight, textDecoration: 'none' }}>Provisions & Folders</a>
            <a href="/" target="_blank" style={{ fontFamily: F.ui, fontSize: 12, color: C.inkLight, textDecoration: 'none' }}>View site →</a>
            <button onClick={() => { sessionStorage.removeItem('corpus_admin_pw'); router.push('/admin/login'); }}
              style={{ fontFamily: F.ui, fontSize: 12, color: C.inkLight, background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 11px', cursor: 'pointer' }}>Sign out</button>
          </div>
        </div>

        <div style={{ display: 'flex', height: 'calc(100vh - 50px)' }}>
          <div id="editor-pane" style={{ width: '57%', overflowY: 'auto', padding: '20px 24px' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 5, marginBottom: 16, flexWrap: 'wrap' }}>
              {MAIN_TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{ padding: '6px 13px', fontFamily: F.ui, fontSize: 12, fontWeight: 600, background: tab === t ? C.accent : C.white, color: tab === t ? C.white : C.inkMid, border: `1px solid ${tab === t ? C.accent : C.border}`, borderRadius: 7, cursor: 'pointer' }}>
                  {TAB_LABELS[t]}
                </button>
              ))}
            </div>

            {/* Provision + level */}
            {(needsProvision || needsLevel) && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                {needsProvision && (
                  <div>
                    <Label>Provision</Label>
                    <select value={provision} onChange={e => setProvision(e.target.value)}
                      style={{ padding: '7px 11px', fontFamily: F.ui, fontSize: 13, color: C.ink, background: C.white, border: `1px solid ${C.border}`, borderRadius: 7, outline: 'none' }}>
                      {PROVISIONS.map(p => <option key={p.id} value={p.id}>{p.number}. {p.title}</option>)}
                    </select>
                  </div>
                )}
                {needsLevel && (
                  <div>
                    <Label>Level</Label>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {LEVELS.map(l => (
                        <button key={l} onClick={() => setLevel(l)}
                          style={{ padding: '7px 13px', fontFamily: F.ui, fontSize: 12, fontWeight: 600, background: level === l ? C.ink : C.white, color: level === l ? C.white : C.inkMid, border: `1px solid ${level === l ? C.ink : C.border}`, borderRadius: 7, cursor: 'pointer' }}>
                          {l.charAt(0).toUpperCase() + l.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'explainer'     && <ExplainerEditor  provision={provision} level={level} adminPw={adminPw} />}
            {tab === 'qa'            && <QAEditor          provision={provision} level={level} adminPw={adminPw} onNavigateTo={navigateTo} allConcepts={allConcepts} allCases={allCases} />}
            {tab === 'war_stories'   && <WarStoriesEditor  provision={provision} level={level} adminPw={adminPw} onNavigateTo={navigateTo} allConcepts={allConcepts} allCases={allCases} />}
            {tab === 'negotiation'   && <NegotiationEditor provision={provision} adminPw={adminPw} onNavigateTo={navigateTo} allConcepts={allConcepts} allCases={allCases} />}
            {tab === 'annotations'   && <AnnotationsEditor provision={provision} level={level} adminPw={adminPw} />}
            {tab === 'defined_terms' && <DefinedTermsEditor adminPw={adminPw} />}
            {tab === 'cases'         && <CasesEditor adminPw={adminPw} prefillName={casePrefill} />}
            {tab === 'concepts'      && <ConceptsEditor adminPw={adminPw} prefillTitle={conceptPrefill} />}
          </div>

          <div style={{ width: '43%', padding: '20px 22px 20px 0', display: 'flex', flexDirection: 'column' }}>
            <AIChatPanel context={aiContext} adminPw={adminPw} />
          </div>
        </div>
      </div>
    </>
  );
}
