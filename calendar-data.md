# Zodiac calendar data

The date-only birth-year calculator uses Lunar New Year, not January 1 or Start of Spring. It accepts Gregorian years 1900–2100, inclusive. A year-only result is explicitly provisional. A full valid birthday is compared with that year's first lunar month/day.

## Provenance

`zodiac-new-years.json` was generated from fixed-version lunar-javascript 1.7.4 by calling `Lunar.fromYmd(year, 1, 1).getSolar().toYmd()` for each year. Every one of the 201 boundaries was cross-checked against solarlunar 2.0.7, accumulating lunar year lengths from Gregorian 1900-01-31. The libraries were used only during development; no package is loaded at runtime.

- https://cdn.jsdelivr.net/npm/lunar-javascript@1.7.4/lunar.js
- https://github.com/6tail/lunar-javascript
- https://cdn.jsdelivr.net/npm/lunar-javascript@1.7.4/LICENSE (MIT, Copyright 2018 6tail)
- https://cdn.jsdelivr.net/npm/solarlunar@2.0.7/lib/solarlunar.min.js
- https://github.com/yize/solarlunar (ISC)
- Independent public calendar reference for visitors: https://www.hko.gov.hk/en/gts/time/conversion.htm . HKO was not fetched successfully during implementation and is not represented as a completed cross-validation.

Regression anchors: 1900-01-31, 2000-02-05, 2026-02-17, 2027-02-06. A runtime experiment with Node 24/ICU mapped 2027-02-06 to the preceding lunar year, so Intl conversion was rejected for this feature. This lookup avoids browser-specific Chinese-calendar drift.

## Synchronization

The browser uses `zodiac-new-years.js`, the same 201 entries under `window.HANZI_NEW_YEARS`; tests compare every entry to the JSON source. Dates describe civil calendar days, not birth-hour astrology or timezone-adjusted moments. No birth time is requested.
