import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../ctx.jsx';
import Brand from '../components/Brand.jsx';
import Icon from '../components/Icon.jsx';
import { CATS, catColor } from '../util.js';

const DESC = { Technology: 'AI, gadgets, software', Business: 'Markets, startups, economy', Science: 'Space, research, discovery', Health: 'Medicine, fitness, wellbeing', Sports: 'Cricket, football, tennis', Entertainment: 'Film, music, games', World: 'Politics, diplomacy, events', Environment: 'Climate, energy, nature' };

export default function Onboarding() {
  const { user, setUser } = useAuth();
  const nav = useNavigate();
  const [sel, setSel] = useState(user.interests || []);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const toggle = (c) => setSel((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));

  const save = async () => {
    setBusy(true); setErr('');
    try { setUser(await api('/auth/me', { method: 'PATCH', body: { interests: sel, onboarded: true } })); nav('/feed', { replace: true }); }
    catch (e) { setErr(e.message); setBusy(false); }
  };

  return (
    <div className="onboard">
      <Brand />
      <h1>What do you like to read about, {user.name.split(' ')[0]}?</h1>
      <p className="muted">Choose at least three topics. You can change them any time in Settings.</p>
      <div className="topics">
        {CATS.map((c) => (
          <button key={c} className={`topic ${sel.includes(c) ? 'on' : ''}`} style={{ '--c': catColor(c) }} onClick={() => toggle(c)} aria-pressed={sel.includes(c)}>
            <span className="swatch">{sel.includes(c) && <Icon name="check" size={16} />}</span>
            <strong>{c}</strong><span className="muted small">{DESC[c]}</span>
          </button>
        ))}
      </div>
      {err && <div className="alert" role="alert">{err}</div>}
      <div className="row between">
        <span className="muted">{sel.length} selected{sel.length < 3 ? `, pick ${3 - sel.length} more` : ''}</span>
        <button className="btn primary lg" disabled={sel.length < 3 || busy} onClick={save}>{busy ? 'Building your feed…' : 'Build my feed'}</button>
      </div>
    </div>
  );
}
