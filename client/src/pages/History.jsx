import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useToast } from '../ctx.jsx';
import { Empty, PageHead } from '../components/UI.jsx';
import { catColor } from '../util.js';

const fmtDwell = (s) => (s < 60 ? `${s}s` : `${Math.round(s / 60)} min`);

export default function History() {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  useEffect(() => { api('/me/history').then(setRows); }, []);
  const clear = async () => {
    if (!confirm('Clear your reading history? Your interest profile is kept.')) return;
    await api('/me/history', { method: 'DELETE' }); setRows([]); toast('Reading history cleared');
  };
  const groups = (rows || []).reduce((g, r) => { const d = new Date(r.at).toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long' }); (g[d] = g[d] || []).push(r); return g; }, {});

  return (
    <>
      <PageHead title="Reading history" sub="Stories you have opened recently.">
        {rows?.length > 0 && <button className="btn" onClick={clear}>Clear history</button>}
      </PageHead>
      {!rows ? <p className="muted">Loading…</p> : rows.length === 0 ? (
        <Empty title="No history yet">Stories you open will appear here. <Link to="/feed">Start reading.</Link></Empty>
      ) : Object.entries(groups).map(([day, list]) => (
        <section key={day} className="histgroup">
          <h2>{day}</h2>
          <ul>
            {list.map((r) => (
              <li key={r._id}>
                <time>{new Date(r.at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</time>
                <div><Link to={`/article/${r.article._id}`}>{r.article.title}</Link><span className="kicker"><i className="dot" style={{ background: catColor(r.article.category) }} />{r.article.category}</span></div>
                <span className={`tag ${r.read ? 'positive' : ''}`}>{r.read ? `Read, ${fmtDwell(r.dwell)}` : 'Skimmed'}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
