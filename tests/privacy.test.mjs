import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('landing page links to the full privacy policy', async () => {
  const index = await readFile(new URL('index.html', root), 'utf8');

  assert.match(index, /href="privacy\.html"[^>]*>Privacy</);
  assert.match(index, /By joining, you agree to the <a href="privacy\.html">privacy policy<\/a>/);
});

test('privacy policy describes the limited pre-launch data use', async () => {
  const policy = await readFile(new URL('privacy.html', root), 'utf8');

  assert.match(policy, /email address/i);
  assert.match(policy, /hotel name/i);
  assert.match(policy, /waitlist/i);
  assert.match(policy, /hotel partnership/i);
  assert.match(policy, /do not sell/i);
  assert.match(policy, /delete/i);
  assert.match(policy, /support@restpass\.lk/i);
  assert.doesNotMatch(policy, /—/);
});
