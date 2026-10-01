export async function api(path, { method = 'GET', body, keepalive } = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch('/api' + path, {
    method, keepalive,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.message || 'Request failed. Please try again.'), { status: res.status });
  return data;
}
