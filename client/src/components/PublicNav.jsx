import { Link } from 'react-router-dom';
import { useAuth } from '../ctx.jsx';
import Brand from './Brand.jsx';

export default function PublicNav() {
  const { user } = useAuth();
  return (
    <header className="pubnav">
      <Brand />
      <nav className="row">
        <Link to="/how-it-works" className="navlink">How it works</Link>
        {user ? <Link to="/feed" className="btn primary">Open my feed</Link> : (<><Link to="/login" className="navlink">Sign in</Link><Link to="/register" className="btn primary">Get started</Link></>)}
      </nav>
    </header>
  );
}
