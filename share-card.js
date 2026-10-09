(function (root) {
  'use strict';
  function clean(value, max) { return typeof value === 'string' ? value.trim().slice(0, max) : ''; }
  function normalize(value) {
    if (!value || typeof value !== 'object') throw new Error('Invalid card');
    const item = { name: clean(value.name, 8), pinyin: clean(value.pinyin, 100), meaning: clean(value.meaning, 700), kind: clean(value.kind, 60) || 'Chinese name' };
    if (!/^[\u3400-\u9fff]{2,8}$/.test(item.name) || !item.meaning) throw new Error('Invalid name card');
    return item;
  }
  function link(value) { return `${root.location.origin}/share/#${encodeURIComponent(JSON.stringify(normalize(value)))}`; }
  function decode(fragment) {
    if (fragment.length > 6000) throw new Error('Card too large');
    return normalize(JSON.parse(decodeURIComponent(fragment.replace(/^#/, ''))));
  }
  async function draw(value) {
    const item = normalize(value);
    try { await document.fonts.load('180px HanziBrush', item.name); } catch (_) {}
    // X preview cards favor a 1.91:1 landscape canvas (1200 x 628).
    const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 628;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f4f0e7'; ctx.fillRect(0, 0, 1200, 628);
    // Ink-and-vermilion frame: a restrained hand-drawn border that survives cropping.
    ctx.strokeStyle = '#315347'; ctx.lineWidth = 5; ctx.strokeRect(25, 25, 1150, 578);
    ctx.strokeStyle = '#d56c4e'; ctx.lineWidth = 2; ctx.strokeRect(39, 39, 1122, 550);
    ctx.strokeStyle = '#315347'; ctx.lineWidth = 2;
    [[39,39,82,39],[39,39,39,82],[1161,39,1118,39],[1161,39,1161,82],[39,589,82,589],[39,589,39,546],[1161,589,1118,589],[1161,589,1161,546]].forEach(line => { ctx.beginPath(); ctx.moveTo(line[0], line[1]); ctx.lineTo(line[2], line[3]); ctx.stroke(); });
    ctx.textAlign = 'center'; ctx.fillStyle = '#66736d'; ctx.font = '18px Georgia';
    ctx.fillText(`H À N Z I  /  ${item.kind.toUpperCase()}`, 600, 103);
    ctx.fillStyle = '#1e2b26';
    let size = 190; do { ctx.font = `${size}px HanziBrush, KaiTi, STKaiti, serif`; size -= 5; } while (ctx.measureText(item.name).width > 850 && size > 70);
    ctx.fillText(item.name, 600, 335);
    ctx.fillStyle = '#315347'; ctx.font = '30px Georgia'; ctx.fillText(item.pinyin, 600, 395, 900);
    ctx.fillStyle = '#66736d'; ctx.font = '22px Georgia';
    const lines = []; let line = '';
    for (const word of item.meaning.split(/\s+/)) {
      if (ctx.measureText(line + ' ' + word).width > 850 && line) { lines.push(line); line = word; } else line += (line ? ' ' : '') + word;
    }
    if (line) lines.push(line);
    lines.slice(0, 3).forEach((text, index) => ctx.fillText(index === 2 && lines.length > 3 ? text + '…' : text, 600, 455 + index * 30, 880));
    ctx.fillStyle = '#d56c4e'; ctx.font = '22px Georgia'; ctx.fillText('✦', 600, 555);
    ctx.fillStyle = '#66736d'; ctx.font = '16px Georgia'; ctx.fillText('chinesename.cc.cd · a name, another world', 600, 579);
    return canvas;
  }
  async function open(value) {
    const item = normalize(value); const canvas = await draw(item);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('Could not create image');
    const url = URL.createObjectURL(blob);
    const dialog = document.createElement('dialog'); dialog.className = 'share-dialog';
    const image = document.createElement('img'); image.src = url; image.alt = `${item.name}: ${item.meaning}`;
    const actions = document.createElement('div'); actions.className = 'share-actions';
    const status = document.createElement('p'); status.setAttribute('role', 'status');
    const download = document.createElement('a'); download.href = url; download.download = `Hanzi-${item.name}.png`; download.textContent = 'Download PNG';
    const copy = document.createElement('button'); copy.textContent = 'Copy link'; copy.onclick = async () => { try { await navigator.clipboard.writeText(link(item)); status.textContent = 'Link copied.'; } catch (_) { status.textContent = link(item); } };
    const share = document.createElement('button'); share.textContent = 'Share'; share.onclick = async () => {
      try {
        const file = new File([blob], `Hanzi-${item.name}.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: item.name, text: item.meaning });
        else if (navigator.share) await navigator.share({ title: item.name, text: item.meaning, url: link(item) });
        else { await navigator.clipboard.writeText(link(item)); status.textContent = 'Link copied. You can also download the image.'; }
      } catch (error) { if (error.name !== 'AbortError') status.textContent = 'Sharing unavailable; download the image or copy the link.'; }
    };
    const close = document.createElement('button'); close.textContent = 'Close'; close.onclick = () => dialog.close();
    actions.append(download, copy, share, close); dialog.append(image, actions, status); document.body.append(dialog);
    dialog.addEventListener('close', () => { URL.revokeObjectURL(url); dialog.remove(); }, { once: true }); dialog.showModal();
  }
  const api = { normalize, link, decode, draw, open };
  root.HanziShareCard = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window === 'undefined' ? globalThis : window);
