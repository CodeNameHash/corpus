// Simple auth helpers — no external dependencies

export function checkPassword(password) {
  return password === process.env.ADMIN_PASSWORD;
}

export function isAuthenticated(req) {
  const auth = req.headers.authorization || '';
  return auth === `Bearer ${process.env.ADMIN_PASSWORD}`;
}
