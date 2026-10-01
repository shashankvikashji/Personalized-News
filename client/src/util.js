export const CATS = ['Technology', 'Business', 'Science', 'Health', 'Sports', 'Entertainment', 'World', 'Environment'];
export const HUE = { Technology: 215, Business: 35, Science: 265, Health: 165, Sports: 12, Entertainment: 320, World: 195, Environment: 130 };
export const hue = (c) => HUE[c] ?? 210;
export const catColor = (c) => `hsl(${hue(c)} 62% 46%)`;
export function timeAgo(d) {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  if (s < 604800) return `${Math.round(s / 86400)} d ago`;
  return new Date(d).toLocaleDateString('en', { day: 'numeric', month: 'short' });
}
export const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };
