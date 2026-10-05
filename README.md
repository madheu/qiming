# Hànzi — Chinese name generator

A small, dependency-free web tool that gives non-Chinese speakers a Chinese name
that sounds natural, plus the reasoning behind each choice.

Open [index.html](index.html) directly, or serve the folder with any static host.

## What it does

- Enter an English name
- Pick the energy the name should carry (12 style options)
- Optionally set gender context and whether to echo your original sound
- Get 3 names, each with characters, pinyin, per-character meaning, style tags,
  and a "why this name?" explanation
- Generate more, or start over

Everything runs client-side. No API key, no backend, no tracking, nothing stored.

## Files

| File | Purpose |
|---|---|
| `index.html` | Markup, form, results, social meta tags |
| `styles.css` | All styling and animation |
| `script.js` | Generator logic, seeded selection, character animation |
| `og-image.png` | 1200×630 social share card |
| `tools/make_og_image.py` | Regenerates `og-image.png` (needs Pillow) |

## Regenerating the social card

```bash
python tools/make_og_image.py
```

Edit `SITE_URL` in that script after the live domain is settled.

## Deploying

Static site — deploy as-is. On Cloudflare Pages:

- Framework preset: `None`
- Build command: *(leave empty)*
- Build output directory: `/`

## Notes

The generator is a curated, deterministic word list with a seeded selector: the
same inputs reproduce the same names, and different inputs (name, styles, gender,
sound preference, generation round) produce different ones. It is intentionally
simple — the interesting part of this product is naming taste, not machinery.
