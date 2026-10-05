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

Optional, configured at the top of `analytics.js`. Leave the id empty and nothing
loads — the page works fine with no analytics at all.

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
