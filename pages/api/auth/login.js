import { checkPassword, setAuthCookie, clearAuthCookie } from '../../lib/auth';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { password } = req.body;
    if (checkPassword(password)) {
      setAuthCookie(res);
      return res.status(200).json({ ok: true });
    }
    return res.status(401).json({ error: 'Invalid password' });
  }
  if (req.method === 'DELETE') {
    clearAuthCookie(res);
    return res.status(200).json({ ok: true });
  }
  res.status(405).end();
}
