import { isAuthenticated } from '../../../lib/auth';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'GET') return res.status(405).end();

  if (!isSupabaseConfigured()) {
    return res.status(200).json({ keys: [], configured: false });
  }

  try {
    const { data, error } = await supabase
      .from('corpus_content')
      .select('content_key, updated_at')
      .order('updated_at', { ascending: false });
    
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ keys: data, configured: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
