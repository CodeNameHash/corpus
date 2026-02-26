import { isAuthenticated } from '../../../lib/auth';
import { saveToSupabase } from '../../../lib/content';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { key } = req.query;
    if (!key) return res.status(400).json({ error: 'key required' });
    
    if (!isSupabaseConfigured()) {
      return res.status(200).json({ value: null, source: 'hardcoded' });
    }
    
    try {
      const { data, error } = await supabase
        .from('corpus_content')
        .select('content_value, updated_at')
        .eq('content_key', key)
        .single();
      
      if (error || !data) return res.status(200).json({ value: null, source: 'hardcoded' });
      return res.status(200).json({ value: data.content_value, updated_at: data.updated_at, source: 'database' });
    } catch (e) {
      return res.status(200).json({ value: null, source: 'hardcoded' });
    }
  }

  if (req.method === 'PUT') {
    if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' });
    
    const { key, value } = req.body;
    if (!key || value === undefined) return res.status(400).json({ error: 'key and value required' });
    
    const ok = await saveToSupabase(key, value);
    if (!ok) return res.status(500).json({ error: isSupabaseConfigured() ? 'Database error' : 'Supabase not configured' });
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
