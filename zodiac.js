/* Lunar New Year dates: lunar-javascript 1.7.4, cross-checked with solarlunar 2.0.7.
   See zodiac-new-years.json and calendar-data.md. No runtime calendar dependency. */
(function (root) {
  'use strict';
  const animals = [
    ['rat', 'Rat', '鼠', 'Shǔ', 'resourcefulness and adaptability'],
    ['ox', 'Ox', '牛', 'Niú', 'patience and steady effort'],
    ['tiger', 'Tiger', '虎', 'Hǔ', 'courage and initiative'],
    ['rabbit', 'Rabbit', '兔', 'Tù', 'gentleness and care'],
    ['dragon', 'Dragon', '龙', 'Lóng', 'imagination and ambition'],
    ['snake', 'Snake', '蛇', 'Shé', 'thoughtfulness and intuition'],
    ['horse', 'Horse', '马', 'Mǎ', 'independence and movement'],
    ['goat', 'Goat', '羊', 'Yáng', 'creativity and kindness'],
    ['monkey', 'Monkey', '猴', 'Hóu', 'curiosity and ingenuity'],
    ['rooster', 'Rooster', '鸡', 'Jī', 'attention and diligence'],
    ['dog', 'Dog', '狗', 'Gǒu', 'loyalty and fairness'],
    ['pig', 'Pig', '猪', 'Zhū', 'generosity and openness']
  ].map(([id, name, han, pinyin, qualities]) => ({ id, name, han, pinyin, qualities }));
  const absent = value => value === undefined || value === null || value === '';
  function calculateZodiac(year, month, day) {
    if (absent(year) || !Number.isInteger(Number(year)) || Number(year) < 1900 || Number(year) > 2100) {
      throw new RangeError('Enter a whole birth year from 1900 to 2100.');
    }
    year = Number(year);
    let zodiacYear = year;
    const confirmed = !absent(month) || !absent(day);
    if (confirmed) {
      if (absent(month) || absent(day)) throw new RangeError('Add both your birth month and day, or leave both blank.');
      month = Number(month); day = Number(day);
      const date = new Date(Date.UTC(year, month - 1, day, 12));
      if (!Number.isInteger(month) || !Number.isInteger(day) || month < 1 || month > 12 || day < 1 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
        throw new RangeError('Enter a valid birthday for that year.');
      }
      const boundary = root.HANZI_NEW_YEARS && root.HANZI_NEW_YEARS[String(year)];
      if (!boundary) throw new Error('This browser cannot load the Chinese calendar dates. Try again or leave month and day blank for a year-only estimate.');
      const birthday = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      zodiacYear = birthday < boundary ? year - 1 : year;
    }
    return { animal: animals[((zodiacYear - 2020) % 12 + 12) % 12], zodiacYear, confirmed };
  }
  const api = { animals, calculateZodiac };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (!root.document) return;
  root.HanziZodiac = api;
  root.document.addEventListener('DOMContentLoaded', () => {
    const form = root.document.getElementById('zodiac-form');
    if (!form) return;
    const result = root.document.getElementById('zodiac-result');
    form.addEventListener('submit', event => {
      event.preventDefault();
      try {
        const value = calculateZodiac(
          root.document.getElementById('birth-year').value,
          root.document.getElementById('birth-month').value,
          root.document.getElementById('birth-day').value
        );
        const animal = value.animal;
        result.innerHTML = `<p class="culture-kicker">${value.confirmed ? 'Confirmed using your birthday' : 'Year-only estimate · not yet confirmed'}</p><h2 id="result-title"><span lang="zh">${animal.han}</span> ${animal.name}</h2><p class="pinyin">${animal.pinyin} · Chinese zodiac</p><p>${value.confirmed ? `Your birthday falls in the ${animal.name} zodiac year.` : `Most of ${value.zodiacYear} falls in the Year of the ${animal.name}. If you were born in January or February, add your month and day to confirm: you may belong to the previous sign.`}</p><p>In popular zodiac symbolism, the ${animal.name} is associated with ${animal.qualities}. These are cultural associations, not a personality test or a prediction.</p><div class="culture-actions"><a href="/chinese-zodiac/year-of-the-horse-2026/#${animal.id}" data-culture-link>Explore ${animal.name} in the 2026 Horse year ↗</a><a href="/#generator" data-culture-link>Find a Chinese name with qualities you love ↗</a></div>`;
        root.HanziCulture?.track('zodiac_calculate', { sign: animal.id, confirmed: value.confirmed });
      } catch (error) {
        result.textContent = error.message;
      }
    });
  });
})(typeof window === 'undefined' ? globalThis : window);
