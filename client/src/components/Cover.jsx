import { useState } from 'react';
import { hue } from '../util.js';

export function Cover({ a, className = '' }) {
  const [bad, setBad] = useState(false);
  if (a.image && !bad) return <img className={`cover ${className}`} src={a.image} alt="" loading="lazy" onError={() => setBad(true)} />;
  return (
    <div className={`cover ${className}`} style={{ '--h': hue(a.category) }} aria-hidden="true">
      <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice"><circle cx="165" cy="18" r="70" /><circle cx="28" cy="116" r="55" /><path d="M0 92Q50 58 100 86T200 70V120H0z" /></svg>
      <span>{a.category}</span>
    </div>
  );
}

export function Ring({ value, size = 46 }) {
  const r = 18, c = 2 * Math.PI * r;
  return (
    <div className="ring" style={{ width: size, height: size }} title={`${value}% match with your interests`}>
      <svg viewBox="0 0 44 44"><circle cx="22" cy="22" r={r} className="ring-bg" /><circle cx="22" cy="22" r={r} className="ring-fg" strokeDasharray={`${(c * value) / 100} ${c}`} transform="rotate(-90 22 22)" /></svg>
      <b>{value}</b>
    </div>
  );
}
