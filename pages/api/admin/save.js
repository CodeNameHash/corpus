import { createClient } from '@supabase/supabase-js';

const ALLOWED_TABLES = ['explainers', 'qa', 'war_stories', 'negotiation_points'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { table, record } = req.body;

  if (!ALLOWED_TABLES.includes(table)) {
    return res.status(400).json({ error: 'Invalid table' });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return res.status(500).json({ error: `Missing env vars: url=${!!url} key=${!!key}` });
  }

  try {
    const client = createClient(url, key);
    const { data, error } = await client
      .from(table)
      .upsert(record, { onConflict: 'id' })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message, code: error.code, details: error.details });
    return res.status(200).json({ ok: true, data });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
