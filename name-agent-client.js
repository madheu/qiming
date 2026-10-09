/* One-shot browser client. It never stores context and never contains a model key. */
(function (root) {
  'use strict';
  const endpoint = '/api/generate-name';
  const RECENT_KEY = 'hanzi-recent-names-v1';
  const TTL = 30 * 24 * 60 * 60 * 1000;
  function recent() {
    try {
      const now = Date.now();
      const items = JSON.parse(root.localStorage.getItem(RECENT_KEY) || '[]').filter(item => item && item.name && now - item.at < TTL);
      root.localStorage.setItem(RECENT_KEY, JSON.stringify(items));
      return items.map(item => item.name);
    } catch (_) { return []; }
  }
  function remember(task, value) {
    const names = task === 'chinese-name' ? (value.results || []).map(item => item.characters) : task === 'courtesy-name' ? [value.courtesyName && value.courtesyName.characters] : [value.chineseName];
    try {
      const now = Date.now(); const items = JSON.parse(root.localStorage.getItem(RECENT_KEY) || '[]').filter(item => item && item.name && now - item.at < TTL);
      names.filter(Boolean).forEach(name => { if (!items.some(item => item.name === name)) items.push({ name, at: now }); });
      root.localStorage.setItem(RECENT_KEY, JSON.stringify(items));
    } catch (_) { /* private browsing: the API still works without history */ }
  }

  function valid(task, value) {
    if (!value || typeof value !== 'object') return false;
    if (task === 'chinese-name') return Array.isArray(value.results) && value.results.length > 0;
    if (task === 'courtesy-name') return typeof value.givenName === 'string' && value.courtesyName && typeof value.courtesyName.characters === 'string' && !/号|art\s*name/i.test(JSON.stringify(value));
    return typeof value.chineseName === 'string' && typeof value.pinyin === 'string' && typeof value.katakana === 'string';
  }

  async function generate(request, fallback) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({}, request, { recentlyUsed: recent() })),
        credentials: 'same-origin'
      });
      if (!response.ok) throw new Error(`Naming service returned ${response.status}`);
      const value = await response.json();
      if (!valid(request.task, value)) throw new Error('Naming service returned an invalid result');
      const names = request.task === 'chinese-name' ? value.results.map(item => item.characters) : request.task === 'courtesy-name' ? [value.courtesyName.characters] : [value.chineseName];
      if (names.some(name => recent().includes(name))) throw new Error('No fresh suggestion available');
      remember(request.task, value);
      return { value, fallback: Boolean(value.fallback) };
    } catch (_) {
      const value = typeof fallback === 'function' ? fallback(request) : null;
      if (value) remember(request.task, value);
      return { value, fallback: true };
    }
  }

  root.HanziNameAgent = { endpoint, valid, generate };
})(typeof window === 'undefined' ? globalThis : window);
