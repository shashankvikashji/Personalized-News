import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import ArticleCard from '../components/ArticleCard.jsx';
import Icon from '../components/Icon.jsx';
import { Empty, PageHead, SkeletonGrid } from '../components/UI.jsx';
import { CATS } from '../util.js';

export default function Explore() {
  const [sp, setSp] = useSearchParams();
  const q = sp.get('q') || '', cat = sp.get('category') || 'All', sort = sp.get('sort') || 'latest';
  const [text, setText] = useState(q);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchPage = useCallback(async (p, replace) => {
    setLoading(true);
    try {
      const d = await api('/articles?' + new URLSearchParams({ q, category: cat, sort, page: p }));
      setItems((prev) => (replace ? d.items : [...prev, ...d.items]));
      setMeta({ page: d.page, pages: d.pages, total: d.total });
    } finally { setLoading(false); }
  }, [q, cat, sort]);
  useEffect(() => { fetchPage(1, true); }, [fetchPage]);
  useEffect(() => setText(q), [q]);

  const set = (k, v) => {
    const n = new URLSearchParams(sp);
    if (v && v !== 'All' && !(k === 'sort' && v === 'latest')) n.set(k, v); else n.delete(k);
    setSp(n);
  };

  return (
    <>
      <PageHead title="Explore" sub={`${meta.total} stories${q ? ` matching "${q}"` : ''}`} />
      <form className="filterbar" onSubmit={(e) => { e.preventDefault(); set('q', text.trim()); }}>
        <div className="searchbox grow"><Icon name="search" /><input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search by title, topic or source" aria-label="Search stories" /></div>
        <select value={sort} onChange={(e) => set('sort', e.target.value)} aria-label="Sort stories"><option value="latest">Latest</option><option value="popular">Most read</option></select>
        <button className="btn primary">Search</button>
      </form>
      <div className="tabs" role="tablist" aria-label="Filter by category">
        {['All', ...CATS].map((c) => <button key={c} role="tab" aria-selected={cat === c} className={cat === c ? 'on' : ''} onClick={() => set('category', c)}>{c}</button>)}
      </div>
      {loading && !items.length ? <SkeletonGrid /> : !items.length ? (
        <Empty title="No stories found">Try a different keyword, or clear the category filter.</Empty>
      ) : (
        <>
          <div className="grid">{items.map((a) => <ArticleCard key={a._id} a={a} />)}</div>
          {meta.page < meta.pages && <div className="center"><button className="btn" disabled={loading} onClick={() => fetchPage(meta.page + 1, false)}>{loading ? 'Loading…' : 'Load more stories'}</button></div>}
        </>
      )}
    </>
  );
}
