'use strict';
// Opt-in live benchmark. MODEL_API_KEY is supplied by the parent process; never printed.
const models = ['openrouter/free', 'liquid/lfm-2.5-2.6b:free', 'google/gemma-4-26b-a4b-it:free', 'nvidia/nemotron-3.5-lightning:free'];
(async () => {
  if (!process.env.MODEL_API_KEY) throw new Error('MODEL_API_KEY is required');
  for (const model of models) {
    const started = Date.now();
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST', signal: AbortSignal.timeout(30000),
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.MODEL_API_KEY}` },
        body: JSON.stringify({ model, temperature: 0.2, max_tokens: 1200, response_format: { type: 'json_object' }, reasoning: { enabled: false }, messages: [
          { role: 'system', content: 'Return JSON only. No reasoning prose. Give a natural Chinese courtesy name related to the input. Include characters, pinyin and one short English reason.' },
          { role: 'user', content: '明澈' }
        ] })
      });
      const payload = await response.json();
      const content = payload.choices?.[0]?.message?.content;
      let valid = false;
      try { const item = JSON.parse(content); valid = Boolean(item.characters && item.pinyin && item.reason); } catch (_) {}
      console.log(JSON.stringify({ model, actualModel: payload.model, status: response.status, ms: Date.now() - started, validJSON: valid, content: valid ? content : undefined }));
    } catch (error) { console.log(JSON.stringify({ model, ms: Date.now() - started, error: error.name })); }
  }
})();
