export default function handler(req, res) {
  if (req.method === 'POST') {
    const { password } = req.body;
    if (password === process.env.ADMIN_PASSWORD) {
      return res.status(200).json({ ok: true });
    }
    return res.status(401).json({ error: 'Invalid password' });
  }
  res.status(405).end();
}
