(function () {
  'use strict';
  const form = document.querySelector('#courtesy-form');
  const input = document.querySelector('#chinese-name');
  const relation = document.querySelector('#relation');
  const result = document.querySelector('#courtesy-result');
  if (!form || !input || !result) return;

  const fallbackMap = {
    '明': { characters: '含章', pinyin: 'Hán Zhāng', relation: 'opposite', relationLabel: 'Complementary contrast', reason: '明 expresses visible brightness; 含章 suggests keeping beauty and distinction within. This creative contrast balances outward light with inward substance.' },
    '澈': { characters: '澄之', pinyin: 'Chéng Zhī', relation: 'extension', relationLabel: 'Semantic extension', reason: '澈 reaches all the way through clear water; 澄 is the settled clarity that lets it stay clear.' },
    '知': { characters: '致远', pinyin: 'Zhì Yuǎn', relation: 'extension', relationLabel: 'Semantic extension', reason: '知 begins with understanding; 远 gives that understanding a horizon.' },
    '安': { characters: '处宁', pinyin: 'Chǔ Níng', relation: 'extension', relationLabel: 'Semantic extension', reason: '安 is peace; 恬 is the quiet ease that peace becomes when it is lived.' },
    '远': { characters: '行之', pinyin: 'Xíng Zhī', relation: 'extension', relationLabel: 'Semantic extension', reason: '远 names a distant horizon; 行之 turns that distance into purposeful action. This creative extension connects aspiration with the act of going.' },
    '静': { characters: '守素', pinyin: 'Shǒu Sù', relation: 'extension', relationLabel: 'Semantic extension', reason: '静 evokes stillness; 守素 suggests preserving simplicity. The whole pair extends calm into a deliberate way of living.' }
  };

  function escape(value) { return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }
  function fallback(request) {
    const raw = request.chineseName || '明';
    const chars = [...raw];
    const picked = chars.map(ch => fallbackMap[ch]).find(Boolean) || { characters: '子正', pinyin: 'Zǐ Zhèng', relation: 'extension', relationLabel: 'A steady extension', reason: '正 suggests an upright, dependable quality that complements the given name without pretending to be a translation.' };
    return { givenName: raw, courtesyName: Object.assign({}, picked, { usage: 'A traditional peer and friendship form, not a legal name.', fallback: true }) };
  }
  function render(value, wasFallback) {
    const item = value.courtesyName;
    result.classList.remove('is-hidden');
    result.innerHTML = `<p class="culture-kicker">${wasFallback ? 'Curated fallback · still yours to consider' : 'A one-shot cultural suggestion'}</p><h2><span lang="zh">${escape(item.characters)}</span> <em>${escape(item.pinyin)}</em></h2><p class="pinyin">${escape(item.relationLabel || item.relation || 'Courtesy-name relationship')}</p><p>${escape(item.reason)}</p><p class="culture-note"><strong>How it is used:</strong> ${escape(item.usage || 'Traditionally used among peers and friends, not as a legal name.')}</p><div class="culture-actions"><button type="button" class="secondary-button" id="copy-courtesy">Copy this courtesy name</button><button type="button" class="secondary-button" id="share-courtesy">Share card ↗</button><a href="/what-is-a-chinese-courtesy-name/" data-culture-link>Learn what 字 means ↗</a></div>`;
    const share = result.querySelector('#share-courtesy');
    if (share) share.addEventListener('click', () => window.HanziShareCard && window.HanziShareCard.open({ name: item.characters, pinyin: item.pinyin, meaning: item.reason, kind: 'Courtesy name · 字' }));
    const copy = result.querySelector('#copy-courtesy');
    if (copy) copy.addEventListener('click', async () => { const text = `${item.characters} (${item.pinyin})\n${item.reason}\nhttps://chinesename.cc.cd/courtesy-name-generator/`; try { await navigator.clipboard.writeText(text); copy.textContent = 'Copied ✓'; } catch (_) { copy.textContent = 'Select and copy'; } });
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const request = { task: 'courtesy-name', chineseName: input.value.trim(), relation: relation.value };
    const button = form.querySelector('button[type="submit"]');
    if (button) button.disabled = true;
    const answer = window.HanziNameAgent ? await window.HanziNameAgent.generate(request, fallback) : { value: fallback(request), fallback: true };
    render(answer.value, answer.fallback);
    if (window.HANZI) window.HANZI.track('courtesy_generate', { relation: relation.value, fallback: answer.fallback });
    if (button) button.disabled = false;
  });
})();
