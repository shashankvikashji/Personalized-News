import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

export function applyTheme(t = 'system') {
  const dark = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  localStorage.setItem('theme', t);
}

const AuthCtx = createContext();
const ToastCtx = createContext(() => {});
export const useAuth = () => useContext(AuthCtx);
export const useToast = () => useContext(ToastCtx);

export function Providers({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (!localStorage.getItem('token')) return setReady(true);
    api('/auth/me').then((u) => { setUser(u); applyTheme(u.theme); })
      .catch(() => localStorage.removeItem('token')).finally(() => setReady(true));
  }, []);

  const signIn = ({ token, user }) => { localStorage.setItem('token', token); setUser(user); applyTheme(user.theme); };
  const signOut = () => { localStorage.removeItem('token'); setUser(null); };
  const toast = useCallback((msg) => {
    const id = Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  return (
    <AuthCtx.Provider value={{ user, setUser, ready, signIn, signOut }}>
      <ToastCtx.Provider value={toast}>
        {children}
        <div className="toasts" role="status" aria-live="polite">{toasts.map((t) => <div key={t.id} className="toast">{t.msg}</div>)}</div>
      </ToastCtx.Provider>
    </AuthCtx.Provider>
  );
}
