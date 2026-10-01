import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { Cover } from '../components/Cover.jsx';
import { PageHead, SkeletonGrid } from '../components/UI.jsx';
import { catColor, timeAgo } from '../util.js';

export default function Trending() {
  const [items, setItems] = useState(null);
  useEffect(() => { api('/articles/trending').then(setItems); }, []);
  return (
    <>
      <PageHead title="Trending" sub="Ranked by reads, likes and saves, with newer stories getting a boost." />
      {!items ? <SkeletonGrid n={3} /> : (
        <ol className="ranklist">
          {items.map((a, i) => (
            <li key={a._id}>
              <span className="rank">{i + 1}</span>
              <Link to={`/article/${a._id}`} className="thumb"><Cover a={a} /></Link>
              <div className="rank-body">
                <div className="kicker"><i className="dot" style={{ background: catColor(a.category) }} /><strong>{a.category}</strong><span>{timeAgo(a.publishedAt)}</span></div>
                <h3><Link to={`/article/${a._id}`}>{a.title}</Link></h3>
              </div>
              <div className="rank-stats"><b>{a.views}</b><span className="muted small">reads</span></div>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
