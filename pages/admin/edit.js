import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { PROVISIONS } from '../../data/provisions';
import { QA_DATABASE } from '../../data/qa';
import { WAR_STORIES } from '../../data/warStories';
import { NEGOTIATION_POINTS } from '../../data/negotiationPoints';
import { EXPLAINERS } from '../../data/explainers';
import { GOOGLE_FONTS, C, F } from '../../data/tokens';

const LEVELS = ['junior', 'mid', 'senior'];
const CONTENT_TYPES = ['explainer', 'qa', 'war_stories', 'negotiation'];

// ─── System prompt for AI drafting ─────────────────────────────────────────────
function buildSystemPrompt(provision, level, contentType) {
  return `You are an expert M&A attorney and legal educator helping draft content for Corpus, a professional training platform that teaches merger agreements to law firm associates.

CONTEXT:
- Provision: ${provision?.title} (${provision?.sections})
- Teaching deal: Twitter / X Holdings merger agreement (April 25, 2022, $44B)
- Level: ${level === 'junior' ? 'Junior Associate (0-2 years, needs fundamentals)' : level === 'mid' ? 'Mid Associate (2-4 years, can handle nuance)' : 'Senior Associate / Counsel (4+ years, wants strategic depth)'}
- Content type: ${contentType}

STYLE:
- Write for sophisticated legal professionals, not the general public
- Be precise and substantive — no filler, no obvious statements
- Use actual deal facts from Twitter/Musk where relevant
- For war stories: first-person practitioner voice, concrete and specific
- For explainers: authoritative but accessible, building from mechanism to implication
- For Q&A: questions should be exactly what an associate would ask; answers should be what a senior partner would say

Never hedge, never over-qualify. Write like you've done this a hundred times.`;
}

