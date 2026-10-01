import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../ctx.jsx';
import ArticleCard from '../components/ArticleCard.jsx';
import Icon from '../components/Icon.jsx';
import { Empty, PageHead, SkeletonGrid } from '../components/UI.jsx';
import { CATS, greeting } from '../util.js';

export default function Feed() {
  const { user } = useAuth();
  const [cat, setCat] = useState('All');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api(`/recommendations${cat !== 'All' ? `?category=${cat}` : ''}`).then(setData).finally(() => setLoading(false));
  }, [cat]);
  useEffect(load, [load]);

  const hide = (id) => setData((d) => ({ ...d, items: d.items.filter((i) => i._id !== id) }));
  const [top, ...rest] = data?.items || [];

  return (
    <>
      <PageHead title={`${greeting()}, ${user.name.split(' ')[0]}`} sub="Stories ranked for you. Every card explains why it is here.">
        <button className="btn" onClick={load}><Icon name="refresh" /> Refresh</button>
      </PageHead>

      {data?.profileTerms?.length > 0 && (
        <div className="profilestrip"><span>Lumen thinks you like</span>{data.profileTerms.map((t) => <b key={t}>{t}</b>)}</div>
      )}
      {data?.cold && <div className="notice">Your feed is based on freshness and popularity for now. Open a few stories and the picks will get sharper.</div>}

      <div className="tabs" role="tablist" aria-label="Filter by category">
        {['All', ...CATS].map((c) => <button key={c} role="tab" aria-selected={cat === c} className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>)}
      </div>

      {loading && !data ? <SkeletonGrid /> : !top ? (
        <Empty title="Nothing to show here">You have seen or hidden everything in this category. Try another topic or check Explore.</Empty>
      ) : (
        <>
          <ArticleCard a={top} variant="feature" onHide={hide} />
          <div className="grid">{rest.map((a) => <ArticleCard key={a._id} a={a} onHide={hide} />)}</div>
        </>
      )}
    </>
  );
}
