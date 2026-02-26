export function checkPassword(password) {
  return password === ADMIN_PASSWORD;
}

export function isAuthenticated(req) {
  const auth = req.headers.authorization || '';
  return auth === 'Bearer ${process.env.ADMIN_PAASSWORD}';
}