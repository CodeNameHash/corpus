// pages/api/admin/save.js
// Saves content to Supabase. Called from admin panel.

import { saveContent } from '../../../lib/content';

const ALLOWED_TABLES = ['explainers', 'qa', 'war_stories', 'negotiation_points'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Simple auth check
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { table, record } = req.body;

  if (!ALLOWED_TABLES.includes(table)) {
    return res.status(400).json({ error: 'Invalid table' });
  }

  try {
    const data = await saveContent(table, record);
    return res.status(200).json({ ok: true, data });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
