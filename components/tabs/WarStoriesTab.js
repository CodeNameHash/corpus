import { WAR_STORIES } from '../../data/warStories';
import { C, F } from '../../data/tokens';

export default function WarStoriesTab({ provisionId, level }) {
  const stories = WAR_STORIES.filter(s => s.provision_id === provisionId && s.level === level);
  if (!stories.length) return (
    <div style={{ padding: '60px 0', textAlign: 'center', fontFamily: F.body, fontSize: 14, color: C.inkLight }}>
      No war stories for this level yet.
    </div>
  );

  return (
    <div style={{ maxWidth: 760 }}>
      {stories.map(s => (
        <div key={s.id} style={{ marginBottom: 32, background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ height: 4, background: `linear-gradient(90deg, ${C.accent}, ${C.accentDim})` }} />
          <div style={{ padding: '24px 28px' }}>
            <div style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 600, letterSpacing: 2, color: C.accent, textTransform: 'uppercase', marginBottom: 8 }}>War Story</div>
            <h3 style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: C.ink, marginBottom: 16 }}>{s.title}</h3>
            {s.story.split('\n\n').map((para, i) => (
              <p key={i} style={{ fontFamily: F.body, fontSize: 14, color: C.inkMid, lineHeight: 1.85, marginBottom: 14 }}>{para}</p>
            ))}
            {s.concepts?.length > 0 && (
              <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {s.concepts.map(c => (
                  <span key={c} style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 600, color: C.accent, background: '#FFF3E0', borderRadius: 4, padding: '3px 8px' }}>{c}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
