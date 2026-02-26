import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { PROVISIONS } from '../../data/provisions';
import { CONCEPT_CATEGORIES } from '../../data/concepts';
import { GOOGLE_FONTS, C, F } from '../../data/tokens';

function Label({ children }) {
  return <div style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 700, color: C.inkLight, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 }}>{children}</div>;
}

function Field({ label, value, onChange, rows = 3, single = false, hint }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <Label>{label}</Label>}
      {hint && <div style={{ fontFamily: F.ui, fontSize: 11, color: C.inkLight, marginBottom: 5, fontStyle: 'italic' }}>{hint}</div>}
      {single
        ? <input value={value || ''} onChange={e => onChange(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', fontFamily: F.body, fontSize: 13, color: C.ink, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, outline: 'none', boxSizing: 'border-box' }} />
        : <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={rows}
            style={{ width: '100%', padding: '10px 14px', fontFamily: F.body, fontSize: 13, color: C.ink, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, outline: 'none', resize: 'vertical', lineHeight: 1.7, boxSizing: 'border-box' }} />
      }
    </div>
  );
}

function SaveBtn({ onClick, saved }) {
  return (
    <button onClick={onClick}
      style={{ padding: '10px 24px', background: saved ? '#1A5C35' : C.ink, color: C.white, fontFamily: F.ui, fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'background 0.3s' }}>
      {saved ? '✓ Saved' : 'Save to Supabase'}
    </button>
  );
}

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

// ─── Provisions Editor ────────────────────────────────────────────────────────

function ProvisionsEditor({ adminPw }) {
  const [provisions, setProvisions] = useState(PROVISIONS);
  const [selected, setSelected] = useState(PROVISIONS[0]?.id);
  const [saved, setSaved] = useState(false);

  const p = provisions.find(x => x.id === selected);

  function update(k, v) { setProvisions(ps => ps.map(x => x.id === selected ? { ...x, [k]: v } : x)); }

  function addNew() {
    const id = `provision-${Date.now()}`;
    const newP = { id, number: provisions.length + 1, title: 'New Provision', deal: 'Twitter / X Holdings', deal_date: 'Apr. 25, 2022', sections: '', description: '', sort_order: provisions.length + 1 };
    setProvisions(ps => [...ps, newP]);
    setSelected(id);
  }

  async function save() {
    await apiSave('provisions', p, adminPw);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  async function remove() {
    if (!confirm(`Delete "${p.title}"?`)) return;
    await apiDelete('provisions', p.id, adminPw);
    setProvisions(ps => ps.filter(x => x.id !== selected));
    setSelected(provisions[0]?.id);
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, minHeight: 400 }}>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.inkLight, textTransform: 'uppercase', letterSpacing: 1 }}>Provisions</span>
          <button onClick={addNew} style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.accent, background: 'none', border: 'none', cursor: 'pointer' }}>+ New</button>
        </div>
        {provisions.map(x => (
          <div key={x.id} onClick={() => setSelected(x.id)}
            style={{ padding: '10px 16px', fontFamily: F.ui, fontSize: 12, color: selected === x.id ? C.accent : C.inkMid, background: selected === x.id ? '#FFFBF3' : 'transparent', borderLeft: `3px solid ${selected === x.id ? C.accent : 'transparent'}`, cursor: 'pointer', fontWeight: selected === x.id ? 600 : 400 }}>
            <span style={{ color: C.inkFaint, marginRight: 6 }}>{x.number}.</span>{x.title}
          </div>
        ))}
      </div>

      {p && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 12 }}>
            <Field label="No." value={String(p.number || '')} onChange={v => update('number', parseInt(v) || v)} single />
            <Field label="Title" value={p.title} onChange={v => update('title', v)} single />
          </div>
          <Field label="ID (used in all references — change carefully)" value={p.id} onChange={v => update('id', v)} single hint="e.g. structure, mae, termination — must be unique" />
          <Field label="Sections" value={p.sections} onChange={v => update('sections', v)} single hint="e.g. §§ 2.1–2.3" />
          <Field label="Deal" value={p.deal} onChange={v => update('deal', v)} single />
          <Field label="Deal Date" value={p.deal_date} onChange={v => update('deal_date', v)} single />
          <Field label="Description" value={p.description} onChange={v => update('description', v)} rows={3} />
          <Field label="Sort Order" value={String(p.sort_order || '')} onChange={v => update('sort_order', parseInt(v) || 0)} single />
          <div style={{ display: 'flex', gap: 10 }}>
            <SaveBtn onClick={save} saved={saved} />
            <button onClick={remove} style={{ padding: '10px 18px', background: 'none', color: '#8B1A1A', fontFamily: F.ui, fontSize: 13, fontWeight: 600, border: `1px solid #D4A8A8`, borderRadius: 8, cursor: 'pointer' }}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Categories Editor ────────────────────────────────────────────────────────