// ─── AI Chat Panel ─────────────────────────────────────────────────────────────
function AIChatPanel({ provision, level, contentType, onInsert, adminPw }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminPw}`,
        },
        body: JSON.stringify({
          messages: newMessages,
          systemPrompt: buildSystemPrompt(provision, level, contentType),
        }),
      });
      const data = await res.json();
      if (data.text) {
        setMessages(m => [...m, { role: 'assistant', content: data.text }]);
      } else {
        setMessages(m => [...m, { role: 'assistant', content: `Error: ${data.error}` }]);
      }
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: `Error: ${e.message}` }]);
    }
    setLoading(false);
  }

  const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, background: C.bg, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontFamily: F.ui, fontSize: 12, fontWeight: 700, color: C.accent }}>AI Drafting Assistant</span>
          <span style={{ fontFamily: F.ui, fontSize: 11, color: C.inkLight, marginLeft: 8 }}>claude-opus-4-6</span>
        </div>
        {lastAssistantMsg && (
          <button onClick={() => onInsert(lastAssistantMsg.content)}
            style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.white, background: C.accent, border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}>
            ↑ Insert last response
          </button>
        )}
      </div>

      {/* Context badge */}
      <div style={{ padding: '8px 18px', borderBottom: `1px solid ${C.border}`, background: '#FFFBF3', display: 'flex', gap: 8 }}>
        <span style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 600, color: C.accent, background: '#FFF3E0', borderRadius: 4, padding: '2px 8px' }}>{provision?.title}</span>
        <span style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 600, color: '#1A5C35', background: '#EFF8F3', borderRadius: 4, padding: '2px 8px' }}>{level}</span>
        <span style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 600, color: C.inkLight, background: C.bg, borderRadius: 4, padding: '2px 8px' }}>{contentType}</span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ fontFamily: F.body, fontSize: 13, color: C.inkFaint, fontStyle: 'italic', textAlign: 'center', marginTop: 20 }}>
            Describe what you want to draft. The AI has full context on the provision, level, and deal.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{
            padding: '10px 14px', borderRadius: 8, maxWidth: '92%',
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            background: m.role === 'user' ? C.ink : C.bg,
            border: m.role === 'assistant' ? `1px solid ${C.border}` : 'none',
          }}>
            <pre style={{
              fontFamily: m.role === 'user' ? F.ui : F.body,
              fontSize: 13, color: m.role === 'user' ? C.white : C.inkMid,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, lineHeight: 1.7,
            }}>{m.content}</pre>
            {m.role === 'assistant' && (
              <button onClick={() => onInsert(m.content)}
                style={{ marginTop: 8, fontFamily: F.ui, fontSize: 11, color: C.accent, background: 'none', border: `1px solid ${C.accentDim}`, borderRadius: 4, padding: '3px 10px', cursor: 'pointer' }}>
                Insert →
              </button>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ padding: '10px 14px', borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, alignSelf: 'flex-start', fontFamily: F.ui, fontSize: 13, color: C.inkLight }}>
            Drafting…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 18px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 10 }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="e.g. 'Write a war story about a buyer discovering a CoC trigger after closing' · Enter to send, Shift+Enter for newline"
          rows={2}
          style={{ flex: 1, padding: '10px 14px', fontFamily: F.ui, fontSize: 13, color: C.ink, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, outline: 'none', resize: 'none', lineHeight: 1.5 }}
        />
        <button onClick={send} disabled={loading || !input.trim()}
          style={{ padding: '0 16px', background: C.ink, color: C.white, fontFamily: F.ui, fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 8, cursor: 'pointer', opacity: loading || !input.trim() ? 0.4 : 1 }}>
          Send
        </button>
      </div>
    </div>
  );
}

// ─── Field editor ──────────────────────────────────────────────────────────────
function FieldEditor({ label, value, onChange, multiline = true, rows = 6, onAIDraft }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <label style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 600, color: C.inkLight, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</label>
        {onAIDraft && (
          <button onClick={onAIDraft}
            style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 600, color: C.accent, background: '#FFF3E0', border: `1px solid ${C.accentDim}`, borderRadius: 4, padding: '3px 10px', cursor: 'pointer' }}>
            ✦ Draft with AI
          </button>
        )}
      </div>
      {multiline ? (
        <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={rows}
          style={{ width: '100%', padding: '12px 14px', fontFamily: F.body, fontSize: 13, color: C.ink, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, outline: 'none', resize: 'vertical', lineHeight: 1.7, boxSizing: 'border-box' }}
        />
      ) : (
        <input value={value || ''} onChange={e => onChange(e.target.value)}
          style={{ width: '100%', padding: '12px 14px', fontFamily: F.body, fontSize: 13, color: C.ink, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, outline: 'none', boxSizing: 'border-box' }}
        />
      )}
    </div>
  );
}

// ─── Content editors per type ──────────────────────────────────────────────────
function ExplainerEditor({ provision, level, onInsert }) {
  const initial = EXPLAINERS[provision]?.[level] || { headline: '', body: '' };
  const [data, setData] = useState(initial);
  const [saved, setSaved] = useState(false);
  const adminPw = typeof window !== 'undefined' ? sessionStorage.getItem('corpus_admin_pw') : '';

  async function save() {
    const res = await fetch('/api/admin/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminPw}` },
      body: JSON.stringify({ table: 'explainers', record: { id: `${provision}-${level}`, provision_id: provision, level, ...data } }),
    });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  }

  return (
    <div>
      <FieldEditor label="Headline" value={data.headline} onChange={v => setData(d => ({ ...d, headline: v }))} multiline={false}
        onAIDraft={() => onInsert(`Write a punchy one-sentence headline for the ${level}-level explainer of ${provision}`)} />
      <FieldEditor label="Body (separate paragraphs with blank lines)" value={data.body} onChange={v => setData(d => ({ ...d, body: v }))} rows={12}
        onAIDraft={() => onInsert(`Write the full ${level}-level explainer body for ${provision}`)} />
      <button onClick={save} style={{ padding: '10px 24px', background: saved ? '#1A5C35' : C.ink, color: C.white, fontFamily: F.ui, fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 8, cursor: 'pointer' }}>
        {saved ? '✓ Saved' : 'Save to Supabase'}
      </button>
    </div>
  );
}

