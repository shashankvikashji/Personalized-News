import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../ctx.jsx';
import Brand from '../components/Brand.jsx';

export default function AuthPage({ mode }) {
  const { signIn } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const reg = mode === 'register';
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      const data = await api(`/auth/${mode}`, { method: 'POST', body: f });
      signIn(data);
      nav(!data.user.onboarded ? '/onboarding' : loc.state?.from || '/feed', { replace: true });
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="authwrap">
      <aside className="authside">
        <Brand />
        <h2>{reg ? 'Build a feed around you' : 'Welcome back'}</h2>
        <p>{reg ? 'Pick your interests, read what you like, and watch the recommendations get sharper with every story.' : 'Your recommendations have been waiting. Pick up where you left off.'}</p>
        <blockquote>"I stopped scrolling through stories I did not care about."<span>Early reader feedback</span></blockquote>
      </aside>
      <form className="authform" onSubmit={submit}>
        <h1>{reg ? 'Create your account' : 'Sign in'}</h1>
        {reg && <label>Full name<input required value={f.name} onChange={set('name')} autoComplete="name" /></label>}
        <label>Email<input required type="email" value={f.email} onChange={set('email')} autoComplete="email" /></label>
        <label>Password<input required type="password" minLength={6} value={f.password} onChange={set('password')} autoComplete={reg ? 'new-password' : 'current-password'} /></label>
        {err && <div className="alert" role="alert">{err}</div>}
        <button className="btn primary lg" disabled={busy}>{busy ? 'Please wait…' : reg ? 'Create account' : 'Sign in'}</button>
        <p className="muted small">{reg ? 'Already have an account?' : 'New to Lumen?'} <Link to={reg ? '/login' : '/register'}>{reg ? 'Sign in' : 'Create an account'}</Link></p>
        {!reg && (
          <div className="demo-creds">
            <span className="muted small">Quick demo logins</span>
            <div className="row">
              <button type="button" className="btn" onClick={() => setF({ ...f, email: 'demo@lumen.dev', password: 'demo123' })}>Demo reader</button>
              <button type="button" className="btn" onClick={() => setF({ ...f, email: 'admin@lumen.dev', password: 'admin123' })}>Admin</button>
            </div>
          </div>
        )}
        <Link to="/" className="small muted">Back to home page</Link>
      </form>
    </div>
  );
}
