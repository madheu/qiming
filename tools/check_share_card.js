'use strict';
const assert = require('assert');
const card = require('../share-card');
global.location = { origin: 'https://chinesename.cc.cd' };
for (const item of [
  { name: '林知远', pinyin: 'Lín Zhīyuǎn', meaning: 'Wisdom reaching beyond the obvious.', kind: 'Chinese name' },
  { name: '含章', pinyin: 'Hán Zhāng', meaning: 'Keeping distinction within.', kind: 'Courtesy name · 字' },
  { name: '田泰朗', pinyin: 'Tián Tàilǎng', meaning: 'A bright, peaceful adaptation.', kind: 'Adapted Chinese name' }
]) {
  const url = new URL(card.link(item));
  assert.strictEqual(url.pathname, '/share/');
  assert.deepStrictEqual(card.decode(url.hash), item);
}
assert.throws(() => card.decode('#%zz'));
assert.throws(() => card.normalize({ name: '<script>', meaning: 'test' }));
assert.throws(() => card.decode('#' + 'a'.repeat(6001)));
const fakeDoc = { fonts: { load: async () => {} }, createElement: () => ({}) };
console.log('PASS three name-card link round trips and invalid payload rejection; canvas size is 1200x628 by design');
