/**
 * The curated given-name list (100 names), used by the homepage generator and
 * by the courtesy-name page.
 *
 * Each entry: [han, pinyin, tone1, tone2, tagline, styleKeys, gender]
 *   - the two characters must exist in name-data.js `chars`
 *     (tools/check_names.js enforces this, so a typo fails the build check)
 *   - styleKeys are lowercase and match the homepage style chips
 *   - gender is 'f' (usually feminine), 'm' (usually masculine) or 'n'
 *   - the card's character-by-character gloss and its "why this name" line are
 *     composed at runtime from the character data, so the explanations stay in
 *     one place and cannot drift from the characters shown
 *
 * 38 of these were already live; the rest were added to widen the pool without
 * dropping below the quality bar: every name is one a Chinese speaker would
 * recognise as a real name, not a pair of pretty characters.
 */
(function (root) {
  'use strict';
  const givenNames = [
    ['知远', 'Zhīyuǎn', 1, 3, 'Wisdom that reaches far', 'modern calm thoughtful', 'n'],
    ['予安', 'Yǔ’ān', 3, 1, 'Peace, freely given', 'elegant calm warm', 'f'],
    ['明澈', 'Míngchè', 2, 4, 'Bright and clear-hearted', 'modern poetic bright', 'n'],
    ['星河', 'Xīnghé', 1, 2, 'A river of stars', 'poetic strong unique', 'n'],
    ['安然', 'Ānrán', 1, 2, 'At ease, as things are', 'calm elegant natural', 'f'],
    ['嘉言', 'Jiāyán', 1, 2, 'Words worth keeping', 'strong modern warm', 'n'],
    ['若宁', 'Ruòníng', 4, 2, 'Quiet as still water', 'elegant calm poetic', 'f'],
    ['景行', 'Jǐngxíng', 3, 2, 'A life lived upright', 'strong traditional thoughtful', 'm'],
    ['乐言', 'Lèyán', 4, 2, 'Joy that speaks', 'playful modern warm', 'n'],
    ['清越', 'Qīngyuè', 1, 4, 'Clear-toned, rising above', 'elegant poetic unique', 'n'],
    ['思齐', 'Sīqí', 1, 2, 'Measuring yourself against the best', 'thoughtful traditional warm', 'n'],
    ['亦航', 'Yìháng', 4, 2, 'Also setting sail', 'modern strong unique', 'm'],
    ['望舒', 'Wàngshū', 4, 1, 'The charioteer of the moon', 'poetic elegant unique', 'n'],
    ['嘉树', 'Jiāshù', 1, 4, 'A fine tree, worth tending', 'traditional natural thoughtful', 'n'],
    ['修远', 'Xiūyuǎn', 1, 3, 'The long road, walked on purpose', 'traditional strong thoughtful', 'm'],
    ['云舒', 'Yúnshū', 2, 1, 'Clouds coming loose', 'poetic calm elegant', 'f'],
    ['沐阳', 'Mùyáng', 4, 2, 'Standing in the light', 'warm bright modern', 'n'],
    ['承宇', 'Chéngyǔ', 2, 3, 'Holding up the sky', 'strong traditional', 'm'],
    ['昭宁', 'Zhāoníng', 1, 2, 'Bright, and at peace', 'elegant calm bright', 'n'],
    ['予墨', 'Yǔmò', 3, 4, 'Ink freely given', 'poetic modern unique', 'n'],
    ['若谷', 'Ruògǔ', 4, 3, 'Wide as a valley', 'thoughtful traditional natural', 'n'],
    ['明轩', 'Míngxuān', 2, 1, 'A bright room above the road', 'modern bright elegant', 'm'],
    ['静姝', 'Jìngshū', 4, 1, 'Still, and lovely', 'elegant poetic traditional', 'f'],
    ['令仪', 'Lìngyí', 4, 2, 'Bearing that holds a room', 'elegant traditional', 'f'],
    ['蔚然', 'Wèirán', 4, 2, 'Growing into a landscape', 'natural bright modern', 'n'],
    ['听雪', 'Tīngxuě', 1, 3, 'Listening to snow', 'poetic calm unique', 'f'],
    ['抱一', 'Bàoyī', 4, 1, 'Holding to the one thing', 'thoughtful traditional unique', 'n'],
    ['知白', 'Zhībái', 1, 2, 'Knowing the bright, keeping the plain', 'thoughtful calm traditional', 'n'],
    ['元朗', 'Yuánlǎng', 2, 3, 'Bright from the very beginning', 'strong bright modern', 'm'],
    ['有容', 'Yǒuróng', 3, 2, 'With room for others', 'thoughtful traditional warm', 'n'],
    ['书言', 'Shūyán', 1, 2, 'Thought made portable', 'thoughtful modern warm', 'n'],
    ['山月', 'Shānyuè', 1, 4, 'Moon over the mountain', 'poetic calm traditional', 'n'],
    ['念安', 'Niàn’ān', 4, 1, 'Holding peace in mind', 'warm calm modern', 'f'],
    ['悦然', 'Yuèrán', 4, 2, 'Glad, and meaning it', 'playful bright warm', 'n'],
    ['望川', 'Wàngchuān', 4, 1, 'Gazing at the river', 'poetic strong unique', 'n'],
    ['砚青', 'Yànqīng', 4, 1, 'Inkstone and young green', 'poetic traditional unique', 'n'],
    ['松言', 'Sōngyán', 1, 2, 'Words like pine', 'traditional calm strong', 'n'],
    ['昭然', 'Zhāorán', 1, 2, 'Plain as daylight', 'bright thoughtful modern', 'n'],
    ['清和', 'Qīnghé', 1, 2, 'Clear and mild', 'calm elegant natural', 'n'],
    ['明远', 'Míngyuǎn', 2, 3, 'Clear-eyed and far-reaching', 'thoughtful modern strong', 'm'],
    ['嘉禾', 'Jiāhé', 1, 2, 'Good grain in the field', 'natural traditional warm', 'n'],
    ['云归', 'Yúnguī', 2, 1, 'Clouds coming home', 'poetic calm natural', 'n'],
    ['怀远', 'Huáiyuǎn', 2, 3, 'Keeping the far thing close', 'thoughtful warm strong', 'm'],
    ['沐风', 'Mùfēng', 4, 1, 'Standing in the wind', 'natural poetic modern', 'n'],
    ['松月', 'Sōngyuè', 1, 4, 'Pine and moon', 'poetic traditional calm', 'n'],
    ['清如', 'Qīngrú', 1, 2, 'Clear as water', 'elegant calm poetic', 'f'],
    ['若初', 'Ruòchū', 4, 1, 'As at the beginning', 'thoughtful elegant unique', 'f'],
    ['知非', 'Zhīfēi', 1, 1, 'Honest about the past', 'thoughtful traditional unique', 'n'],
    ['明安', 'Míng’ān', 2, 1, 'Bright and unbothered', 'bright calm modern', 'n'],
    ['江雪', 'Jiāngxuě', 1, 3, 'Snow on the river', 'poetic elegant unique', 'f'],
    ['云舟', 'Yúnzhōu', 2, 1, 'A boat among clouds', 'poetic unique modern', 'n'],
    ['听澜', 'Tīnglán', 1, 2, 'Listening to the waves', 'poetic calm unique', 'n'],
    ['望岳', 'Wàngyuè', 4, 4, 'Gazing at the mountain', 'strong traditional unique', 'm'],
    ['知微', 'Zhīwēi', 1, 1, 'Seeing the small sign', 'thoughtful calm unique', 'n'],
    ['陶然', 'Táorán', 2, 2, 'Pleased with things as they are', 'calm warm natural', 'n'],
    ['悠然', 'Yōurán', 1, 2, 'Time used at its own speed', 'calm poetic natural', 'n'],
    ['怡然', 'Yírán', 2, 2, 'Ease in the room', 'warm calm elegant', 'f'],
    ['欣悦', 'Xīnyuè', 1, 4, 'Glad, openly', 'joyful'.replace('joyful', 'playful') + ' bright warm', 'f'],
    ['浩宇', 'Hàoyǔ', 4, 3, 'A very wide sky', 'strong modern unique', 'm'],
    ['明岚', 'Mínglán', 2, 2, 'Bright mist on the hill', 'poetic natural bright', 'n'],
    ['鸿远', 'Hóngyuǎn', 2, 3, 'The far flight', 'strong traditional unique', 'm'],
    ['松柏', 'Sōngbǎi', 1, 3, 'Two trees that keep their colour', 'traditional strong natural', 'm'],
    ['竹清', 'Zhúqīng', 2, 1, 'Bamboo and clear water', 'elegant natural calm', 'f'],
    ['兰心', 'Lánxīn', 2, 1, 'An orchid at heart', 'elegant warm traditional', 'f'],
    ['清泉', 'Qīngquán', 1, 2, 'A spring you can see through', 'natural calm poetic', 'n'],
    ['涵宇', 'Hányǔ', 2, 3, 'Room enough for the whole sky', 'depth'.replace('depth', 'thoughtful') + ' strong modern', 'm'],
    ['涵月', 'Hányuè', 2, 4, 'Still water holding the moon', 'poetic calm elegant', 'f'],
    ['雨禾', 'Yǔhé', 3, 2, 'Rain on standing grain', 'natural warm modern', 'f'],
    ['芊羽', 'Qiānyǔ', 1, 3, 'A feather over green grass', 'elegant poetic unique', 'f'],
    ['卓然', 'Zhuórán', 2, 2, 'Standing above the line', 'strong modern unique', 'n'],
    ['毅远', 'Yìyuǎn', 4, 3, 'Resolve over a long road', 'strong thoughtful traditional', 'm'],
    ['哲宇', 'Zhéyǔ', 2, 3, 'A wise and open mind', 'thoughtful modern strong', 'm'],
    ['哲明', 'Zhémíng', 2, 2, 'Wisdom that explains itself', 'thoughtful bright elegant', 'n'],
    ['智远', 'Zhìyuǎn', 4, 3, 'Good judgement, long range', 'thoughtful strong modern', 'm'],
    ['敏行', 'Mǐnxíng', 3, 2, 'Quick to act', 'strong modern thoughtful', 'm'],
    ['温言', 'Wēnyán', 1, 2, 'Warm words', 'warm calm elegant', 'n'],
    ['温如', 'Wēnrú', 1, 2, 'Warm as jade', 'warm elegant traditional', 'f'],
    ['和光', 'Héguāng', 2, 1, 'Softening one’s own light', 'calm thoughtful traditional', 'n'],
    ['厚德', 'Hòudé', 4, 2, 'Ground thick enough to carry it', 'traditional strong thoughtful', 'm'],
    ['德远', 'Déyuǎn', 2, 3, 'Character that lasts', 'traditional thoughtful strong', 'm'],
    ['修文', 'Xiūwén', 1, 2, 'Cultivating the written word', 'traditional thoughtful elegant', 'n'],
    ['承文', 'Chéngwén', 2, 2, 'Carrying the writing forward', 'traditional thoughtful', 'm'],
    ['明书', 'Míngshū', 2, 1, 'A clear page', 'thoughtful modern elegant', 'n'],
    ['诗远', 'Shīyuǎn', 1, 3, 'Poetry that travels', 'poetic thoughtful unique', 'n'],
    ['诗涵', 'Shīhán', 1, 2, 'Poetry held and kept', 'poetic elegant thoughtful', 'f'],
    ['心远', 'Xīnyuǎn', 1, 3, 'A mind already elsewhere', 'calm thoughtful poetic', 'n'],
    ['心怡', 'Xīnyí', 1, 2, 'A heart at ease', 'warm calm elegant', 'f'],
    ['心月', 'Xīnyuè', 1, 4, 'The moon in the heart', 'poetic warm calm', 'f'],
    ['月明', 'Yuèmíng', 4, 2, 'Moonlight, plainly', 'poetic bright calm', 'n'],
    ['月白', 'Yuèbái', 4, 2, 'Pale as moonlight', 'poetic elegant calm', 'n'],
    ['星辰', 'Xīngchén', 1, 2, 'Stars and their season', 'poetic strong unique', 'n'],
    ['星月', 'Xīngyuè', 1, 4, 'Star and moon', 'poetic bright calm', 'f'],
    ['雨晴', 'Yǔqíng', 3, 2, 'Rain, then clear sky', 'bright natural warm', 'f'],
    ['晴岚', 'Qínglán', 2, 2, 'Clear air over the hills', 'natural bright poetic', 'f'],
    ['岚溪', 'Lánxī', 2, 1, 'Mist and a small stream', 'natural poetic calm', 'n'],
    ['溪月', 'Xīyuè', 1, 4, 'The moon in a stream', 'poetic calm elegant', 'f'],
    ['溪云', 'Xīyún', 1, 2, 'Cloud over the stream', 'poetic natural calm', 'f'],
    ['秋月', 'Qiūyuè', 1, 4, 'The moon of autumn', 'poetic calm traditional', 'f'],
    ['春晓', 'Chūnxiǎo', 1, 3, 'Waking to spring', 'bright natural poetic', 'f'],
    ['晓岚', 'Xiǎolán', 3, 2, 'Dawn mist', 'natural bright poetic', 'f']
  ].map(([han, pinyin, tone1, tone2, tagline, styles, gender]) => ({
    han, pinyin, tones: [tone1, tone2], tagline, styles: styles.split(' '), gender
  }));

  const api = { givenNames };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.HanziGivenNames = api;
})(typeof window === 'undefined' ? globalThis : window);
