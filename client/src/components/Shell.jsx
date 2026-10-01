import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { applyTheme, useAuth } from '../ctx.jsx';
import Brand from './Brand.jsx';
import Icon from './Icon.jsx';

export default function Shell() {
  const { user, setUser, signOut } = useAuth();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const items = [['/feed', 'home', 'For you'], ['/explore', 'compass', 'Explore'], ['/trending', 'trend', 'Trending'], ['/saved', 'bookmark', 'Saved'], ['/history', 'clock', 'History'], ['/insights', 'chart', 'Insights'], ['/settings', 'sliders', 'Settings']];
  if (user.role === 'admin') items.push(['/admin', 'shield', 'Admin']);
  const dark = document.documentElement.dataset.theme === 'dark';

  const flip = () => { const t = dark ? 'light' : 'dark'; applyTheme(t); setUser({ ...user, theme: t }); api('/auth/me', { method: 'PATCH', body: { theme: t } }).catch(() => {}); };
  const search = (e) => { e.preventDefault(); if (q.trim()) nav(`/explore?q=${encodeURIComponent(q.trim())}`); };
  const out = () => { signOut(); nav('/'); };

  return (
    <div className="shell">
      <aside className="sidebar">
        <Brand to="/feed" />
        <nav aria-label="Main">
          {items.map(([to, icon, label]) => <NavLink key={to} to={to} className={({ isActive }) => `navitem ${isActive ? 'active' : ''}`}><Icon name={icon} />{label}</NavLink>)}
        </nav>
        <div className="usercard">
          <span className="avatar">{user.name[0]}</span>
          <div><strong>{user.name}</strong><span className="muted small">{user.email}</span></div>
          <button className="iconbtn" onClick={out} aria-label="Sign out" title="Sign out"><Icon name="logout" /></button>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="mobile-brand"><Brand to="/feed" /></div>
          <form className="searchbox" onSubmit={search} role="search">
            <Icon name="search" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search stories, topics, sources" aria-label="Search stories" />
          </form>
          <button className="iconbtn" onClick={flip} aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}><Icon name={dark ? 'sun' : 'moon'} /></button>
        </header>
        <main className="content"><Outlet /></main>
      </div>
      <nav className="tabbar" aria-label="Mobile">
        {items.slice(0, 5).map(([to, icon, label]) => <NavLink key={to} to={to} className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}><Icon name={icon} /><span>{label}</span></NavLink>)}
      </nav>
    </div>
  );
}