function QAEditor({ provision, level, onInsert }) {
  const initial = QA_DATABASE.filter(q => q.provision_id === provision && q.level === level);
  const [items, setItems] = useState(initial.length ? initial : [{ id: `${provision}-${level}-q1`, provision_id: provision, level, question: '', answer: '', concepts: [] }]);
  const [saved, setSaved] = useState(false);
  const adminPw = typeof window !== 'undefined' ? sessionStorage.getItem('corpus_admin_pw') : '';

  function updateItem(i, field, val) {
    setItems(items => items.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  }

  function addItem() {
    setItems(items => [...items, { id: `${provision}-${level}-q${items.length + 1}`, provision_id: provision, level, question: '', answer: '', concepts: [] }]);
  }

  async function save() {
    const adminPw = sessionStorage.getItem('corpus_admin_pw');
    for (const item of items) {
      await fetch('/api/admin/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminPw}` },
        body: JSON.stringify({ table: 'qa', record: item }),
      });
    }
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      {items.map((item, i) => (
        <div key={item.id} style={{ marginBottom: 28, padding: '20px 24px', background: C.white, border: `1px solid ${C.border}`, borderRadius: 10 }}>
          <div style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 12 }}>Q{i + 1}</div>
          <FieldEditor label="Question" value={item.question} onChange={v => updateItem(i, 'question', v)} rows={2}
            onAIDraft={() => onInsert(`Write a sharp ${level}-level question about ${provision} for a merger agreement training platform`)} />
          <FieldEditor label="Answer" value={item.answer} onChange={v => updateItem(i, 'answer', v)} rows={6}
            onAIDraft={() => onInsert(`Write the answer to: "${item.question}" — ${level} level, ${provision} provision`)} />
          <FieldEditor label="Concepts (comma-separated)" value={Array.isArray(item.concepts) ? item.concepts.join(', ') : item.concepts}
            onChange={v => updateItem(i, 'concepts', v.split(',').map(s => s.trim()).filter(Boolean))} multiline={false} />
        </div>
      ))}
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button onClick={addItem} style={{ padding: '10px 20px', background: C.bg, color: C.inkMid, fontFamily: F.ui, fontSize: 13, fontWeight: 600, border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer' }}>
          + Add Question
        </button>
        <button onClick={save} style={{ padding: '10px 24px', background: saved ? '#1A5C35' : C.ink, color: C.white, fontFamily: F.ui, fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          {saved ? '✓ Saved' : 'Save All to Supabase'}
        </button>
      </div>
    </div>
  );
}

function WarStoriesEditor({ provision, level, onInsert }) {
  const initial = WAR_STORIES.filter(s => s.provision_id === provision && s.level === level);
  const [items, setItems] = useState(initial.length ? initial : [{ id: `${provision}-${level}-ws1`, provision_id: provision, level, title: '', story: '', concepts: [] }]);
  const [saved, setSaved] = useState(false);
  const adminPw = typeof window !== 'undefined' ? sessionStorage.getItem('corpus_admin_pw') : '';

  function updateItem(i, field, val) {
    setItems(items => items.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  }

  async function save() {
    const adminPw = sessionStorage.getItem('corpus_admin_pw');
    for (const item of items) {
      await fetch('/api/admin/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminPw}` },
        body: JSON.stringify({ table: 'war_stories', record: item }),
      });
    }
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      {items.map((item, i) => (
        <div key={item.id} style={{ marginBottom: 28, padding: '20px 24px', background: C.white, border: `1px solid ${C.border}`, borderRadius: 10 }}>
          <div style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 12 }}>Story {i + 1}</div>
          <FieldEditor label="Title" value={item.title} onChange={v => updateItem(i, 'title', v)} multiline={false}
            onAIDraft={() => onInsert(`Give me a punchy title for a ${level}-level war story about ${provision}`)} />
          <FieldEditor label="Story" value={item.story} onChange={v => updateItem(i, 'story', v)} rows={10}
            onAIDraft={() => onInsert(`Write a ${level}-level war story about ${provision} in the style of a senior M&A partner sharing a real anecdote from practice`)} />
          <FieldEditor label="Concepts (comma-separated)" value={Array.isArray(item.concepts) ? item.concepts.join(', ') : item.concepts}
            onChange={v => updateItem(i, 'concepts', v.split(',').map(s => s.trim()).filter(Boolean))} multiline={false} />
        </div>
      ))}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => setItems(items => [...items, { id: `${provision}-${level}-ws${items.length + 1}`, provision_id: provision, level, title: '', story: '', concepts: [] }])}
          style={{ padding: '10px 20px', background: C.bg, color: C.inkMid, fontFamily: F.ui, fontSize: 13, fontWeight: 600, border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer' }}>
          + Add Story
        </button>
        <button onClick={save} style={{ padding: '10px 24px', background: saved ? '#1A5C35' : C.ink, color: C.white, fontFamily: F.ui, fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          {saved ? '✓ Saved' : 'Save All to Supabase'}
        </button>
      </div>
    </div>
  );
}

function NegotiationEditor({ provision, onInsert }) {
  const initial = NEGOTIATION_POINTS[provision] || [];
  const [items, setItems] = useState(initial.length ? initial : [{ id: `${provision}-np1`, provision_id: provision, title: '', deal_context: '', buyer_position: '', seller_position: '', key_points: [] }]);
  const [saved, setSaved] = useState(false);

  function updateItem(i, field, val) {
    setItems(items => items.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  }

  async function save() {
    const adminPw = sessionStorage.getItem('corpus_admin_pw');
    for (const item of items) {
      await fetch('/api/admin/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminPw}` },
        body: JSON.stringify({ table: 'negotiation_points', record: item }),
      });
    }
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      {items.map((item, i) => (
        <div key={item.id} style={{ marginBottom: 28, padding: '20px 24px', background: C.white, border: `1px solid ${C.border}`, borderRadius: 10 }}>
          <div style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 12 }}>Point {i + 1}</div>
          <FieldEditor label="Title" value={item.title} onChange={v => updateItem(i, 'title', v)} multiline={false} />
          <FieldEditor label="This Deal (how it played out)" value={item.deal_context} onChange={v => updateItem(i, 'deal_context', v)} rows={2} />
          <FieldEditor label="Buyer's Position" value={item.buyer_position} onChange={v => updateItem(i, 'buyer_position', v)} rows={4}
            onAIDraft={() => onInsert(`Write the buyer's negotiating position on "${item.title}" in ${provision}`)} />
          <FieldEditor label="Seller's Position" value={item.seller_position} onChange={v => updateItem(i, 'seller_position', v)} rows={4}
            onAIDraft={() => onInsert(`Write the seller's negotiating position on "${item.title}" in ${provision}`)} />
          <FieldEditor label="Key Points (one per line)" value={Array.isArray(item.key_points) ? item.key_points.join('\n') : item.key_points}
            onChange={v => updateItem(i, 'key_points', v.split('\n').filter(Boolean))} rows={4} />
        </div>
      ))}
      <button onClick={save} style={{ padding: '10px 24px', background: saved ? '#1A5C35' : C.ink, color: C.white, fontFamily: F.ui, fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 8, cursor: 'pointer' }}>
        {saved ? '✓ Saved' : 'Save to Supabase'}
      </button>
    </div>
  );
}

// ─── Main admin page ───────────────────────────────────────────────────────────
export default function AdminEdit() {
  const router = useRouter();
  const [adminPw, setAdminPw] = useState('');
  const [provision, setProvision] = useState('structure');
  const [level, setLevel] = useState('junior');
  const [contentType, setContentType] = useState('explainer');
  const [aiPrompt, setAiPrompt] = useState('');

  useEffect(() => {
    const pw = sessionStorage.getItem('corpus_admin_pw');
    if (!pw) { router.replace('/admin/login'); return; }
    setAdminPw(pw);
  }, []);

  const currentProvision = PROVISIONS.find(p => p.id === provision);

  // When "Draft with AI" is clicked on a field, pre-fill the AI input
  function handleAIDraft(prompt) {
    setAiPrompt(prompt);
  }

  // When AI response is inserted, we just set a signal — child components listen
  function handleInsert(text) {
    // Copy to clipboard as fallback, and alert
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard — paste into the field you want to update.');
      });
    }
  }

  const needsLevel = contentType !== 'negotiation';

  return (
    <>
      <Head><title>Corpus Admin — Edit</title><link href={GOOGLE_FONTS} rel="stylesheet" /></Head>
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: F.ui }}>
        {/* Top bar */}
        <div style={{ height: 52, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, letterSpacing: 4, color: C.ink, textTransform: 'uppercase' }}>CORPUS<span style={{ color: C.accent }}>.</span></span>
            <span style={{ fontFamily: F.ui, fontSize: 12, color: C.inkLight, background: '#FFF3E0', borderRadius: 4, padding: '3px 8px', fontWeight: 600, color: C.accent }}>ADMIN</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <a href="/" target="_blank" style={{ fontFamily: F.ui, fontSize: 12, color: C.inkLight, textDecoration: 'none' }}>View site →</a>
            <button onClick={() => { sessionStorage.removeItem('corpus_admin_pw'); router.push('/admin/login'); }}
              style={{ fontFamily: F.ui, fontSize: 12, color: C.inkLight, background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}>
              Sign out
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', height: 'calc(100vh - 52px)' }}>
          {/* Left: selectors + editor */}
          <div style={{ width: '55%', overflowY: 'auto', padding: '24px 28px' }}>
            {/* Selectors */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 600, color: C.inkLight, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Provision</div>
                <select value={provision} onChange={e => setProvision(e.target.value)}
                  style={{ padding: '8px 12px', fontFamily: F.ui, fontSize: 13, color: C.ink, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, outline: 'none', cursor: 'pointer' }}>
                  {PROVISIONS.map(p => <option key={p.id} value={p.id}>{p.number}. {p.title}</option>)}
                </select>
              </div>

              {needsLevel && (
                <div>
                  <div style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 600, color: C.inkLight, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Level</div>
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

              <div>
                <div style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 600, color: C.inkLight, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Content Type</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {CONTENT_TYPES.map(ct => (
                    <button key={ct} onClick={() => setContentType(ct)}
                      style={{ padding: '8px 14px', fontFamily: F.ui, fontSize: 12, fontWeight: 600, background: contentType === ct ? C.accent : C.white, color: contentType === ct ? C.white : C.inkMid, border: `1px solid ${contentType === ct ? C.accent : C.border}`, borderRadius: 8, cursor: 'pointer' }}>
                      {ct === 'war_stories' ? 'War Stories' : ct.charAt(0).toUpperCase() + ct.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Editor heading */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: C.ink }}>
                {currentProvision?.title}
              </div>
              <div style={{ fontFamily: F.ui, fontSize: 12, color: C.inkLight, marginTop: 2 }}>
                {contentType === 'negotiation' ? 'All levels' : `${level} · ${contentType}`}
              </div>
            </div>

            {/* Editors */}
            {contentType === 'explainer'    && <ExplainerEditor   provision={provision} level={level} onInsert={setAiPrompt} />}
            {contentType === 'qa'           && <QAEditor          provision={provision} level={level} onInsert={setAiPrompt} />}
            {contentType === 'war_stories'  && <WarStoriesEditor  provision={provision} level={level} onInsert={setAiPrompt} />}
            {contentType === 'negotiation'  && <NegotiationEditor provision={provision} onInsert={setAiPrompt} />}
          </div>

          {/* Right: AI chat */}
          <div style={{ width: '45%', padding: '24px 28px 24px 0', display: 'flex', flexDirection: 'column' }}>
            <AIChatPanel
              provision={currentProvision}
              level={level}
              contentType={contentType}
              onInsert={handleInsert}
              adminPw={adminPw}
              initialPrompt={aiPrompt}
            />
          </div>
        </div>
      </div>
    </>
  );
}