const SEED_CATEGORIES = [
  { id: 'cat-merger-structures', slug: 'merger-structures', label: 'Merger Structures', type: 'concept', icon: '⬡', sort_order: 1 },
  { id: 'cat-mae',               slug: 'mae-standards',     label: 'MAE Standards',     type: 'concept', icon: '⚖', sort_order: 2 },
  { id: 'cat-earnouts',          slug: 'earnout-mechanics', label: 'Earnout Mechanics',  type: 'concept', icon: '📊', sort_order: 3 },
  { id: 'cat-rw',                slug: 'rep-warranty',      label: 'Reps & Warranties',  type: 'concept', icon: '✓', sort_order: 4 },
  { id: 'cat-delaware',          slug: 'delaware-law',      label: 'Delaware Case Law',  type: 'case',    icon: '⚖', sort_order: 1 },
  { id: 'cat-mac',               slug: 'mac-cases',         label: 'MAE/MAC Cases',      type: 'case',    icon: '📋', sort_order: 2 },
];

function CategoriesEditor({ adminPw }) {
  const [categories, setCategories] = useState(SEED_CATEGORIES);
  const [selected, setSelected] = useState(SEED_CATEGORIES[0]?.id);
  const [saved, setSaved] = useState(false);

  const cat = categories.find(x => x.id === selected);

  function update(k, v) { setCategories(cs => cs.map(x => x.id === selected ? { ...x, [k]: v } : x)); }

  function addNew() {
    const id = `cat-${Date.now()}`;
    const newCat = { id, slug: `new-category-${Date.now()}`, label: 'New Category', type: 'concept', icon: '◆', sort_order: categories.length + 1, description: '' };
    setCategories(cs => [...cs, newCat]);
    setSelected(id);
  }

  async function save() {
    await apiSave('categories', cat, adminPw);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  async function remove() {
    if (!confirm(`Delete "${cat.label}"?`)) return;
    await apiDelete('categories', cat.id, adminPw);
    setCategories(cs => cs.filter(x => x.id !== selected));
    setSelected(categories[0]?.id);
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, minHeight: 400 }}>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.inkLight, textTransform: 'uppercase', letterSpacing: 1 }}>Categories</span>
          <button onClick={addNew} style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.accent, background: 'none', border: 'none', cursor: 'pointer' }}>+ New</button>
        </div>
        {['concept', 'case'].map(type => (
          <div key={type}>
            <div style={{ padding: '6px 16px', fontFamily: F.ui, fontSize: 10, fontWeight: 700, color: C.inkFaint, textTransform: 'uppercase', letterSpacing: 1, background: C.bg }}>
              {type === 'concept' ? 'Concept Folders' : 'Case Folders'}
            </div>
            {categories.filter(x => x.type === type).map(x => (
              <div key={x.id} onClick={() => setSelected(x.id)}
                style={{ padding: '10px 16px', fontFamily: F.ui, fontSize: 12, color: selected === x.id ? C.accent : C.inkMid, background: selected === x.id ? '#FFFBF3' : 'transparent', borderLeft: `3px solid ${selected === x.id ? C.accent : 'transparent'}`, cursor: 'pointer', fontWeight: selected === x.id ? 600 : 400, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{x.icon}</span>{x.label}
              </div>
            ))}
          </div>
        ))}
      </div>

      {cat && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: 12 }}>
            <Field label="Label" value={cat.label} onChange={v => update('label', v)} single />
            <Field label="Icon" value={cat.icon} onChange={v => update('icon', v)} single hint="emoji" />
          </div>
          <Field label="Slug (URL-safe ID)" value={cat.slug} onChange={v => update('slug', v)} single hint="e.g. merger-structures, mae-standards" />
          <div style={{ marginBottom: 16 }}>
            <Label>Type</Label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['concept', 'case'].map(t => (
                <button key={t} onClick={() => update('type', t)}
                  style={{ padding: '8px 16px', fontFamily: F.ui, fontSize: 12, fontWeight: 600, background: cat.type === t ? C.ink : C.white, color: cat.type === t ? C.white : C.inkMid, border: `1px solid ${cat.type === t ? C.ink : C.border}`, borderRadius: 8, cursor: 'pointer' }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)} folder
                </button>
              ))}
            </div>
          </div>
          <Field label="Description" value={cat.description} onChange={v => update('description', v)} rows={2} />
          <Field label="Sort Order" value={String(cat.sort_order || '')} onChange={v => update('sort_order', parseInt(v) || 0)} single />
          <Field label="Parent Category ID (for nested folders, optional)" value={cat.parent_id || ''} onChange={v => update('parent_id', v || null)} single />
          <div style={{ display: 'flex', gap: 10 }}>
            <SaveBtn onClick={save} saved={saved} />
            <button onClick={remove} style={{ padding: '10px 18px', background: 'none', color: '#8B1A1A', fontFamily: F.ui, fontSize: 13, fontWeight: 600, border: `1px solid #D4A8A8`, borderRadius: 8, cursor: 'pointer' }}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminStructure() {
  const router = useRouter();
  const [adminPw, setAdminPw] = useState('');
  const [tab, setTab] = useState('provisions');

  useEffect(() => {
    const pw = sessionStorage.getItem('corpus_admin_pw');
    if (!pw) { router.replace('/admin/login'); return; }
    setAdminPw(pw);
  }, []);

  return (
    <>
      <Head><title>Corpus Admin — Structure</title><link href={GOOGLE_FONTS} rel="stylesheet" /></Head>
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: F.ui }}>
        {/* Top bar */}
        <div style={{ height: 52, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a href="/admin/edit" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, letterSpacing: 4, color: C.ink, textTransform: 'uppercase', textDecoration: 'none' }}>CORPUS<span style={{ color: C.accent }}>.</span></a>
            <span style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.accent, background: '#FFF3E0', borderRadius: 4, padding: '3px 8px' }}>STRUCTURE</span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <a href="/admin/edit" style={{ fontFamily: F.ui, fontSize: 12, color: C.inkLight, textDecoration: 'none' }}>← Content editor</a>
            <a href="/" target="_blank" style={{ fontFamily: F.ui, fontSize: 12, color: C.inkLight, textDecoration: 'none' }}>View site →</a>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 28px' }}>
          {/* Tab selector */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
            {[['provisions', 'Provisions'], ['categories', 'Folders & Categories']].map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: '9px 20px', fontFamily: F.ui, fontSize: 13, fontWeight: 600, background: tab === t ? C.accent : C.white, color: tab === t ? C.white : C.inkMid, border: `1px solid ${tab === t ? C.accent : C.border}`, borderRadius: 8, cursor: 'pointer' }}>
                {label}
              </button>
            ))}
          </div>

          {tab === 'provisions' && (
            <>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.ink, marginBottom: 6 }}>Provisions</div>
                <div style={{ fontFamily: F.body, fontSize: 13, color: C.inkLight, lineHeight: 1.7 }}>
                  Provisions are the top-level learning units. The ID field is the key used across all content tables — changing an ID will break existing references.
                </div>
              </div>
              <ProvisionsEditor adminPw={adminPw} />
            </>
          )}

          {tab === 'categories' && (
            <>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.ink, marginBottom: 6 }}>Folders & Categories</div>
                <div style={{ fontFamily: F.body, fontSize: 13, color: C.inkLight, lineHeight: 1.7 }}>
                  Categories group concepts and cases into folders. Assign a category to a concept or case in the content editor. Nested folders are supported via Parent Category ID.
                </div>
              </div>
              <CategoriesEditor adminPw={adminPw} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
