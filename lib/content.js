// lib/content.js
// Reads from Supabase if configured, falls back to static data files.

import { EXPLAINERS } from '../data/explainers';
import { QA_DATABASE } from '../data/qa';
import { WAR_STORIES } from '../data/warStories';
import { NEGOTIATION_POINTS } from '../data/negotiationPoints';

const HAS_SUPABASE = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
);

export async function getExplainer(provisionId, level) {
  if (HAS_SUPABASE) {
    try {
      const { supabase } = await import('./supabase');
      const { data } = await supabase
        .from('explainers').select('*')
        .eq('provision_id', provisionId).eq('level', level).single();
      if (data) return data;
    } catch (e) {}
  }
  return EXPLAINERS[provisionId]?.[level] || null;
}

export async function getQA(provisionId, level) {
  if (HAS_SUPABASE) {
    try {
      const { supabase } = await import('./supabase');
      const { data } = await supabase
        .from('qa').select('*')
        .eq('provision_id', provisionId).eq('level', level)
        .order('sort_order', { ascending: true });
      if (data && data.length > 0) return data;
    } catch (e) {}
  }
  return QA_DATABASE.filter(q => q.provision_id === provisionId && q.level === level);
}

export async function getWarStories(provisionId, level) {
  if (HAS_SUPABASE) {
    try {
      const { supabase } = await import('./supabase');
      const { data } = await supabase
        .from('war_stories').select('*')
        .eq('provision_id', provisionId).eq('level', level)
        .order('sort_order', { ascending: true });
      if (data && data.length > 0) return data;
    } catch (e) {}
  }
  return WAR_STORIES.filter(s => s.provision_id === provisionId && s.level === level);
}

export async function getNegotiationPoints(provisionId) {
  if (HAS_SUPABASE) {
    try {
      const { supabase } = await import('./supabase');
      const { data } = await supabase
        .from('negotiation_points').select('*')
        .eq('provision_id', provisionId)
        .order('sort_order', { ascending: true });
      if (data && data.length > 0) return data;
    } catch (e) {}
  }
  return NEGOTIATION_POINTS[provisionId] || [];
}

export async function saveContent(table, record) {
  const { getServiceClient } = await import('./supabase');
  const client = getServiceClient();
  const { data, error } = await client
    .from(table).upsert(record, { onConflict: 'id' }).select().single();
  if (error) throw error;
  return data;
}
