import { useState } from 'react';
import { QA_DATABASE } from '../../data/qa';
import { C, F } from '../../data/tokens';
import { useSupabaseData } from '../../lib/useSupabaseData';

export default function QATab({ provisionId, level }) {
  const [open, setOpen] = useState(null);
  const [search, setSearch] = useState('');

  const staticQA = QA_DATABASE.filter(q => q.provision_id === provisionId && q.level === level);

  const { data: allQuestions } = useSupabaseData(
    async (sb) => {
      const { data } = await sb.from('qa').select('*')
        .eq('provision_id', provisionId).eq('level', level)
        .order('sort_order', { ascending: true });
      return data?.length ? data : null;
    },
    staticQA,
    [provisionId, level]
  );

  const questions = allQuestions.filter(q =>
    search === '' || q.question.toLowerCase().includes(search.toLowerCase()) || q.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 760 }}>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search questions…"
        style={{ width: '100%', padding: '12px 16px', marginBottom: 24, fontFamily: F.ui, fontSize: 14, color: C.ink, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, outline: 'none' }}
      />
      {questions.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: F.body, fontSize: 14, color: C.inkLight }}>
          {search ? 'No matching questions.' : 'No questions for this level yet.'}
        </div>
      )}
      {questions.map((q, i) => (
        <div key={q.id} style={{ marginBottom: 12, border: `1px solid ${open === q.id ? C.accent : C.border}`, borderRadius: 8, overflow: 'hidden', transition: 'border-color 0.2s' }}>
          <button
            onClick={() => setOpen(open === q.id ? null : q.id)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '16px 20px', background: open === q.id ? '#FFFBF3' : C.white, border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <span style={{ fontFamily: F.body, fontSize: 14, fontWeight: 700, color: C.ink, lineHeight: 1.4, paddingRight: 16 }}>
              Q{i + 1}. {q.question}
            </span>
            <span style={{ color: C.accent, fontSize: 18, flexShrink: 0 }}>{open === q.id ? '−' : '+'}</span>
          </button>
          {open === q.id && (
            <div style={{ padding: '16px 20px 20px', background: '#FFFBF3', borderTop: `1px solid ${C.accentDim}` }}>
              <p style={{ fontFamily: F.body, fontSize: 14, color: C.inkMid, lineHeight: 1.8 }}>{q.answer}</p>
              {q.concepts?.length > 0 && (
                <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {q.concepts.map(c => (
                    <span key={c} style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 600, color: C.accent, background: '#FFF3E0', borderRadius: 4, padding: '3px 8px' }}>{c}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
