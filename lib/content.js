// lib/content.js
// Single source of truth for all content reads.
// Reads from Supabase if configured; falls back to static data files.
// All writes go through saveContent() which always uses Supabase.

import { EXPLAINERS } from '../data/explainers';
import { QA_DATABASE } from '../data/qa';
import { WAR_STORIES } from '../data/warStories';
import { NEGOTIATION_POINTS } from '../data/negotiationPoints';
import { DEFINED_TERMS } from '../data/definedTerms';
import { CASES } from '../data/cases';
import { CONCEPTS } from '../data/concepts';
import { CLAUSES } from '../data/clauses';

const HAS_SUPABASE = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
);

async function db() {
  const { supabase } = await import('./supabase');
  return supabase;
}

// ─── Explainers ───────────────────────────────────────────────────────────────

export async function getExplainer(provisionId, level) {
  if (HAS_SUPABASE) {
    try {
      const client = await db();
      const { data } = await client.from('explainers').select('*')
        .eq('provision_id', provisionId).eq('level', level).single();
      if (data) return data;
    } catch {}
  }
  return EXPLAINERS[provisionId]?.[level] || null;
}

// ─── Q&A ──────────────────────────────────────────────────────────────────────

export async function getQA(provisionId, level) {
  if (HAS_SUPABASE) {
    try {
      const client = await db();
      const { data } = await client.from('qa').select('*')
        .eq('provision_id', provisionId).eq('level', level)
        .order('sort_order', { ascending: true });
      if (data?.length) return data;
    } catch {}
  }
  return QA_DATABASE.filter(q => q.provision_id === provisionId && q.level === level);
}

// ─── War Stories ──────────────────────────────────────────────────────────────

export async function getWarStories(provisionId, level) {
  if (HAS_SUPABASE) {
    try {
      const client = await db();
      const { data } = await client.from('war_stories').select('*')
        .eq('provision_id', provisionId).eq('level', level)
        .order('sort_order', { ascending: true });
      if (data?.length) return data;
    } catch {}
  }
  return WAR_STORIES.filter(s => s.provision_id === provisionId && s.level === level);
}

// ─── Negotiation Points ───────────────────────────────────────────────────────

export async function getNegotiationPoints(provisionId) {
  if (HAS_SUPABASE) {
    try {
      const client = await db();
      const { data } = await client.from('negotiation_points').select('*')
        .eq('provision_id', provisionId).order('sort_order', { ascending: true });
      if (data?.length) return data;
    } catch {}
  }
  return NEGOTIATION_POINTS[provisionId] || [];
}

// ─── Annotations ─────────────────────────────────────────────────────────────

export async function getAnnotations(provisionId) {
  if (HAS_SUPABASE) {
    try {
      const client = await db();
      const { data } = await client.from('annotations').select('*')
        .eq('provision_id', provisionId);
      if (data?.length) {
        // Reshape into { clauseId: { level: { phrase, note } } }
        const out = {};
        for (const row of data) {
          if (!out[row.clause_id]) out[row.clause_id] = {};
          out[row.clause_id][row.level] = { phrase: row.phrase, note: row.note };
        }
        return out;
      }
    } catch {}
  }
  // Fall back: extract from static CLAUSES
  const clauseData = CLAUSES[provisionId];
  if (!clauseData) return {};
  const out = {};
  for (const item of clauseData.items || []) {
    if (item.annotations) out[item.id] = item.annotations;
  }
  return out;
}

// ─── Defined Terms ────────────────────────────────────────────────────────────

export async function getDefinedTerms() {
  if (HAS_SUPABASE) {
    try {
      const client = await db();
      const { data } = await client.from('defined_terms').select('*').order('term');
      if (data?.length) {
        return Object.fromEntries(data.map(t => [t.term, {
          ...t,
          long: t.long_def,
          short: t.short_def,
        }]));
      }
    } catch {}
  }
  return DEFINED_TERMS;
}

export async function getDefinedTerm(id) {
  if (HAS_SUPABASE) {
    try {
      const client = await db();
      const { data } = await client.from('defined_terms').select('*').eq('id', id).single();
      if (data) return { ...data, long: data.long_def, short: data.short_def };
    } catch {}
  }
  return Object.values(DEFINED_TERMS).find(t => t.id === id) || null;
}

// ─── Cases ────────────────────────────────────────────────────────────────────

export async function getCases(provisionId) {
  if (HAS_SUPABASE) {
    try {
      const client = await db();
      let query = client.from('cases').select('*');
      if (provisionId) query = query.contains('provisions', [provisionId]);
      const { data } = await query.order('year', { ascending: false });
      if (data?.length) return data;
    } catch {}
  }
  const all = Object.values(CASES);
  return provisionId ? all.filter(c => c.provisions?.includes(provisionId)) : all;
}

export async function getCase(id) {
  if (HAS_SUPABASE) {
    try {
      const client = await db();
      const { data } = await client.from('cases').select('*').eq('id', id).single();
      if (data) return data;
    } catch {}
  }
  return CASES[id] || null;
}

// ─── Concepts ─────────────────────────────────────────────────────────────────

export async function getConcepts(provisionId) {
  if (HAS_SUPABASE) {
    try {
      const client = await db();
      let query = client.from('concepts').select('*');
      if (provisionId) query = query.contains('provision_ids', [provisionId]);
      const { data } = await query.order('sort_order', { ascending: true });
      if (data?.length) return data;
    } catch {}
  }
  const all = Object.values(CONCEPTS);
  return provisionId ? all.filter(c => c.provision_ids?.includes(provisionId)) : all;
}

export async function getConcept(slug) {
  if (HAS_SUPABASE) {
    try {
      const client = await db();
      const { data } = await client.from('concepts').select('*').eq('slug', slug).single();
      if (data) return data;
    } catch {}
  }
  return CONCEPTS[slug] || null;
}

// ─── Save (admin only — always writes to Supabase) ────────────────────────────

const ALLOWED_TABLES = [
  'explainers', 'qa', 'war_stories', 'negotiation_points',
  'annotations', 'defined_terms', 'cases', 'concepts',
];

export async function saveContent(table, record) {
  if (!ALLOWED_TABLES.includes(table)) throw new Error(`Invalid table: ${table}`);
  const { getServiceClient } = await import('./supabase');
  const client = getServiceClient();
  const { data, error } = await client
    .from(table).upsert(record, { onConflict: 'id' }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteContent(table, id) {
  if (!ALLOWED_TABLES.includes(table)) throw new Error(`Invalid table: ${table}`);
  const { getServiceClient } = await import('./supabase');
  const client = getServiceClient();
  const { error } = await client.from(table).delete().eq('id', id);
  if (error) throw error;
  return true;
}

// ─── Provisions ───────────────────────────────────────────────────────────────

export async function getProvisions() {
  if (HAS_SUPABASE) {
    try {
      const client = await db();
      const { data } = await client.from('provisions').select('*').order('sort_order', { ascending: true });
      if (data?.length) return data;
    } catch {}
  }
  const { PROVISIONS } = await import('../data/provisions');
  return PROVISIONS;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(type) {
  if (HAS_SUPABASE) {
    try {
      const client = await db();
      let q = client.from('categories').select('*').order('sort_order', { ascending: true });
      if (type) q = q.eq('type', type);
      const { data } = await q;
      if (data?.length) return data;
    } catch {}
  }
  // Static fallback
  const { CONCEPT_CATEGORIES } = await import('../data/concepts');
  return Object.values(CONCEPT_CATEGORIES);
}
