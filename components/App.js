import { useState, useEffect } from 'react';
import Head from 'next/head';
import { PROVISIONS as STATIC_PROVISIONS } from '../data/provisions';
import { C, F, LEVELS, GOOGLE_FONTS } from '../data/tokens';
import TermPanel from './TermPanel';
import ExplainerTab from './tabs/ExplainerTab';
import AnnotatedClauseTab from './tabs/AnnotatedClauseTab';
import NegotiationTab from './tabs/NegotiationTab';
import QATab from './tabs/QATab';
import WarStoriesTab from './tabs/WarStoriesTab';
import CasesTab from './tabs/CasesTab';
import PrecedentTab from './tabs/PrecedentTab';

const TABS = [
  { id: 'explainer',   label: 'Explainer' },
  { id: 'clause',      label: 'Annotated Clause' },
  { id: 'negotiation', label: 'Negotiation Points' },
  { id: 'qa',          label: 'Q&A' },
  { id: 'stories',     label: 'War Stories' },
  { id: 'cases',       label: 'Cases' },
  { id: 'precedent',   label: 'Precedent Bank' },
];

const HAS_SUPABASE =
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

export default function CorpusApp() {
  const [provisions, setProvisions] = useState(STATIC_PROVISIONS);
  const [activeProvision, setActiveProvision] = useState('structure');
  const [activeTab, setActiveTab] = useState('explainer');
  const [level, setLevel] = useState('junior');
  const [activeTerm, setActiveTerm] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive check
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Fetch provisions from Supabase; fall back to static data on failure
  useEffect(() => {
    if (!HAS_SUPABASE) return;
    let cancelled = false;
    (async () => {
      try {
        const { supabase } = await import('../lib/supabase');
        const { data, error } = await supabase
          .from('provisions')
          .select('*')
          .order('sort_order', { ascending: true });
        if (!cancelled && !error && data?.length) {
          setProvisions(data);
        }
      } catch {
        // silently keep static fallback
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const provision = provisions.find(p => p.id === activeProvision);

  function handleProvisionClick(id) {
    setActiveProvision(id);
    setActiveTab('explainer');
    setSidebarOpen(false);
  }

  return (
    <>
      <Head>
        <title>Corpus — M&A Agreement Training</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={GOOGLE_FONTS} rel="stylesheet" />
      </Head>

      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: F.ui }}>
        {/* Top nav */}
        <nav style={{ height: 56, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isMobile && (
              <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', fontSize: 20, color: C.ink, padding: 4 }}>☰</button>
            )}
            <div style={{ fontFamily: F.corpus, fontSize: 22, fontWeight: 300, letterSpacing: 5, color: C.ink, textTransform: 'uppercase' }}>
              CORPUS<span style={{ color: C.accent }}>.</span>
            </div>
          </div>

          {/* Level selector */}
          <div style={{ display: 'flex', gap: 4, background: C.bg, borderRadius: 8, padding: 4, border: `1px solid ${C.border}` }}>
            {Object.entries(LEVELS).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setLevel(key)}
                style={{
                  padding: '6px 14px', borderRadius: 6, border: 'none',
                  fontFamily: F.ui, fontSize: 12, fontWeight: 600,
                  background: level === key ? C.white : 'transparent',
                  color: level === key ? C.ink : C.inkLight,
                  boxShadow: level === key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s',
                  cursor: 'pointer',
                }}
              >{val.short}</button>
            ))}
          </div>
        </nav>

        {/* Mobile sidebar overlay */}
        {isMobile && sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 149 }} />
        )}

        <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)' }}>
          {/* Sidebar */}
          <aside style={{
            width: 260, flexShrink: 0, background: C.white, borderRight: `1px solid ${C.border}`,
            position: isMobile ? 'fixed' : 'sticky',
            top: isMobile ? 0 : 56, left: 0,
            height: isMobile ? '100vh' : 'calc(100vh - 56px)',
            overflowY: 'auto', zIndex: 150,
            transform: isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
            transition: 'transform 0.25s ease',
            paddingTop: isMobile ? 16 : 0,
          }}>
            {isMobile && (
              <div style={{ padding: '8px 20px 16px', fontFamily: F.corpus, fontSize: 20, fontWeight: 300, letterSpacing: 4, color: C.ink, textTransform: 'uppercase' }}>
                CORPUS<span style={{ color: C.accent }}>.</span>
              </div>
            )}
            <div style={{ padding: '20px 20px 8px' }}>
              <div style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 600, letterSpacing: 2, color: C.inkFaint, textTransform: 'uppercase' }}>The Merger Agreement</div>
            </div>
            {provisions.map(p => (
              <button
                key={p.id}
                onClick={() => handleProvisionClick(p.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                  padding: '12px 20px', border: 'none', textAlign: 'left', cursor: 'pointer',
                  background: activeProvision === p.id ? '#FFF8EE' : 'transparent',
                  borderLeft: `3px solid ${activeProvision === p.id ? C.accent : 'transparent'}`,
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: activeProvision === p.id ? C.accent : C.inkFaint, width: 18, flexShrink: 0 }}>{p.number}</span>
                <div>
                  <div style={{ fontFamily: F.ui, fontSize: 13, fontWeight: activeProvision === p.id ? 600 : 400, color: activeProvision === p.id ? C.ink : C.inkMid }}>{p.title}</div>
                  {activeProvision === p.id && <div style={{ fontFamily: F.ui, fontSize: 11, color: C.inkLight, marginTop: 2 }}>{p.sections}</div>}
                </div>
                {p.id !== 'structure' && (
                  <span style={{ marginLeft: 'auto', fontFamily: F.ui, fontSize: 10, color: C.inkFaint, background: C.bg, borderRadius: 4, padding: '2px 6px' }}>Soon</span>
                )}
              </button>
            ))}
          </aside>

          {/* Main content */}
          <main style={{ flex: 1, minWidth: 0 }}>
            {/* Provision header */}
            <div style={{ padding: '28px 32px 0', background: C.white, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 600, letterSpacing: 2, color: C.accent, textTransform: 'uppercase' }}>Provision {provision?.number}</span>
                <span style={{ fontFamily: F.ui, fontSize: 11, color: C.inkFaint, marginLeft: 12 }}>{provision?.deal} · {provision?.deal_date}</span>
              </div>
              <h1 style={{ fontFamily: F.display, fontSize: 32, fontWeight: 900, color: C.ink, marginBottom: 20 }}>{provision?.title}</h1>
              {/* Tabs */}
              <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }} className="noscroll">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '10px 18px', border: 'none', background: 'transparent', cursor: 'pointer', whiteSpace: 'nowrap',
                      fontFamily: F.ui, fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400,
                      color: activeTab === tab.id ? C.ink : C.inkLight,
                      borderBottom: `2px solid ${activeTab === tab.id ? C.accent : 'transparent'}`,
                      transition: 'all 0.15s',
                    }}
                  >{tab.label}</button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div style={{ padding: '32px 32px 64px' }}>
              {activeTab === 'explainer'   && <ExplainerTab provisionId={activeProvision} level={level} />}
              {activeTab === 'clause'      && <AnnotatedClauseTab provisionId={activeProvision} level={level} onTermClick={setActiveTerm} />}
              {activeTab === 'negotiation' && <NegotiationTab provisionId={activeProvision} />}
              {activeTab === 'qa'          && <QATab provisionId={activeProvision} level={level} />}
              {activeTab === 'stories'     && <WarStoriesTab provisionId={activeProvision} level={level} />}
              {activeTab === 'cases'       && <CasesTab provisionId={activeProvision} onTermClick={setActiveTerm} />}
              {activeTab === 'precedent'   && <PrecedentTab />}
            </div>
          </main>
        </div>

        {/* Term panel */}
        {activeTerm && (
          <TermPanel
            termId={activeTerm}
            onClose={() => setActiveTerm(null)}
            onProvisionClick={handleProvisionClick}
          />
        )}
      </div>
    </>
  );
}
