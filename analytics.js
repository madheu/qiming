/**
 * Analytics + shared site config for Hànzi.
 *
 * Two independent, optional layers:
 *   1. Traffic  (visits, referrers, countries, Core Web Vitals) -> Cloudflare Web Analytics
 *   2. Funnel   (generate / regenerate / copy / share)          -> Umami
 *
 * Leave an id empty and that layer is simply not loaded. The page works
 * normally with no analytics configured at all.
 *
 * Event names are stable on purpose — renaming one breaks the funnel.
 *   generate      clicked "Generate my Chinese name"   (activation)
 *   regenerate    clicked "Generate 3 more"            (engagement)
 *   copy_name     copied one of the names              (strong interest)
 *   share_name    shared one of the names
 *   start_over    clicked "Start over"
 *   style_pick    picked/cleared a style chip
 *   form_start    first keystroke in the name field
 */
window.HANZI = (function () {
  var config = {
    // Used for share links and the copied share text.
    siteUrl: 'https://qiming.abc15531888397.workers.dev',

    // Cloudflare dashboard -> Analytics & Logs -> Web Analytics.
    // Paste the beacon token. Leave empty if you enabled it at the zone level,
    // which injects the beacon automatically and needs no code here.
    cloudflareToken: '',

    // https://cloud.umami.is -> Add website -> copy the website id.
    umamiWebsiteId: '',
  };

  // ---- providers ---------------------------------------------------------
  if (config.cloudflareToken) {
    var cf = document.createElement('script');
    cf.defer = true;
    cf.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    cf.setAttribute('data-cf-beacon', JSON.stringify({ token: config.cloudflareToken }));
    document.head.appendChild(cf);
  }

  if (config.umamiWebsiteId) {
    var um = document.createElement('script');
    um.defer = true;
    um.src = 'https://cloud.umami.is/script.js';
    um.setAttribute('data-website-id', config.umamiWebsiteId);
    document.head.appendChild(um);
  }

  // ---- event tracking -----------------------------------------------------
  // Kept locally as well so the funnel can be verified before any provider
  // is wired up: open the console, use the page, run HANZI.events.
  var log = [];

  function track(event, data) {
    var props = data || {};
    log.push({ event: event, props: props, at: new Date().toISOString(), path: location.pathname });
    if (log.length > 100) log.shift();
    try { localStorage.setItem('hanzi_events', JSON.stringify(log)); } catch (e) { /* private mode */ }

    try {
      if (window.umami && typeof window.umami.track === 'function') window.umami.track(event, props);
      if (typeof window.plausible === 'function') window.plausible(event, { props: props });
    } catch (e) { /* never let analytics break the page */ }
  }

  return { config: config, track: track, get events() { return log.slice(); } };
})();
