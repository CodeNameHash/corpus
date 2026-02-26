import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { GOOGLE_FONTS } from '../../data/tokens';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      sessionStorage.setItem('corpus_admin_pw', password);
      router.push('/admin/edit');
    } else {
      setError('Incorrect password');
    }
    setLoading(false);
  }

  return (
    <>
      <Head><title>Corpus Admin</title><link href={GOOGLE_FONTS} rel="stylesheet" /></Head>
      <div style={{ minHeight: '100vh', background: '#F5F4F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ width: 360, background: '#fff', borderRadius: 12, padding: '48px 40px', boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 300, letterSpacing: 5, color: '#0A0A09', textTransform: 'uppercase', marginBottom: 8 }}>
            CORPUS<span style={{ color: '#C8922A' }}>.</span>
          </div>
          <div style={{ fontSize: 13, color: '#6B6966', marginBottom: 32 }}>Admin Panel</div>
          <form onSubmit={handleLogin}>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Admin password" autoFocus
              style={{ width: '100%', padding: '12px 16px', marginBottom: 16, fontSize: 14, color: '#0A0A09', background: '#F5F4F0', border: '1px solid #E2DFD9', borderRadius: 8, outline: 'none', boxSizing: 'border-box' }}
            />
            {error && <div style={{ fontSize: 13, color: '#8B1A1A', marginBottom: 12 }}>{error}</div>}
            <button type="submit" disabled={loading || !password}
              style={{ width: '100%', padding: '12px', background: '#0A0A09', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', borderRadius: 8, cursor: 'pointer', opacity: loading || !password ? 0.5 : 1 }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
