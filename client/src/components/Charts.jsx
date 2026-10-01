import { catColor } from '../util.js';

export function BarList({ items, byCategory }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="barlist">
      {items.map((i) => (
        <li key={i.label}>
          <span className="bl-label">{i.label}</span>
          <span className="bl-track"><i style={{ width: `${(i.value / max) * 100}%`, background: byCategory ? catColor(i.label) : 'var(--brand)' }} /></span>
          <span className="bl-val">{i.value}</span>
        </li>
      ))}
    </ul>
  );
}

export function Donut({ items }) {
  const total = items.reduce((s, i) => s + i.value, 0) || 1, r = 42, c = 2 * Math.PI * r;
  let off = 0;
  return (
    <div className="donut">
      <svg viewBox="0 0 100 100" role="img" aria-label="Reads by category">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--line)" strokeWidth="14" />
        {items.map((i) => {
          const len = (c * i.value) / total;
          const el = <circle key={i.label} cx="50" cy="50" r={r} fill="none" stroke={catColor(i.label)} strokeWidth="14" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-off} transform="rotate(-90 50 50)" />;
          off += len; return el;
        })}
        <text x="50" y="55" textAnchor="middle">{items.reduce((s, i) => s + i.value, 0)}</text>
      </svg>
      <ul>{items.map((i) => <li key={i.label}><i style={{ background: catColor(i.label) }} />{i.label}<b>{i.value}</b></li>)}</ul>
    </div>
  );
}

export function ActivityBars({ days }) {
  const max = Math.max(1, ...days.map((d) => d.value));
  return (
    <div className="activity" role="img" aria-label="Stories opened per day, last 14 days">
      {days.map((d, i) => (
        <div key={i} className="ab"><i className={d.value ? 'on' : ''} style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }} title={`${d.label}: ${d.value}`} /><span>{d.label}</span></div>
      ))}
    </div>
  );
}
