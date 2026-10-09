/* Minimal contract check for the one-shot naming endpoint. */
const assert = require('assert');
const api = require('../api/generate-name.js');

const courtesy = { task: 'courtesy-name', chineseName: '明澈', relation: 'auto' };
assert.strictEqual(api.validateRequest(courtesy), null);
assert.strictEqual(api.validResponse('courtesy-name', api.fallback(courtesy)), true);
assert.strictEqual(api.validResponse('courtesy-name', { givenName: '明澈', courtesyName: { characters: '子正', pinyin: 'Zǐ Zhèng', reason: 'ok', usage: 'friends' }, note: '号 Art Name' }), false);

const japanese = {
  task: 'japanese-to-chinese', input: '山田太郎', route: 'adaptive',
  preserve: { meaning: true, familyName: true, sound: false, japaneseIdentity: true, chineseNaturalness: true }
};
assert.strictEqual(api.validateRequest(japanese), null);
assert.strictEqual(api.validResponse('japanese-to-chinese', api.fallback(japanese)), true);
assert.notStrictEqual(api.validateRequest({ task: 'unknown', input: 'x' }), null);
assert.notStrictEqual(api.validateRequest({ task: 'courtesy-name' }), null);
assert.strictEqual(api.validResponse('courtesy-name', { givenName: '明澈', courtesyName: { characters: '子正', pinyin: 'Zǐ Zhèng', reason: 'ok' }, note: 'Art name / 号' }), false);

for (const [characters, pinyin] of [['含章', 'Hán Zhāng'], ['澄之', 'Chéng Zhī'], ['子昭', 'Zǐ Zhāo']]) {
  const value = { givenName: '明澈', courtesyName: { characters, pinyin, reason: 'A creative semantic relationship.' } };
  assert.strictEqual(Boolean(api.validResponse('courtesy-name', value)), true);
  assert.strictEqual(api.validResponse('courtesy-name', value, [characters]), false);
}
console.log('PASS one-shot API contract, flexible courtesy forms and repeat rejection');
