import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './ctx.jsx';
import Shell from './components/Shell.jsx';
import Landing from './pages/Landing.jsx';
import HowItWorks from './pages/HowItWorks.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Feed from './pages/Feed.jsx';
import Explore from './pages/Explore.jsx';
import Trending from './pages/Trending.jsx';
import ArticleView from './pages/ArticleView.jsx';
import Saved from './pages/Saved.jsx';
import History from './pages/History.jsx';
import Insights from './pages/Insights.jsx';
import Settings from './pages/Settings.jsx';
import Admin from './pages/Admin.jsx';

function Protected({ children, admin }) {
  const { user, ready } = useAuth();
  const loc = useLocation();
  if (!ready) return <div className="splash">Loading…</div>;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (!user.onboarded && loc.pathname !== '/onboarding') return <Navigate to="/onboarding" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/feed" replace />;
  return children;
}

const NotFound = () => (
  <div className="splash"><h1>Page not found</h1><p className="muted">The page you are looking for does not exist or has moved.</p><Link className="btn primary" to="/">Go to the home page</Link></div>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/onboarding" element={<Protected><Onboarding /></Protected>} />
      <Route element={<Protected><Shell /></Protected>}>
        <Route path="/feed" element={<Feed />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/article/:id" element={<ArticleView />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/history" element={<History />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<Protected admin><Admin /></Protected>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
