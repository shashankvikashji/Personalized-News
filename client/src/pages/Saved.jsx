import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import ArticleCard from '../components/ArticleCard.jsx';
import { Empty, PageHead, SkeletonGrid } from '../components/UI.jsx';

export default function Saved() {
  const [items, setItems] = useState(null);
  useEffect(() => { api('/me/saved').then(setItems); }, []);
  return (
    <>
      <PageHead title="Saved" sub="Your reading list. Saving a story also teaches Lumen what you like." />
      {!items ? <SkeletonGrid n={3} /> : items.length === 0 ? (
        <Empty title="Nothing saved yet">Tap the bookmark on any story to keep it here. <Link to="/feed">Browse your feed.</Link></Empty>
      ) : <div className="grid">{items.map((a) => <ArticleCard key={a._id} a={{ ...a, saved: true }} />)}</div>}
    </>
  );
}
