# Hànzi — Chinese name generator

A small, dependency-free web tool that gives non-Chinese speakers a Chinese name
that sounds natural, plus the reasoning behind each choice.

Live: https://qiming.abc15531888397.workers.dev/

## What it does

- Enter an English name
- Pick the energy the name should carry (12 style options)
- Optionally set gender context and whether to echo your original sound
- Get 3 names, each with characters, pinyin, per-character meaning, style tags,
  a "why this name?" explanation, and Copy / Share buttons
- Generate more, or start over

Everything runs client-side. No API key, no backend, no accounts, nothing stored
on a server.

## Files

| File | Purpose |
|---|---|
| `index.html` | Markup, form, results, social meta tags |
| `styles.css` | All styling and animation |
| `script.js` | Generator logic, seeded selection, copy/share, funnel events |
| `analytics.js` | Site URL config + event tracking (see below) |
| `og-image.png` | 1200×630 social share card |
| `tools/make_og_image.py` | Regenerates `og-image.png` (needs Pillow) |
| `tools/check_generator.js` | Runnable check for the generator + funnel events |

## Analytics

Two optional layers, configured at the top of `analytics.js`. Leave an id empty
and that layer simply is not loaded — the page works fine with none configured.

### 1. Traffic — Cloudflare Web Analytics

Visits, referrers, countries, devices, Core Web Vitals. Free, cookieless, no
consent banner needed.

- **Custom domain on Cloudflare (proxied):** dashboard → *Analytics & Logs* →
  *Web Analytics* → add the site, and leave `cloudflareToken` empty. Cloudflare
  injects the beacon automatically.
- **workers.dev / any other host:** add the site in the same dashboard screen to
  get a **beacon token**, then paste it into `cloudflareToken`.

### 2. Funnel events — Umami

Cloudflare Web Analytics is pageview-only, so it cannot answer "did anyone
actually generate a name?". That needs custom events.

Create a free account at https://cloud.umami.is → *Add website* → copy the
website id into `umamiWebsiteId`. Cookies are not used, so no consent banner.

### Event names

Keep these names stable — renaming one breaks the funnel.

| Event | Fired when | Tells you |
|---|---|---|
| `generate` | "Generate my Chinese name" clicked | **activation** — did a visitor actually use it |
| `regenerate` | "Generate 3 more" clicked | engagement — not satisfied with the first 3 |
| `copy_name` | a name was copied | strong interest — they want to keep it |
| `share_name` | a name was shared | strongest signal |
| `style_pick` | a style chip toggled | which energies people want |
| `form_start` | first keystroke in the name field | intent, before committing |
| `start_over` | "Start over" clicked | restart behaviour |

`generate` carries `has_name`, `styles`, `gender`, `pronunciation` and
`generation` as properties, so the funnel can be sliced by the actual choices.

### Reading the funnel

```
visits                 -> Cloudflare Web Analytics
  form_start           -> intent
    generate           -> activation   <-- the number that matters most
      copy_name        -> real interest
      share_name       -> worth telling others
  regenerate           -> the names were not good enough
```

If `generate` / visits is low, the landing copy or the form is the problem. If
`generate` is healthy but `copy_name` is near zero, the *names* are the problem —
which is the whole product.

### Verifying before any provider is wired up

Events are also kept in memory. Open the console on the live page, use the tool,
then run:

```js
HANZI.events
```

## Regenerating the social card

```bash
python tools/make_og_image.py
```

Change `SITE_URL` in that script after the domain changes.

## Checks

```bash
node tools/check_generator.js
```

Drives the real `script.js` against a stubbed DOM: asserts 3 distinct names are
rendered, that 40 consecutive rounds never repeat a name, and that every funnel
event still fires.

## Deploying

Static site — deploy as-is. There is no build step.

- Build command: *(leave empty)*
- Build output directory: `/`

## Domains

The absolute URL appears in three places, because crawlers read static HTML and
cannot run JavaScript:

1. `index.html` — `canonical`, `og:url`, `og:image`, `twitter:image`
2. `analytics.js` — `config.siteUrl` (share links and copied text)
3. `tools/make_og_image.py` — `SITE_URL` (the printed URL on the card)

Update all three together, then regenerate `og-image.png`.

## Notes

The generator is a curated, deterministic word list with a seeded selector: the
same inputs reproduce the same names, and different inputs (name, styles, gender,
sound preference, generation round) produce different ones. Intentionally simple —
the interesting part of this product is naming taste, not machinery.
