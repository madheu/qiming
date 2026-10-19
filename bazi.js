/* Four-pillars (八字) calendar computation.
 *
 * Deterministic calendar arithmetic only. This file contains no interpretation,
 * no scoring and no prediction — it turns a date and time into the traditional
 * four pillars and stops there.
 *
 * Conventions (documented on /bazi/):
 *   - All moments are China Standard Time (UTC+8).
 *   - The year starts at 立春, not 1 January.
 *   - A month starts at its 节 (立春, 惊蛰, ...), not on the 1st.
 *   - The day starts at 23:00 (晚子时): 23:00 or later belongs to the next day.
 */
(function (root) {
  'use strict';

  var STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  var STEM_PY = ['jiǎ', 'yǐ', 'bǐng', 'dīng', 'wù', 'jǐ', 'gēng', 'xīn', 'rén', 'guǐ'];
  var BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  var BRANCH_PY = ['zǐ', 'chǒu', 'yín', 'mǎo', 'chén', 'sì', 'wǔ', 'wèi', 'shēn', 'yǒu', 'xū', 'hài'];
  var STEM_ELEMENT = ['wood', 'wood', 'fire', 'fire', 'earth', 'earth', 'metal', 'metal', 'water', 'water'];
  var BRANCH_ELEMENT = ['water', 'earth', 'wood', 'wood', 'earth', 'fire', 'fire', 'earth', 'metal', 'metal', 'earth', 'water'];
  var ELEMENTS = ['wood', 'fire', 'earth', 'metal', 'water'];
  var ELEMENT_CN = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };
  var ZODIAC = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
  // 小寒 立春 惊蛰 清明 立夏 芒种 小暑 立秋 白露 寒露 立冬 大雪
  var JIE_BRANCH = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0];
  var JIE_NAME = ['小寒', '立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪'];
  var MONTH_NAME = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  function keyOf(y, m, d, h, mi) {
    return (((y * 13 + m) * 32 + d) * 24 + h) * 60 + mi;
  }

  var terms = null;

  function buildTerms() {
    var data = root.HANZI_BAZI;
    if (!data) throw new Error('HANZI_BAZI data is missing');
    var out = [];
    for (var y = 1900; y <= 2100; y++) {
      var row = data.jie[String(y)];
      if (!row) continue;
      for (var i = 0; i < 12; i++) {
        var s = row[i];
        out.push({
          key: keyOf(y, parseInt(s.slice(0, 2), 10), parseInt(s.slice(2, 4), 10),
                     parseInt(s.slice(4, 6), 10), parseInt(s.slice(6, 8), 10)),
          year: y,
          month: parseInt(s.slice(0, 2), 10),
          day: parseInt(s.slice(2, 4), 10),
          hour: parseInt(s.slice(4, 6), 10),
          minute: parseInt(s.slice(6, 8), 10),
          branch: JIE_BRANCH[i],
          name: JIE_NAME[i]
        });
      }
    }
    out.sort(function (a, b) { return a.key - b.key; });
    return out;
  }

  function termBefore(key) {
    if (!terms) terms = buildTerms();
    var lo = 0, hi = terms.length - 1, found = -1;
    while (lo <= hi) {
      var mid = (lo + hi) >> 1;
      if (terms[mid].key <= key) { found = mid; lo = mid + 1; } else { hi = mid - 1; }
    }
    return found >= 0 ? terms[found] : null;
  }

  function pillar(stemIndex, branchIndex) {
    return {
      stem: STEMS[stemIndex],
      branch: BRANCHES[branchIndex],
      stemPinyin: STEM_PY[stemIndex],
      branchPinyin: BRANCH_PY[branchIndex],
      stemElement: STEM_ELEMENT[stemIndex],
      branchElement: BRANCH_ELEMENT[branchIndex]
    };
  }

  function dayIndex(y, m, d) {
    var days = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1900, 0, 1)) / 86400000);
    var epochGz = root.HANZI_BAZI.epochDayGz;
    return ((days + epochGz) % 60 + 60) % 60;
  }

  /** Compute the four pillars. `hour` may be null when the birth time is unknown. */
  function compute(input) {
    var y = input.year, m = input.month, d = input.day;
    var h = (input.hour === null || input.hour === undefined) ? null : input.hour;
    var mi = input.minute || 0;
    if (y < 1900 || y > 2100) throw new Error('outside 1900-2100');

    var effective = new Date(Date.UTC(y, m - 1, d));
    if (h !== null && h >= 23) effective = new Date(effective.getTime() + 86400000);
    var ey = effective.getUTCFullYear(), em = effective.getUTCMonth() + 1, ed = effective.getUTCDate();

    // Year pillar: changes at 立春 of the entered year.
    var lichun = root.HANZI_BAZI.jie[String(y)][1];
    var lichunKey = keyOf(y, parseInt(lichun.slice(0, 2), 10), parseInt(lichun.slice(2, 4), 10),
                          parseInt(lichun.slice(4, 6), 10), parseInt(lichun.slice(6, 8), 10));
    var instantKey = keyOf(y, m, d, h === null ? 12 : h, mi);
    var pillarYear = instantKey < lichunKey ? y - 1 : y;
    var yearGz = ((pillarYear - 1984) % 60 + 60) % 60;
    var yearStem = yearGz % 10;
    var yearBranch = yearGz % 12;

    // Month pillar: the active 节 decides the branch; 五虎遁 decides the stem.
    var monthTerm = termBefore(h === null ? keyOf(y, m, d, 12, 0) : instantKey);
    var monthBranch = monthTerm ? monthTerm.branch : 0;
    var yinStem = (yearStem * 2 + 2) % 10;
    var monthStem = (yinStem + ((monthBranch - 2 + 12) % 12)) % 10;

    // Day pillar: 23:00 or later counts as the next day (晚子时).
    var dIndex = dayIndex(ey, em, ed);
    var dayStem = dIndex % 10;
    var dayBranch = dIndex % 12;

    var result = {
      year: pillar(yearStem, yearBranch),
      month: pillar(monthStem, monthBranch),
      day: pillar(dayStem, dayBranch),
      hour: null,
      zodiac: ZODIAC[yearBranch],
      pillarYear: pillarYear,
      monthTerm: monthTerm ? {
        name: monthTerm.name,
        date: monthTerm.year + '-' + String(monthTerm.month).padStart(2, '0') + '-' +
              String(monthTerm.day).padStart(2, '0'),
        time: String(monthTerm.hour).padStart(2, '0') + ':' + String(monthTerm.minute).padStart(2, '0'),
        monthName: MONTH_NAME[monthTerm.branch]
      } : null,
      // 23:00 or later rolls into the next day.
      dayShifted: h !== null && h >= 23,
      elements: null
    };

    if (h !== null) {
      var hourBranch = Math.floor(((h + 1) % 24) / 2);
      var hourStem = ((dayStem % 5) * 2 + hourBranch) % 10;
      result.hour = pillar(hourStem, hourBranch);
    }

    var counts = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    ['year', 'month', 'day', 'hour'].forEach(function (name) {
      var p = result[name];
      if (!p) return;
      counts[p.stemElement]++;
      counts[p.branchElement]++;
    });
    result.elements = counts;
    return result;
  }

  /* ---------- rendering ---------- */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function render(result, host) {
    host.textContent = '';
    host.classList.remove('is-hidden');

    var grid = el('div', 'bazi-grid');
    [
      ['Year', result.year, String(result.pillarYear)],
      ['Month', result.month, result.monthTerm ? 'since ' + result.monthTerm.name : ''],
      ['Day', result.day, result.dayShifted ? 'from 23:00' : ''],
      ['Hour', result.hour, result.hour ? '' : 'needs a birth time']
    ].forEach(function (row) {
      var label = row[0], p = row[1], note = row[2];
      var card = el('article', 'bazi-pillar');
      card.appendChild(el('p', 'bazi-pillar-label', label));
      if (p) {
        var chars = el('p', 'bazi-chars');
        chars.appendChild(el('span', 'bazi-char', p.stem));
        chars.appendChild(el('span', 'bazi-char', p.branch));
        card.appendChild(chars);
        card.appendChild(el('p', 'bazi-pinyin', p.stemPinyin + ' ' + p.branchPinyin));
        var tags = el('p', 'bazi-tags');
        tags.appendChild(el('span', 'bazi-tag', ELEMENT_CN[p.stemElement]));
        tags.appendChild(el('span', 'bazi-tag', ELEMENT_CN[p.branchElement]));
        card.appendChild(tags);
      } else {
        card.appendChild(el('p', 'bazi-empty', '—'));
      }
      if (note) card.appendChild(el('p', 'bazi-note', note));
      grid.appendChild(card);
    });
    host.appendChild(grid);

    var tally = el('div', 'bazi-tally');
    tally.appendChild(el('h3', null, 'Visible elements'));
    var bar = el('ul', 'bazi-tally-list');
    ELEMENTS.forEach(function (name) {
      var li = el('li');
      li.appendChild(el('span', 'bazi-tally-name', ELEMENT_CN[name]));
      li.appendChild(el('span', 'bazi-tally-count', String(result.elements[name])));
      bar.appendChild(li);
    });
    tally.appendChild(bar);
    tally.appendChild(el('p', 'bazi-note', 'Counted from the four stems and four branches only. Hidden stems (藏干) and seasonal strength are not modelled here.'));
    host.appendChild(tally);

    if (result.monthTerm) {
      host.appendChild(el('p', 'bazi-note',
        'The month pillar changed at ' + result.monthTerm.name + ', ' +
        result.monthTerm.date + ' ' + result.monthTerm.time + ' (China Standard Time).'));
    }
    var zodiacNote = el('p', 'bazi-note', 'Year branch: ' + result.zodiac + '. ');
    var link = el('a', null, 'Chinese zodiac guide ↗');
    link.href = '/chinese-zodiac/';
    zodiacNote.appendChild(link);
    host.appendChild(zodiacNote);
  }

  function mount() {
    var form = document.getElementById('bazi-form');
    if (!form) return;
    var host = document.getElementById('bazi-result');
    var status = document.getElementById('bazi-status');

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var dateValue = document.getElementById('bazi-date').value;
      var timeValue = document.getElementById('bazi-time').value;
      if (!dateValue) {
        status.textContent = 'Enter a birth date first.';
        return;
      }
      var parts = dateValue.split('-').map(Number);
      var timeParts = timeValue ? timeValue.split(':').map(Number) : null;
      var result;
      try {
        result = compute({
          year: parts[0], month: parts[1], day: parts[2],
          hour: timeParts ? timeParts[0] : null,
          minute: timeParts ? timeParts[1] : 0
        });
      } catch (error) {
        status.textContent = 'This date is outside the 1900–2100 range.';
        return;
      }
      status.textContent = timeParts ? '' : 'No birth time given, so the hour pillar is left blank.';
      render(result, host);
    });
  }

  root.HanziBazi = { compute: compute, render: render };
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mount);
    } else {
      mount();
    }
  }
})(typeof window === 'undefined' ? globalThis : window);
