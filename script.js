document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#generator-form');
  const chips = [...document.querySelectorAll('.chip')];
  const results = document.querySelector('#results');
  const grid = document.querySelector('#name-grid');
  const reset = document.querySelector('#reset-button');
  const more = document.querySelector('#more-button');
  let generation = 0;

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
    { han: '知远', py: 'Zhīyuǎn', chars: '知 = wisdom · 远 = far-reaching', styles: ['Modern', 'Calm', 'Thoughtful'], reason: 'A clear, grounded name for someone who thinks deeply and sees beyond the obvious.', tones: ['calm', 'modern'] },
    { han: '予安', py: 'Yǔ’ān', chars: '予 = to give · 安 = peace', styles: ['Elegant', 'Calm', 'Warm'], reason: 'Soft but self-assured — a name that carries generosity, ease, and a quietly warm presence.', tones: ['calm', 'elegant'] },
    { han: '明澈', py: 'Míngchè', chars: '明 = bright · 澈 = clear', styles: ['Modern', 'Poetic', 'Bright'], reason: 'For a person with a bright mind and a calm depth — clear-hearted, never loud.', tones: ['modern', 'poetic'] },
    { han: '星河', py: 'Xīnghé', chars: '星 = star · 河 = river', styles: ['Poetic', 'Strong', 'Unique'], reason: 'A more expressive choice: quietly memorable, with a sense of movement and wonder.', tones: ['poetic', 'strong'] },
    { han: '安然', py: 'Ānrán', chars: '安 = peace · 然 = natural', styles: ['Calm', 'Elegant', 'Natural'], reason: 'A natural, welcoming name with an inner steadiness that feels easy to live with.', tones: ['calm', 'elegant'] },
    { han: '嘉言', py: 'Jiāyán', chars: '嘉 = excellent · 言 = word', styles: ['Strong', 'Modern', 'Warm'], reason: 'A thoughtful, articulate name — someone whose words carry kindness and weight.', tones: ['strong', 'modern'] },
    { han: '若宁', py: 'Ruòníng', chars: '若 = like · 宁 = peace', styles: ['Elegant', 'Calm', 'Poetic'], reason: 'A graceful, composed name with a soft rhythm and a sense of inner peace.', tones: ['calm', 'elegant'] },
    { han: '景行', py: 'Jǐngxíng', chars: '景 = light / admiration · 行 = conduct', styles: ['Strong', 'Traditional', 'Thoughtful'], reason: 'A confident name with a strong moral center and a refined, literary feeling.', tones: ['strong', 'traditional'] },
    { han: '乐言', py: 'Lèyán', chars: '乐 = joy · 言 = word', styles: ['Playful', 'Modern', 'Warm'], reason: 'Bright and approachable, with the feeling of someone who brings energy into a room.', tones: ['playful', 'modern'] },
    { han: '清越', py: 'Qīngyuè', chars: '清 = clear · 越 = surpass', styles: ['Elegant', 'Poetic', 'Unique'], reason: 'A distinctive but usable name: clear-minded, bright, and quietly ambitious.', tones: ['poetic', 'elegant'] }
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
  function choose(list, seed) { return list[seed % list.length]; }
  function getStyles() { return chips.filter(chip => chip.classList.contains('selected')).map(chip => chip.dataset.style); }
  function makeName(input, styles, gender, pronunciation, index) {
    const normalized = input.toLowerCase().replace(/[^a-z]/g, '') || 'you';
    const seed = hash(`${normalized}|${styles.join(',')}|${gender}|${pronunciation}|${generation}|${index}`);
    const preference = styles.length ? styles : ['Modern'];
    let candidates = givenNames.filter(item => item.tones.some(tone => preference.some(style => tone.toLowerCase() === style.toLowerCase())));
    if (candidates.length < 3) candidates = givenNames;
    let given = choose(candidates, seed);
    const used = new Set();
    while (used.has(given.han)) given = choose(candidates, seed + used.size + 1);
    used.add(given.han);
    const surname = choose(surnames, seed >> 3);
    const hint = soundHints[normalized];
    const soundNote = pronunciation === 'preferred' && hint ? ` Its opening sound echoes “${hint[1]},” while keeping the full name natural in Chinese.` : '';
    return {
      characters: `${surname.han}${given.han}`,
      pinyin: `${surname.py} ${given.py}`,
      meaning: `${surname.han} = ${surname.meaning} · ${given.chars}`,
      styles: [...new Set([...given.styles.slice(0, 2), ...preference.slice(0, 1)])],
      reason: `${given.reason}${soundNote}`
    };
  }
  function generateNames() {
    const input = document.querySelector('#name').value.trim();
    const styles = getStyles();
    const gender = document.querySelector('#gender').value;
    const pronunciation = document.querySelector('#pronunciation').value;
    const names = [0, 1, 2].map(index => makeName(input, styles, gender, pronunciation, index));
    const displayName = escapeText(input || 'you').toUpperCase();
    grid.innerHTML = names.map((item, index) => `<article class="name-card"><div class="card-index">0${index + 1} / FOR ${displayName}</div><div class="characters">${item.characters}</div><div class="pinyin">${item.pinyin}</div><p class="meaning">${item.meaning.replace(/·/g, '<br />')}</p><div class="tag-row">${item.styles.map(style => `<span class="tag">${style}</span>`).join('')}</div><div class="why"><strong>Why this name?</strong>${item.reason}</div></article>`).join('');
  }
  function showResults() {
    generateNames();
    results.classList.remove('is-hidden');
    requestAnimationFrame(() => results.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

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

  chips.forEach(chip => chip.addEventListener('click', event => {
    event.preventDefault();
    const selected = chip.classList.toggle('selected');
    chip.setAttribute('aria-pressed', String(selected));
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
    window.setTimeout(() => {
      button.disabled = false;
      label.textContent = originalLabel;
    }, 500);
  });
  more.addEventListener('click', () => {
    generation += 1;
    const generator = document.querySelector('#generator');
    generator.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => document.querySelector('#name').focus(), 450);
  });
  reset.addEventListener('click', () => {
    results.classList.add('is-hidden'); form.reset();
    chips.forEach(chip => { chip.classList.remove('selected'); chip.setAttribute('aria-pressed', 'false'); });
    document.querySelector('#generator').scrollIntoView({ behavior: 'smooth' });
  });
});