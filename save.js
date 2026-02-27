import { createClient } from '@supabase/supabase-js';

const ALLOWED_TABLES = [
  'explainers', 'qa', 'war_stories', 'negotiation_points',
  'annotations', 'defined_terms', 'cases', 'concepts',
  'deals', 'clauses', 'provisions', 'categories',
];

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function auth(req) {
  return req.headers.authorization === `Bearer ${process.env.ADMIN_PASSWORD}`;
}

export default async function handler(req, res) {
  if (!auth(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { table, record, id } = req.body;
  if (!ALLOWED_TABLES.includes(table)) return res.status(400).json({ error: 'Invalid table' });

  const client = getClient();

  try {
    // DELETE
    if (req.method === 'DELETE') {
      const { error } = await client.from(table).delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    // UPSERT
    if (req.method === 'POST') {
      const { data, error } = await client
        .from(table).upsert(record, { onConflict: 'id' }).select().single();
      if (error) return res.status(500).json({ error: error.message, code: error.code });
      return res.status(200).json({ ok: true, data });
    }

    return res.status(405).end();
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
