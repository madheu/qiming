(function () {
  'use strict';
  const form = document.querySelector('#japanese-form');
  const input = document.querySelector('#japanese-input');
  const result = document.querySelector('#japanese-result');
  if (!form || !input || !result) return;

  function escape(value) { return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }
  function options() {
    const checked = name => form.querySelector(`[name="${name}"]`);
    return {
      task: 'japanese-to-chinese', input: input.value.trim(), route: form.querySelector('[name="route"]:checked').value,
      preserve: { meaning: checked('meaning').checked, familyName: checked('familyName').checked, sound: checked('sound').checked, japaneseIdentity: checked('japaneseIdentity').checked, chineseNaturalness: checked('chineseNaturalness').checked }
    };
  }
  function fallback(request) {
    const conservative = request.route === 'conservative';
    return { input: request.input, route: request.route, chineseName: conservative ? '林知远' : '林知远', pinyin: 'Lín Zhīyuǎn', katakana: 'リン・チーユエン', preserved: conservative ? ['A Chinese fallback name was used because this input is not in the local Japanese-name dictionary.'] : ['A reflective, far-reaching meaning was preserved.'], adapted: conservative ? ['The original Japanese family name could not be verified locally, so it was not copied as fact.'] : ['A common Chinese surname and a natural two-character given name were selected.', 'The original Japanese family-name meaning was not claimed without a verified dictionary match.'], notes: ['This is a local fallback; Japanese-specific interpretation was unavailable.', 'Katakana is an approximate reading aid and does not show tones.'], fallback: true };
  }
  function render(value, wasFallback) {
    result.classList.remove('is-hidden');
    result.innerHTML = `<p class="culture-kicker">${wasFallback ? 'Curated fallback · still yours to consider' : 'A one-shot cultural adaptation'}</p><h2><span lang="zh">${escape(value.chineseName)}</span> <em>${escape(value.pinyin)}</em></h2><p class="pinyin" lang="ja">${escape(value.katakana)}</p><div class="culture-grid"><article class="culture-card"><h3>Preserved</h3><ul>${value.preserved.map(x => `<li>${escape(x)}</li>`).join('')}</ul></article><article class="culture-card"><h3>Adapted</h3><ul>${value.adapted.map(x => `<li>${escape(x)}</li>`).join('')}</ul></article></div><p class="culture-note">${value.notes.map(x => escape(x)).join(' ')}</p><div class="culture-actions"><a href="/courtesy-name-generator/" data-culture-link>Now give it a courtesy name / 字 ↗</a></div>`;
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const request = options(); const button = form.querySelector('button[type="submit"]'); if (button) button.disabled = true;
    const answer = window.HanziNameAgent ? await window.HanziNameAgent.generate(request, fallback) : { value: fallback(request), fallback: true };
    render(answer.value, answer.fallback); if (window.HANZI) window.HANZI.track('japanese_generate', { route: request.route, sound: request.preserve.sound, fallback: answer.fallback }); if (button) button.disabled = false;
  });
})();
