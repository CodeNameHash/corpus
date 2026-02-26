import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { CONCEPTS, getConceptsByCategory } from '../../data/concepts';
import { C, F, GOOGLE_FONTS } from '../../data/tokens';
import ConceptCard from '../../components/ConceptCard';

export async function getStaticPaths() {
  const paths = Object.keys(CONCEPTS).map(slug => ({ params: { slug } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const concept = CONCEPTS[params.slug] || null;
  const siblings = concept ? getConceptsByCategory(concept.category) : [];
  return { props: { concept, siblings } };
}

export default function ConceptPage({ concept, siblings }) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('definition');

  if (!concept) return null;

  const idx = siblings.findIndex(s => s.id === concept.id);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx < siblings.length - 1 ? siblings[idx + 1] : null;

  return (
    <>
      <Head>
        <title>{concept.title} — Corpus</title>
        <link href={GOOGLE_FONTS} rel="stylesheet" />
      </Head>
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: F.ui }}>

        {/* Top bar */}
        <div style={{ height: 52, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 32px', gap: 8, position: 'sticky', top: 0, zIndex: 100 }}>
          <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 300, letterSpacing: 4, color: C.ink, textTransform: 'uppercase', textDecoration: 'none' }}>
            CORPUS<span style={{ color: C.accent }}>.</span>
          </a>
          <span style={{ color: C.border, margin: '0 8px' }}>›</span>
          <a href="/" style={{ fontFamily: F.ui, fontSize: 12, color: C.inkLight, textDecoration: 'none' }}>Structure & Mechanics</a>
          <span style={{ color: C.border, margin: '0 8px' }}>›</span>
          <span style={{ fontFamily: F.ui, fontSize: 12, color: C.ink, fontWeight: 600 }}>{concept.title}</span>
        </div>

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px' }}>

          {/* Category badge */}
          <div style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
            Merger Structures
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: F.display, fontSize: 36, fontWeight: 900, color: C.ink, margin: '0 0 8px 0', lineHeight: 1.15 }}>
            {concept.title}
          </h1>
          <p style={{ fontFamily: F.body, fontSize: 15, color: C.inkLight, margin: '0 0 40px 0', lineHeight: 1.6 }}>
            {concept.summary}
          </p>

          {/* All 5 structures listed as cards (expandable) */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.inkLight, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>
              All Merger Structures
            </div>
            {siblings.map(s => (
              <ConceptCard
                key={s.id}
                concept={s}
                defaultExpanded={s.id === concept.id}
                showLink={s.id !== concept.id}
              />
            ))}
          </div>

          {/* Prev / Next navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 32, borderTop: `1px solid ${C.border}` }}>
            {prev ? (
              <a href={`/concepts/${prev.slug}`} style={{ fontFamily: F.ui, fontSize: 13, fontWeight: 600, color: C.accent, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                ← {prev.title}
              </a>
            ) : <div />}
            {next ? (
              <a href={`/concepts/${next.slug}`} style={{ fontFamily: F.ui, fontSize: 13, fontWeight: 600, color: C.accent, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                {next.title} →
              </a>
            ) : <div />}
          </div>
        </div>
      </div>
    </>
  );
}
