import { useState } from 'react';
import { api } from '../api.js';
import { applyTheme, useAuth, useToast } from '../ctx.jsx';
import { PageHead } from '../components/UI.jsx';
import { CATS, catColor } from '../util.js';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [name, setName] = useState(user.name);
  const [sel, setSel] = useState(user.interests);
  const toggle = (c) => setSel((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));
  const patch = async (body, msg) => { try { setUser(await api('/auth/me', { method: 'PATCH', body })); toast(msg); } catch (e) { toast(e.message); } };

  const theme = (t) => { applyTheme(t); patch({ theme: t }, 'Theme updated'); };
  const reset = async () => {
    if (!confirm('Reset personalization? Lumen will forget your interests and learned preferences.')) return;
    setUser(await api('/auth/reset-personalization', { method: 'POST' })); nav('/onboarding');
  };

  return (
    <>
      <PageHead title="Settings" sub="Control your profile, topics and appearance." />
      <div className="settings">
        <section className="setrow">
          <div><h2>Profile</h2><p className="muted small">Your name appears in greetings.</p></div>
          <div className="row"><input value={name} onChange={(e) => setName(e.target.value)} aria-label="Full name" /><button className="btn" disabled={!name.trim() || name === user.name} onClick={() => patch({ name }, 'Name saved')}>Save name</button></div>
        </section>
        <section className="setrow">
          <div><h2>Topics</h2><p className="muted small">Choose at least three. Changes reshape your feed right away.</p></div>
          <div>
            <div className="chips">{CATS.map((c) => <button key={c} className={`chip ${sel.includes(c) ? 'on' : ''}`} style={{ '--c': catColor(c) }} aria-pressed={sel.includes(c)} onClick={() => toggle(c)}>{c}</button>)}</div>
            <button className="btn primary" style={{ marginTop: 12 }} disabled={sel.length < 3} onClick={() => patch({ interests: sel }, 'Topics updated')}>Save topics</button>
          </div>
        </section>
        <section className="setrow">
          <div><h2>Appearance</h2><p className="muted small">Match your device or pick a theme.</p></div>
          <div className="seg" role="radiogroup" aria-label="Theme">
            {['light', 'dark', 'system'].map((t) => <button key={t} role="radio" aria-checked={user.theme === t} className={user.theme === t ? 'on' : ''} onClick={() => theme(t)}>{t[0].toUpperCase() + t.slice(1)}</button>)}
          </div>
        </section>
        <section className="setrow danger">
          <div><h2>Reset personalization</h2><p className="muted small">Clears everything Lumen has learned about you and restarts onboarding.</p></div>
          <div><button className="btn danger" onClick={reset}>Reset my profile</button></div>
        </section>
      </div>
    </>
  );
}
