import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useToast } from '../ctx.jsx';
import { catColor, timeAgo } from '../util.js';
import { Cover, Ring } from './Cover.jsx';
import Icon from './Icon.jsx';

export default function ArticleCard({ a, variant = 'card', onHide }) {
  const toast = useToast();
  const [saved, setSaved] = useState(!!a.saved);
  const [liked, setLiked] = useState(!!a.liked);

  const toggle = async (kind) => {
    const [cur, set] = kind === 'save' ? [saved, setSaved] : [liked, setLiked];
    set(!cur);
    try {
      await api(`/articles/${a._id}/${kind}`, { method: 'POST' });
      toast(kind === 'save' ? (cur ? 'Removed from saved' : 'Saved to your reading list') : cur ? 'Like removed' : 'Liked. We will show more like this.');
    } catch { set(cur); toast('Could not update. Check your connection and try again.'); }
  };
  const hide = async () => {
    try { await api(`/articles/${a._id}/dislike`, { method: 'POST' }); onHide(a._id); toast('Hidden. You will see fewer stories like this.'); }
    catch { toast('Could not hide this story. Try again.'); }
  };

  return (
    <article className={`acard ${variant}`}>
      <Link to={`/article/${a._id}`} className="cover-link" tabIndex={-1} aria-hidden="true">
        <Cover a={a} />
        {a.match != null && <Ring value={a.match} size={variant === 'feature' ? 56 : 46} />}
      </Link>
      <div className="abody">
        <div className="kicker">
          <i className="dot" style={{ background: catColor(a.category) }} />
          <strong>{a.category}</strong>
          <span>{a.source}</span>
          <span>{timeAgo(a.publishedAt)}</span>
          {a.seen && <span className="tag">Read</span>}
        </div>
        <h3><Link to={`/article/${a._id}`}>{a.title}</Link></h3>
        {variant !== 'row' && <p className="excerpt">{a.excerpt}</p>}
        {a.reasons?.length > 0 && <p className="why"><b>Why this story:</b> {a.reasons.join('. ')}</p>}
        <div className="actions">
          <button className={`iconbtn ${saved ? 'on' : ''}`} onClick={() => toggle('save')} aria-pressed={saved} aria-label={saved ? 'Remove from saved' : 'Save story'}><Icon name="bookmark" fill={saved} /></button>
          <button className={`iconbtn ${liked ? 'on' : ''}`} onClick={() => toggle('like')} aria-pressed={liked} aria-label={liked ? 'Remove like' : 'Like story'}><Icon name="heart" fill={liked} /></button>
          {onHide && <button className="iconbtn text" onClick={hide}>Not interested</button>}
          <span className="muted small push">{a.readingTime} min read</span>
        </div>
      </div>
    </article>
  );
}
