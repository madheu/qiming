document.addEventListener('DOMContentLoaded', () => {
  const analytics = window.HANZI || { track() {}, config: { siteUrl: location.origin } };
  const track = (event, data) => analytics.track(event, data);
  const siteUrl = (analytics.config.siteUrl || location.origin).replace(/\/$/, '');

  const form = document.querySelector('#generator-form');
  const chips = [...document.querySelectorAll('.chip')];
  const nameInput = document.querySelector('#name');
  const results = document.querySelector('#results');
  const grid = document.querySelector('#name-grid');
  const reset = document.querySelector('#reset-button');
  const more = document.querySelector('#more-button');
  const agentButton = document.querySelector('#agent-button');
  const agentStatus = document.querySelector('#agent-status');
  let generation = 0;
  let currentNames = [];
  let startedTyping = false;
  let agentResult = null;

  // Lightweight local generator. It follows the same practical approach as
  // open-source Chinese name generators: curated common characters + seeded
  // selection, so the same inputs are reproducible while different inputs
  // produce different names. No API key or external service is required.
  const surnames = [
    { han: '林', py: 'Lín', meaning: 'forest' }, { han: '周', py: 'Zhōu', meaning: 'complete' },
    { han: '沈', py: 'Shěn', meaning: 'deep' }, { han: '许', py: 'Xǔ', meaning: 'to promise' },
    { han: '陆', py: 'Lù', meaning: 'land' }, { han: '顾', py: 'Gù', meaning: 'to care for' },
    { han: '陈', py: 'Chén', meaning: 'to display' }, { han: '苏', py: 'Sū', meaning: 'to revive' }
  ];
  const givenNames = [
    { han: '知远', py: 'Zhīyuǎn', tagline: 'Wisdom that reaches far', chars: '知 = wisdom · 远 = far-reaching', styles: ['Modern', 'Calm', 'Thoughtful'], reason: 'A clear, grounded name for someone who thinks deeply and sees beyond the obvious.', tones: ['calm', 'modern'] },
    { han: '予安', py: 'Yǔ’ān', tagline: 'Peace, freely given', chars: '予 = to give · 安 = peace', styles: ['Elegant', 'Calm', 'Warm'], reason: 'Soft but self-assured — a name that carries generosity, ease, and a quietly warm presence.', tones: ['calm', 'elegant'] },
    { han: '明澈', py: 'Míngchè', tagline: 'Bright and clear-hearted', chars: '明 = bright · 澈 = clear', styles: ['Modern', 'Poetic', 'Bright'], reason: 'For a person with a bright mind and a calm depth — clear-hearted, never loud.', tones: ['modern', 'poetic'] },
    { han: '星河', py: 'Xīnghé', tagline: 'A river of stars', chars: '星 = star · 河 = river', styles: ['Poetic', 'Strong', 'Unique'], reason: 'A more expressive choice: quietly memorable, with a sense of movement and wonder.', tones: ['poetic', 'strong'] },
    { han: '安然', py: 'Ānrán', tagline: 'At ease, as things are', chars: '安 = peace · 然 = natural', styles: ['Calm', 'Elegant', 'Natural'], reason: 'A natural, welcoming name with an inner steadiness that feels easy to live with.', tones: ['calm', 'elegant'] },
    { han: '嘉言', py: 'Jiāyán', tagline: 'Words worth keeping', chars: '嘉 = excellent · 言 = word', styles: ['Strong', 'Modern', 'Warm'], reason: 'A thoughtful, articulate name — someone whose words carry kindness and weight.', tones: ['strong', 'modern'] },
    { han: '若宁', py: 'Ruòníng', tagline: 'Quiet as still water', chars: '若 = like · 宁 = peace', styles: ['Elegant', 'Calm', 'Poetic'], reason: 'A graceful, composed name with a soft rhythm and a sense of inner peace.', tones: ['calm', 'elegant'] },
    { han: '景行', py: 'Jǐngxíng', tagline: 'A life lived upright', chars: '景 = light / admiration · 行 = conduct', styles: ['Strong', 'Traditional', 'Thoughtful'], reason: 'A confident name with a strong moral center and a refined, literary feeling.', tones: ['strong', 'traditional'] },
    { han: '乐言', py: 'Lèyán', tagline: 'Joy that speaks', chars: '乐 = joy · 言 = word', styles: ['Playful', 'Modern', 'Warm'], reason: 'Bright and approachable, with the feeling of someone who brings energy into a room.', tones: ['playful', 'modern'] },
    { han: '清越', py: 'Qīngyuè', tagline: 'Clear-toned, rising above', chars: '清 = clear · 越 = surpass', styles: ['Elegant', 'Poetic', 'Unique'], reason: 'A distinctive but usable name: clear-minded, bright, and quietly ambitious.', tones: ['poetic', 'elegant'] }
  ];
  const soundHints = {
    michael: ['明', 'Míng'], alex: ['艾', 'Ài'], alexander: ['艾', 'Ài'], emma: ['艾', 'Ài'],
    olivia: ['奥', 'Ào'], sophia: ['苏', 'Sū'], william: ['威', 'Wēi'], james: ['詹', 'Zhān'],
    john: ['约', 'Yuē'], david: ['戴', 'Dài'], daniel: ['丹', 'Dān'], lucas: ['卢', 'Lú'],
    leo: ['李', 'Lǐ'], lily: ['莉', 'Lì'], anna: ['安', 'Ān'], chris: ['克', 'Kè'],
    charlotte: ['夏', 'Xià'], benjamin: ['本', 'Běn'],
  };

  function hash(value) {
    return [...value.toLowerCase()].reduce((total, char, index) => (total * 31 + char.charCodeAt(0) + index) >>> 0, 7);
  }
  function escapeText(value) { return value.replace(/[<>&"']/g, ''); }
  // Modulo that stays in range for negative seeds too — `seed >> 3` goes
  // negative past 2^31, and list[-1] would silently return undefined.
  function choose(list, seed) { return list[((seed % list.length) + list.length) % list.length]; }
  function getStyles() { return chips.filter(chip => chip.classList.contains('selected')).map(chip => chip.dataset.style); }

  function makeName(input, styles, gender, pronunciation, index, taken) {
    const normalized = input.toLowerCase().replace(/[^a-z]/g, '') || 'you';
    const seed = hash(`${normalized}|${styles.join(',')}|${gender}|${pronunciation}|${generation}|${index}`);
    const preference = styles.length ? styles : ['Modern'];
    let candidates = givenNames.filter(item => item.tones.some(tone => preference.some(style => tone.toLowerCase() === style.toLowerCase())));
    if (candidates.length < 3) candidates = givenNames;
    // Keep the three-card batch varied: never present three names with the same
    // given-name shape or the same surname when other curated choices exist.
    const usedSurnames = new Set([...taken].map(value => value.slice(0, 1)));
    const varied = candidates.filter(item => !taken.has(item.han));
    if (varied.length) candidates = varied;

    // Walk forward until we land on a given name not already used in this
    // batch, so the three suggestions are always distinct.
    let given = choose(candidates, seed);
    for (let step = 0; taken.has(given.han) && step < candidates.length; step += 1) {
      given = candidates[(seed + step + 1) % candidates.length];
    }
    taken.add(given.han);

    const surname = choose(surnames, seed >>> 3);
    const hint = soundHints[normalized];
    const soundNote = pronunciation === 'preferred' && hint ? ` Its opening sound echoes “${hint[1]},” while keeping the full name natural in Chinese.` : '';
    return {
      characters: `${surname.han}${given.han}`,
      pinyin: `${surname.py} ${given.py}`,
      tagline: given.tagline,
      meaning: `${surname.han} = ${surname.meaning} · ${given.chars}`,
      styles: [...new Set([...given.styles.slice(0, 2), ...preference.slice(0, 1)])],
      reason: `${given.reason}${soundNote}`
    };
  }

  function generateNames() {
    const input = nameInput.value.trim();
    const styles = getStyles();
    const gender = document.querySelector('#gender').value;
    const pronunciation = document.querySelector('#pronunciation').value;
    const taken = new Set();
    currentNames = [0, 1, 2].map(index => makeName(input, styles, gender, pronunciation, index, taken));
    const displayName = escapeText(input || 'you').toUpperCase();
    grid.innerHTML = currentNames.map((item, index) => `<article class="name-card"><div class="card-index">0${index + 1} / FOR ${displayName}</div><div class="characters">${item.characters}</div><div class="pinyin">${item.pinyin}</div><p class="meaning">${item.meaning.replace(/·/g, '<br />')}</p><div class="tag-row">${item.styles.map(style => `<span class="tag">${style}</span>`).join('')}</div><div class="why"><strong>Why this name?</strong>${item.reason}</div><div class="card-actions"><button type="button" class="card-action" data-action="copy" data-index="${index}">Copy</button><button type="button" class="card-action" data-action="share" data-index="${index}">Share</button></div></article>`).join('');
  }

  function showResults() {
    generateNames();
    results.classList.remove('is-hidden');
    requestAnimationFrame(() => results.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  // ---- copy / share -------------------------------------------------------
  function fullText(item) {
    return `${item.characters}\n${item.pinyin}\n\n“${item.tagline}”`;
  }
  function shareText(item) {
    return `My Chinese name is ${item.characters} (${item.pinyin}) — “${item.tagline}”.\n\nFind yours: ${siteUrl}`;
  }
  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) { /* fall through to the legacy path */ }
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '-1000px';
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(area);
    return ok;
  }
  function flash(button, label) {
    const original = button.textContent;
    button.textContent = label;
    button.classList.add('is-done');
    window.setTimeout(() => {
      button.textContent = original;
      button.classList.remove('is-done');
    }, 1600);
  }
  async function shareName(item) {
    const text = shareText(item);
    if (navigator.share) {
      try {
        await navigator.share({ title: `${item.characters} — my Chinese name`, text, url: siteUrl });
        return 'shared';
      } catch (e) {
        if (e && e.name === 'AbortError') return 'cancelled';
      }
    }
    return (await copyText(text)) ? 'copied' : 'failed';
  }

  grid.addEventListener('click', async event => {
    const button = event.target.closest('.card-action');
    if (!button) return;
    const item = currentNames[Number(button.dataset.index)];
    if (!item) return;

    if (button.dataset.action === 'copy') {
      const ok = await copyText(`${fullText(item)}\n\n${siteUrl}`);
      flash(button, ok ? 'Copied ✓' : 'Press Ctrl+C');
      track('copy_name', { chinese_name: item.characters, ok: ok, generation: generation });
      return;
    }
    const outcome = await shareName(item);
    flash(button, outcome === 'copied' ? 'Copied ✓' : outcome === 'cancelled' ? 'Share' : 'Shared ✓');
    track('share_name', { chinese_name: item.characters, outcome: outcome, generation: generation });
  });

  // ---- hero character animation ------------------------------------------
  const flipCharacter = document.querySelector('#flip-character');
  const characterSequence = ['名', '安', '知', '明', '远', '清', '乐', '然', '宁', '星', '河', '嘉', '言', '澄', '悦', '景', '行', '晨', '溪', '予'];
  let characterIndex = 0;
  window.setInterval(() => {
    if (!flipCharacter || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    flipCharacter.classList.add('is-turning');
    window.setTimeout(() => {
      characterIndex = (characterIndex + 1) % characterSequence.length;
      flipCharacter.textContent = characterSequence[characterIndex];
      flipCharacter.classList.remove('is-turning');
    }, 190);
  }, 1500);

  // ---- form ---------------------------------------------------------------
  nameInput.addEventListener('input', () => {
    if (startedTyping || !nameInput.value.trim()) return;
    startedTyping = true;
    track('form_start');
  });

  chips.forEach(chip => chip.addEventListener('click', event => {
    event.preventDefault();
    const selected = chip.classList.toggle('selected');
    chip.setAttribute('aria-pressed', String(selected));
    track('style_pick', { style: chip.dataset.style, selected: selected, total: getStyles().length });
  }));

  form.addEventListener('submit', event => {
    event.preventDefault();
    generation += 1;
    const button = form.querySelector('.primary-button');
    const label = button.querySelector('span');
    const originalLabel = label.textContent;
    button.disabled = true;
    label.textContent = 'Finding your names…';
    showResults();
    track('generate', {
      has_name: Boolean(nameInput.value.trim()),
      styles: getStyles().join(',') || 'none',
      gender: document.querySelector('#gender').value || 'unset',
      pronunciation: document.querySelector('#pronunciation').value,
      generation: generation
    });
    window.setTimeout(() => {
      button.disabled = false;
      label.textContent = originalLabel;
    }, 500);
  });

  function localAgentFallback() {
    return { results: currentNames.slice(0, 3).map(item => ({ characters: item.characters, pinyin: item.pinyin, meaning: item.meaning.split(' · ').map((part, index) => ({ character: index === 0 ? part.charAt(0) : '', gloss: part.replace(/^[^=]+=?\\s*/, '') })), styles: item.styles.map(style => style.toLowerCase()), reason: item.reason })) };
  }
  function renderAgentNames(answer) {
    if (!answer || !Array.isArray(answer.results) || answer.results.length < 3) return;
    const names = answer.results.slice(0, 3);
    const displayName = escapeText(nameInput.value.trim() || 'you').toUpperCase();
    grid.innerHTML = names.map((item, index) => `<article class="name-card"><div class="card-index">0${index + 1} / FOR ${displayName}</div><div class="characters">${escapeText(item.characters)}</div><div class="pinyin">${escapeText(item.pinyin)}</div><p class="meaning">${(item.meaning || []).map(part => `${escapeText(part.character || '')} = ${escapeText(part.gloss || '')}`).join('<br />')}</p><div class="tag-row">${(item.styles || []).map(style => `<span class="tag">${escapeText(style)}</span>`).join('')}</div><div class="why"><strong>Why this name?</strong>${escapeText(item.reason || 'A considered combination of sound, meaning, and rhythm.')}</div><div class="card-actions"><button type="button" class="card-action" data-action="copy" data-index="${index}">Copy</button><button type="button" class="card-action" data-action="share" data-index="${index}">Share</button></div></article>`).join('');
    currentNames = names.map(item => ({ characters: item.characters, pinyin: item.pinyin, tagline: item.reason || '', meaning: (item.meaning || []).map(part => `${part.character || ''} = ${part.gloss || ''}`).join(' · '), styles: item.styles || [], reason: item.reason || '' }));
    agentResult = answer;
  }
  function renderAgentResult(answer) {
    if (!answer || !Array.isArray(answer.results) || !answer.results[0]) return;
    const first = answer.results[0];
    const card = grid.querySelector('.name-card');
    if (!card) return;
    const note = document.createElement('p');
    note.className = 'agent-note';
    note.innerHTML = `<strong>Naming guide:</strong> ${escapeText(first.reason || 'A considered suggestion based on meaning and rhythm.')}${answer.fallback ? ' <span>(curated fallback)</span>' : ''}`;
    card.appendChild(note);
  }
  if (agentButton) agentButton.addEventListener('click', async () => {
    if (!window.HanziNameAgent || !currentNames.length) return;
    agentButton.disabled = true;
    if (agentStatus) agentStatus.textContent = 'Thinking once…';
    const request = { task: 'chinese-name', input: nameInput.value.trim(), styles: getStyles().map(style => style.toLowerCase()), pronunciation: document.querySelector('#pronunciation').value };
    const answer = await window.HanziNameAgent.generate(request, localAgentFallback);
    if (!answer.fallback && answer.value.results && answer.value.results.length >= 3) renderAgentNames(answer.value);
    else renderAgentResult(answer.value);
    if (agentStatus) agentStatus.textContent = answer.fallback ? 'Using the curated local guide.' : 'One-shot guide complete.';
    track('agent_name', { fallback: answer.fallback, generation: generation });
    agentButton.disabled = false;
  });

  more.addEventListener('click', () => {
    generation += 1;
    track('regenerate', { generation: generation, styles: getStyles().join(',') || 'none' });
    const generator = document.querySelector('#generator');
    generator.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => nameInput.focus(), 450);
  });

  reset.addEventListener('click', () => {
    results.classList.add('is-hidden');
    form.reset();
    chips.forEach(chip => { chip.classList.remove('selected'); chip.setAttribute('aria-pressed', 'false'); });
    track('start_over', { generations: generation });
    document.querySelector('#generator').scrollIntoView({ behavior: 'smooth' });
  });
});
