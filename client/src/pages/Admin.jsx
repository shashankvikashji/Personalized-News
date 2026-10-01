import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useToast } from '../ctx.jsx';
import { ActivityBars, BarList } from '../components/Charts.jsx';
import { PageHead } from '../components/UI.jsx';
import { CATS } from '../util.js';

const FEEDS = [['BBC Technology', 'http://feeds.bbci.co.uk/news/technology/rss.xml', 'Technology'], ['BBC Business', 'http://feeds.bbci.co.uk/news/business/rss.xml', 'Business'], ['BBC Science', 'http://feeds.bbci.co.uk/news/science_and_environment/rss.xml', 'Science'], ['BBC Health', 'http://feeds.bbci.co.uk/news/health/rss.xml', 'Health'], ['BBC World', 'http://feeds.bbci.co.uk/news/world/rss.xml', 'World']];

export default function Admin() {
  const toast = useToast();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [arts, setArts] = useState([]);
  const [form, setForm] = useState({ title: '', source: '', category: 'Technology', url: '', content: '' });
  const [rss, setRss] = useState({ url: '', category: 'Technology' });
  const [busy, setBusy] = useState(false);

  const load = () => { api('/admin/stats').then(setStats); api('/admin/articles').then(setArts); };
  useEffect(load, []);

  const add = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await api('/admin/articles', { method: 'POST', body: form }); toast('Story published. NLP keywords and summary were generated.'); setForm({ ...form, title: '', content: '', url: '' }); load(); setTab('articles'); }
    catch (er) { toast(er.message); } finally { setBusy(false); }
  };
  const del = async (id) => { if (confirm('Delete this story?')) { await api(`/admin/articles/${id}`, { method: 'DELETE' }); toast('Story deleted'); load(); } };
  const ingest = async (e) => {
    e.preventDefault(); setBusy(true);
    try { const r = await api('/admin/ingest', { method: 'POST', body: rss }); toast(`Imported ${r.added} new stories from ${r.scanned} items.`); load(); }
    catch (er) { toast(er.message); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHead title="Admin console" sub="Manage stories and watch engagement." />
      <div className="tabs" role="tablist">
        {[['overview', 'Overview'], ['articles', 'Stories'], ['add', 'Add story'], ['import', 'Import RSS']].map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}
      </div>

      {tab === 'overview' && stats && (
        <>
          <div className="tiles">{[['Readers', stats.users], ['Stories', stats.articles], ['Interactions', stats.interactions]].map(([l, v]) => <div className="tile" key={l}><b>{v}</b><span>{l}</span></div>)}</div>
          <div className="panels">
            <section className="panel wide"><h2>Platform activity, last 14 days</h2><ActivityBars days={stats.activity} /></section>
            <section className="panel"><h2>Reads by category</h2><BarList items={stats.byCategory} byCategory /></section>
            <section className="panel"><h2>Most read stories</h2><ul className="plain">{stats.top.map((t) => <li key={t._id}><span>{t.title}</span><b>{t.views}</b></li>)}</ul></section>
            <section className="panel"><h2>Newest readers</h2><ul className="plain">{stats.recentUsers.map((u) => <li key={u._id}><span>{u.name}<small className="muted"> {u.email}</small></span><span className="tag">{u.role}</span></li>)}</ul></section>
          </div>
        </>
      )}

      {tab === 'articles' && (
        <div className="tablewrap"><table>
          <thead><tr><th>Title</th><th>Category</th><th>Reads</th><th>Likes</th><th>Saves</th><th><span className="sr">Actions</span></th></tr></thead>
          <tbody>{arts.map((a) => <tr key={a._id}><td>{a.title}</td><td>{a.category}</td><td>{a.views}</td><td>{a.likes}</td><td>{a.saves}</td><td><button className="btn danger" onClick={() => del(a._id)}>Delete</button></td></tr>)}</tbody>
        </table></div>
      )}

      {tab === 'add' && (
        <form className="adminform" onSubmit={add}>
          <label>Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
          <div className="row2">
            <label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></label>
            <label>Source<input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Lumen Wire" /></label>
          </div>
          <label>Original link (optional)<input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} /></label>
          <label>Article text<textarea required rows={9} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Paste at least a few sentences. Keywords, summary and sentiment are generated automatically." /></label>
          <div><button className="btn primary" disabled={busy}>{busy ? 'Publishing…' : 'Publish story'}</button></div>
        </form>
      )}

      {tab === 'import' && (
        <form className="adminform" onSubmit={ingest}>
          <p className="muted">Pull the latest stories from any RSS feed. This needs an internet connection on the server.</p>
          <div className="chips">{FEEDS.map(([n, u, c]) => <button type="button" key={n} className="chip" onClick={() => setRss({ url: u, category: c })}>{n}</button>)}</div>
          <label>Feed URL<input required type="url" value={rss.url} onChange={(e) => setRss({ ...rss, url: e.target.value })} placeholder="https://example.com/rss.xml" /></label>
          <label>Category<select value={rss.category} onChange={(e) => setRss({ ...rss, category: e.target.value })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></label>
          <div><button className="btn primary" disabled={busy}>{busy ? 'Importing…' : 'Import stories'}</button></div>
        </form>
      )}
    </>
  );
}
