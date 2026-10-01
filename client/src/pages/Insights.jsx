import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { ActivityBars, BarList, Donut } from '../components/Charts.jsx';
import { Empty, PageHead } from '../components/UI.jsx';

export default function Insights() {
  const [d, setD] = useState(null);
  useEffect(() => { api('/me/insights').then(setD); }, []);
  if (!d) return <><PageHead title="Insights" /><p className="muted">Crunching your reading data…</p></>;
  const t = d.totals;
  const tiles = [['Stories opened', t.views], ['Fully read', t.read], ['Minutes reading', t.minutes], ['Day streak', t.streak], ['Liked', t.likes], ['Saved', t.saved]];
  const tone = d.sentiment, toneTotal = tone.positive + tone.neutral + tone.negative;

  return (
    <>
      <PageHead title="Your reading insights" sub="What Lumen has learned about you, and how you read." />
      <div className="tiles">{tiles.map(([l, v]) => <div className="tile" key={l}><b>{v}</b><span>{l}</span></div>)}</div>
      {t.views === 0 && <Empty title="No reading data yet">Open a few stories and this page will fill up. <Link to="/feed">Go to your feed.</Link></Empty>}
      <div className="panels">
        <section className="panel wide"><h2>Activity, last 14 days</h2><ActivityBars days={d.activity} /></section>
        <section className="panel"><h2>Stories by category</h2>{d.categories.length ? <Donut items={d.categories} /> : <p className="muted">Nothing opened yet.</p>}</section>
        <section className="panel"><h2>Words that define your taste</h2>{d.terms.length ? <BarList items={d.terms} /> : <p className="muted">Keywords appear after you read a few stories.</p>}</section>
        <section className="panel"><h2>Category affinity</h2>{d.affinity.length ? <BarList items={d.affinity} byCategory /> : <p className="muted">Affinity builds as you read, like and save.</p>}</section>
        <section className="panel">
          <h2>Tone of what you read</h2>
          {toneTotal ? (<>
            <div className="tonebar" role="img" aria-label="Positive, neutral and negative stories read">
              <i className="positive" style={{ flex: tone.positive }} /><i className="neutral" style={{ flex: tone.neutral }} /><i className="negative" style={{ flex: tone.negative }} />
            </div>
            <ul className="legend"><li><i className="positive" />Positive <b>{tone.positive}</b></li><li><i className="neutral" />Neutral <b>{tone.neutral}</b></li><li><i className="negative" />Negative <b>{tone.negative}</b></li></ul>
          </>) : <p className="muted">Tone appears once you finish reading a story.</p>}
        </section>
      </div>
    </>
  );
}
