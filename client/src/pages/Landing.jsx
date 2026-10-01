import { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicNav from '../components/PublicNav.jsx';
import Brand from '../components/Brand.jsx';
import { Ring } from '../components/Cover.jsx';
import { CATS, catColor } from '../util.js';

const SAMPLE = [
  { cat: 'Technology', t: 'New AI chip cuts data-center energy use by 40 percent' },
  { cat: 'Science', t: 'Telescope captures sharpest image yet of a distant galaxy cluster' },
  { cat: 'Sports', t: 'Underdog club stuns league leaders with a last-minute goal' },
  { cat: 'Health', t: 'Study links regular walking to lower risk of heart disease' },
  { cat: 'Business', t: 'Central bank holds rates as inflation continues to cool' },
  { cat: 'Environment', t: 'Solar and wind overtake coal in monthly power generation' },
  { cat: 'Entertainment', t: 'Independent film sweeps the top festival awards' },
  { cat: 'World', t: 'Diplomats welcome ceasefire after months of talks' },
];

export default function Landing() {
  const [sel, setSel] = useState(['Technology', 'Science']);
  const toggle = (c) => setSel((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));
  const list = SAMPLE.map((s, i) => ({ ...s, match: sel.includes(s.cat) ? 97 - i : 34 + i * 2 })).sort((a, b) => b.match - a.match).slice(0, 4);

  return (
    <div className="public">
      <PublicNav />
      <section className="hero">
        <div className="hero-copy">
          <h1>News that learns what you actually read.</h1>
          <p className="lead">Lumen ranks every story against your interests, your reading habits and how similar it is to what you finished last week. Each pick tells you exactly why it is there.</p>
          <div className="row">
            <Link className="btn primary lg" to="/register">Create a free account</Link>
            <Link className="btn lg" to="/how-it-works">See how it works</Link>
          </div>
          <p className="muted small">Try it on the right. Change your interests and watch the ranking change.</p>
        </div>
        <div className="demo" aria-label="Interactive ranking demo">
          <p className="demo-label">I am interested in</p>
          <div className="chips" role="group" aria-label="Choose interests">
            {CATS.map((c) => <button key={c} className={`chip ${sel.includes(c) ? 'on' : ''}`} style={{ '--c': catColor(c) }} aria-pressed={sel.includes(c)} onClick={() => toggle(c)}>{c}</button>)}
          </div>
          <ol className="demo-list">
            {list.map((s) => (
              <li key={s.t}>
                <Ring value={s.match} size={44} />
                <div><strong>{s.t}</strong><span className="muted small">{sel.includes(s.cat) ? `Matches your interest in ${s.cat}` : `${s.cat}. Shown because it is fresh`}</span></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="band">
        <h2>Three steps happen behind every headline</h2>
        <div className="steps">
          <div><h3>1. Read</h3><p>Each story is tokenised, stemmed and turned into a TF-IDF vector. We also extract keywords, a three-sentence summary and a sentiment score.</p></div>
          <div><h3>2. Learn</h3><p>Opening, finishing, liking, saving or hiding a story nudges your interest profile. Recent behaviour counts more than old clicks.</p></div>
          <div><h3>3. Explain</h3><p>Stories are scored and shown with a match percentage and plain-language reasons, so the feed is never a black box.</p></div>
        </div>
        <pre className="formula" aria-label="Scoring formula">score = 0.40 × content match + 0.30 × category affinity + 0.20 × freshness + 0.10 × popularity</pre>
      </section>

      <section className="features">
        <h2>Made for readers, and for the people who run the newsroom</h2>
        <dl>
          <div><dt>A feed you can question</dt><dd>See why each story ranks where it does. Hide anything with one tap and the model adjusts straight away.</dd></div>
          <div><dt>Reading insights</dt><dd>Track your streak, minutes read, favourite topics and the keywords that define your taste.</dd></div>
          <div><dt>Save, revisit, continue</dt><dd>Keep a reading list, browse your history, and jump to similar stories from any article.</dd></div>
          <div><dt>Admin console</dt><dd>Publish stories, import RSS feeds and watch category engagement from one dashboard.</dd></div>
        </dl>
      </section>

      <section className="cta">
        <h2>Your first feed takes about thirty seconds</h2>
        <p>Pick three topics. Lumen does the rest.</p>
        <Link className="btn primary lg" to="/register">Get started</Link>
      </section>
      <footer className="footer"><Brand /><span className="muted small">Built with React, Node.js, Express, MongoDB and a custom NLP engine.</span></footer>
    </div>
  );
}
