/**
 * Analytics + shared site config for Hànzi.
 *
 * One optional provider: Google Analytics 4. It covers both layers we care
 * about, so there is no second service to keep in sync.
 *   1. Traffic — visits, referrers, countries, devices (GA4 collects by default)
 *   2. Funnel  — the custom events below
 *
 * Leave ga4MeasurementId empty and nothing loads; the page works fine.
 *
 * Event names are stable on purpose — renaming one breaks the funnel, and GA4
 * cannot backfill history.
 *   generate      clicked "Generate my Chinese name"   (activation)
 *   regenerate    clicked "Generate 3 more"            (engagement)
 *   copy_name     copied one of the names              (strong interest)
 *   share_name    shared one of the names
 *   start_over    clicked "Start over"
 *   style_pick    picked/cleared a style chip
 *   form_start    first keystroke in the name field
 *
 * Mark `generate` (and ideally `copy_name`) as key events in GA4 so they show
 * up under conversions.
 */
window.HANZI = (function () {
  var config = {
    // Used for share links and the copied share text.
    siteUrl: 'https://chinesename.cc.cd',

    // GA4 -> Admin -> Data streams -> Web -> your stream -> Measurement ID.
    // Looks like 'G-XXXXXXXXXX'.
    ga4MeasurementId: '',
  };

  if (config.ga4MeasurementId) {
    // gtag must exist before the library loads so early events are queued
    // in dataLayer instead of being dropped.
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', config.ga4MeasurementId);

    var ga = document.createElement('script');
    ga.async = true;
    ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(config.ga4MeasurementId);
    document.head.appendChild(ga);
  }

  // Kept locally as well so the funnel can be verified before any provider is
  // wired up: open the console, use the page, run HANZI.events.
  var log = [];

  function track(event, data) {
    var props = data || {};
    log.push({ event: event, props: props, at: new Date().toISOString(), path: location.pathname });
    if (log.length > 100) log.shift();
    try { localStorage.setItem('hanzi_events', JSON.stringify(log)); } catch (e) { /* private mode */ }

    try {
      if (typeof window.gtag === 'function') window.gtag('event', event, props);
    } catch (e) { /* never let analytics break the page */ }
  }

  return { config: config, track: track, get events() { return log.slice(); } };
})();
