const API = import.meta.env.VITE_API_URL || ''

export async function setProgress(id, value) {
  const r = await fetch(API + `/api/anime/${id}/progress`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value })
  });
  return r.json();
}

export async function getFeatures() {
  const r = await fetch(API + `/api/features`);
  return r.json(); // { jikanEnabled: boolean }
}

export async function fetchAnime(status) {
  const url = status ? `/api/anime?status=${status}` : '/api/anime'
  const r = await fetch(API + url)
  return r.json()
}

export async function addAnime(payload) {
  const r = await fetch(API + '/api/anime', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)})
  return r.json()
}

export async function updateProgress(id, delta) {
  const r = await fetch(API + `/api/anime/${id}/progress`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ delta })})
  return r.json()
}

export async function setRating(id, rating) {
  const r = await fetch(API + `/api/anime/${id}/rating`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ rating })})
  return r.json()
}

export async function fetchStats() {
  const r = await fetch(API + '/api/stats')
  return r.json()
}

export async function deleteAnime(id) {
  const r = await fetch((import.meta.env.VITE_API_URL || '') + `/api/anime/${id}`, { method: 'DELETE' });
  if (!r.ok && r.status !== 204) {
    const t = await r.text();
    throw new Error(`Delete failed: ${t || r.status}`);
  }
}

export async function searchJikan(q) {
  const API = import.meta.env.VITE_API_URL || '';
  const r = await fetch(API + `/api/search?q=${encodeURIComponent(q)}`);
  if (!r.ok) throw new Error(`Search failed: ${r.status}`);
  return r.json();
}
