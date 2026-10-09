# Hànzi — Chinese name generator

A small, dependency-free web tool that gives non-Chinese speakers a Chinese name
that sounds natural, plus the reasoning behind each choice.

Live: https://chinesename.cc.cd/ (deployed on Vercel; free subdomain provided by DNSHE)

## What it does

- Enter an English name
- Pick the energy the name should carry (12 style options)
- Optionally set gender context and whether to echo your original sound
- Get 3 names, each with characters, pinyin, per-character meaning, style tags,
  a "why this name?" explanation, and Copy / Share buttons
- Generate more, or start over

The original name and zodiac fallbacks run client-side. Optional one-shot naming
enhancements use the same-origin `/api/generate-name` endpoint; the browser never
receives the model API key and no conversation context is stored. If the endpoint
is unavailable, the UI uses the local curated fallback.

### OpenRouter configuration

The endpoint is compatible with OpenRouter. Set `MODEL_API_URL=https://openrouter.ai/api/v1/chat/completions` and `MODEL_API_KEY` in the server environment. The default `MODEL_NAME=openrouter/free` lets OpenRouter choose an available zero-cost model; set a pinned model when you need predictable behavior. Never commit a key file—local `API-KEY/` is ignored by git. The current endpoint test used the supplied key and returned HTTP 200; production still needs the environment variables configured in the hosting provider.

## Files

| File | Purpose |
|---|---|
| `index.html` | Markup, form, results, SEO/social metadata, examples, and FAQ |
| `styles.css` | Core styling and animation |
| `culture.css` | Responsive styling for SEO culture pages |
| `script.js` | Generator logic, seeded fallback selection, copy/share, funnel events |
| `name-agent-client.js` | One-shot same-origin Agent client; no key or context in the browser |
| `api/generate-name.js` | Serverless JSON endpoint, model call, validation and fallback |
| `name-data.js` / `given-names.js` | Curated fallback characters and example given names |
| `analytics.js` | Site URL config + event tracking (see below) |
| `og-image.png` | 1200×630 social share card |
| `tools/make_og_image.py` | Regenerates `og-image.png` (needs Pillow) |
| `tools/check_generator.js` | Runnable check for the generator + funnel events |

## Culture pages and SEO

- `/courtesy-name-generator/`: one-shot Chinese courtesy-name (字) generator; it generates 字 only, never 号, and explains peer/friend usage.
- `/japanese-name-to-chinese-name/`: one-shot Japanese-to-Chinese adaptation with conservative/adaptive family-name routes, pinyin, and a katakana reading aid.
- `/what-is-a-chinese-courtesy-name/`, `/how-to-choose-a-chinese-courtesy-name/`, and `/chinese-name-vs-courtesy-name/`: supporting courtesy-name SEO guides.
- `/chinese-zodiac/`: birth-year estimate with optional Gregorian month/day confirmation (1900–2100), using Lunar New Year rather than January 1.
- `/chinese-zodiac/year-of-the-horse-2026/`: twelve animal reflections, explicitly distinguished from predictions and traditional calendar facts.
- `zodiac-new-years.json` is the source data; `zodiac-new-years.js` is the browser copy. See `calendar-data.md` for provenance. Keep both synchronized; the check compares both copies and validates all 201 new-year boundaries plus anchor dates.
- `culture.css` shares the existing design tokens. New pages do not load GA or other analytics providers. `HanziCulture.events` records local, in-memory interactions with the sign and confirmation status only, never the birthday; homepage clicks use the already-loaded provider.
- Homepage includes static examples and FAQ. All three pages have canonical URLs and JSON-LD and are listed in `sitemap.xml`.

Run checks:

```bash
node tools/check_generator.js
node tools/check_name_api.js
node tools/check_zodiac.js
python tools/check_seo.py
```

These are local changes, not an automatic deployment. After deploying, check all three public URLs and submit the updated sitemap through Search Console. Fortune sticks are intentionally deferred to phase two.

## Analytics

Optional, configured at the top of `analytics.js`. Leave the id empty and nothing
loads — the page works fine with no analytics at all.

Actual readings are logged in `analytics-log.md` (one snapshot per reading, with the
exact date range and sample size, so later numbers can be compared).

### Google Analytics 4

GA4 covers both layers we care about, so there is only one service to manage:
traffic (visits, referrers, countries, devices) plus the custom funnel events.

1. GA4 → **Admin → Data streams → Web** → add `https://chinesename.cc.cd`
2. Copy the **Measurement ID** (`G-XXXXXXXXXX`)
3. Paste it into `ga4MeasurementId` in `analytics.js`

Then in GA4, mark `generate` (and ideally `copy_name`) as **key events** so they
appear under conversions, and build a funnel in **Explore**.

⚠️ GA4 sets cookies. If you get EU/UK traffic you need a consent banner before
the tag loads; see the note below.

### Event names

Keep these names stable — renaming one breaks the funnel, and GA4 cannot
backfill history.

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
`generation`; copy/share carry `chinese_name`.

### Reading the funnel

```
visits                 -> GA4 traffic reports
  form_start           -> intent
    generate           -> activation   <-- the number that matters most
      copy_name        -> real interest
      share_name       -> worth telling others
  regenerate           -> the names were not good enough
```

If `generate / visits` is low, the landing copy or the form is the problem. If
`generate` is healthy but `copy_name` is near zero, the *names* are the problem —
which is the whole product.

### Cookies / consent

GA4 is cookie-based and needs consent in the EU/UK. Options when that matters:
gate the tag behind a consent banner, enable GA4's consent mode, or switch to a
cookieless tool. Until EU traffic is real, the simplest safe move is to add a
banner before promoting the site in Europe.

### Verifying before GA4 is wired up

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

Static site, no build step — any static host works. Vercel settings:

- Framework preset: `Other`
- Build command: *(leave empty)*
- Output directory: *(leave empty, serves the repo root)*

### Why Vercel and not Cloudflare

The site was first deployed to a Cloudflare Worker, but `chinesename.cc.cd` cannot be
attached to it. Cloudflare only accepts a bare root domain as a zone for non-Enterprise
accounts, so a delegated subdomain cannot be added, and a Worker/Pages custom domain
requires the hostname to live in a zone in your account. Vercel allows binding a
subdomain you only hold a CNAME for, which is what DNSHE gives you.

Analytics is independent of the host — GA4 is loaded by `analytics.js` as a plain
script tag, so it works the same on Vercel, Cloudflare, or anywhere else.

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
