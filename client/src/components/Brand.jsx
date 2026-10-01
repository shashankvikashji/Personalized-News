import { Link } from 'react-router-dom';
export default function Brand({ to = '/' }) {
  return (
    <Link to={to} className="brand" aria-label="Lumen home">
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><rect width="32" height="32" rx="9" fill="var(--brand)" /><path d="M9 8h5v12h9v4H9z" fill="var(--brand-ink)" /><circle cx="23" cy="10" r="2.8" fill="var(--accent)" /></svg>
      <span>Lumen</span>
    </Link>
  );
}
