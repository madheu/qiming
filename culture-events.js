/* Culture pages record only local, in-memory interactions: no cookies or birthday data. */
(function () {
  const events = [];
  window.HanziCulture = {
    events,
    track(event, props = {}) {
      events.push({ event, props, path: location.pathname });
      if (events.length > 100) events.shift();
      // Use the homepage's existing provider only when it has already loaded.
      if (window.HANZI) window.HANZI.track(event, props);
    }
  };
  document.addEventListener('click', event => {
    const link = event.target.closest('[data-culture-link]');
    if (link) window.HanziCulture.track('culture_link', { destination: link.getAttribute('href') });
  });
})();
