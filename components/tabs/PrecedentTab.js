import { useState } from 'react';
import { C, F } from '../../data/tokens';

const PRESETS = [
  { label: 'Specific Performance', query: 'specific performance merger agreement' },
  { label: 'MAE Carve-outs', query: 'material adverse effect carve-outs' },
  { label: 'Reverse Break Fee', query: 'reverse termination fee merger' },
  { label: 'Ordinary Course', query: 'ordinary course of business covenant' },
  { label: 'Limited Guarantee', query: 'limited guarantee merger agreement' },
];

export default function PrecedentTab() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  async function doSearch(q) {
    const query = q || search;
    if (!query.trim()) return;
    setLoading(true);
    setSearch(query);
    try {
      const res = await fetch(`https://efts.sec.gov/LATEST/search-index?q=${encodeURIComponent('"' + query + '"')}&forms=8-K,S-4&dateRange=custom&startdt=2020-01-01&enddt=2024-12-31`);
      const data = await res.json();
      setResults(data.hits?.hits || []);
    } catch (e) {
      setResults([]);
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 600, letterSpacing: 2, color: C.inkLight, textTransform: 'uppercase', marginBottom: 10 }}>Quick Search</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {PRESETS.map(p => (
            <button key={p.label} onClick={() => doSearch(p.query)}
              style={{ fontFamily: F.ui, fontSize: 12, fontWeight: 600, color: C.accent, background: '#FFF3E0', border: `1px solid ${C.accentDim}`, borderRadius: 20, padding: '6px 14px', cursor: 'pointer' }}>
              {p.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
            placeholder="Search SEC EDGAR for merger agreement language…"
            style={{ flex: 1, padding: '12px 16px', fontFamily: F.ui, fontSize: 14, color: C.ink, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, outline: 'none' }}
          />
          <button onClick={() => doSearch()}
            style={{ padding: '12px 24px', background: C.ink, color: C.white, fontFamily: F.ui, fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            Search
          </button>
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: F.body, color: C.inkLight }}>Searching EDGAR…</div>}

      {!loading && results && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: F.body, color: C.inkLight }}>No results found.</div>
      )}

      {!loading && results && results.length > 0 && (
        <div>
          <div style={{ fontFamily: F.ui, fontSize: 11, color: C.inkLight, marginBottom: 16 }}>{results.length}+ results from SEC EDGAR</div>
          {results.slice(0, 10).map((r, i) => {
            const s = r._source;
            return (
              <div key={i} style={{ padding: '14px 18px', marginBottom: 10, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8 }}>
                <div style={{ fontFamily: F.ui, fontSize: 13, fontWeight: 600, color: C.ink }}>{s?.entity_name || 'Unknown Company'}</div>
                <div style={{ fontFamily: F.ui, fontSize: 11, color: C.inkLight, marginTop: 3, marginBottom: 8 }}>
                  {s?.form_type} · {s?.file_date}
                </div>
                <a href={`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=${encodeURIComponent(s?.entity_name || '')}&type=8-K&dateb=&owner=include&count=10`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: F.ui, fontSize: 12, color: C.accent, textDecoration: 'none', fontWeight: 600 }}>
                  View on EDGAR →
                </a>
              </div>
            );
          })}
        </div>
      )}

      {!results && !loading && (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <div style={{ fontFamily: F.display, fontSize: 18, color: C.inkLight, marginBottom: 8 }}>Search SEC EDGAR for precedents</div>
          <p style={{ fontFamily: F.body, fontSize: 13, color: C.inkFaint }}>Use the presets or enter your own query to find merger agreement language in SEC filings.</p>
        </div>
      )}
    </div>
  );
}
