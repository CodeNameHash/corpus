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
      <Field label="Body (blank line = new paragraph — use [[concept:slug]] or [[case:id]] to embed)" value={data.body} onChange={v => setData(d => ({ ...d, body: v }))} rows={14} />
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
          <Field label="​​​​​​​​​​​​​​​​
