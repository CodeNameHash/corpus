import { serialize, parse } from 'cookie';

const COOKIE_NAME = 'corpus_admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'corpus2024';

export function checkPassword(password) {
  return password === ADMIN_PASSWORD;
}

export function setAuthCookie(res) {
  const token = Buffer.from(`corpus-admin:${Date.now()}`).toString('base64');
  res.setHeader('Set-Cookie', serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  }));
}

export function clearAuthCookie(res) {
  res.setHeader('Set-Cookie', serialize(COOKIE_NAME, '', { maxAge: 0, path: '/' }));
}

export function isAuthenticated(req) {
  const cookies = parse(req.headers.cookie || '');
  const token = cookies[COOKIE_NAME];
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    return decoded.startsWith('corpus-admin:');
  } catch {
    return false;
  }
}
