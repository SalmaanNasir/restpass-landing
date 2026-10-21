import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const index = await readFile(new URL('index.html', root), 'utf8');
const privacy = await readFile(new URL('privacy.html', root), 'utf8');

test('preserves the approved coming-soon copy and lowercase brand', () => {
  const visibleHeadline = index
    .match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  assert.equal(visibleHeadline, 'Your hotel day, without the hotel stay.');
  assert.match(index, />COMING SOON</);
  assert.doesNotMatch(index, /RestPass|RESTPASS/);
  assert.doesNotMatch(privacy, /RestPass|RESTPASS/);
  assert.doesNotMatch(index, /—/);
  assert.doesNotMatch(privacy, /—/);
});

test('serves the hero and three credited experience photographs locally', () => {
  const imageTags = [...index.matchAll(/<img\b[^>]*>/g)].map(match => match[0]);

  assert.equal(imageTags.length, 4);
  for (const tag of imageTags) {
    assert.match(tag, /\ssrc="assets\/[^"]+\.webp"/);
    assert.match(tag, /\salt="[^"]+"/);
    assert.match(tag, /\swidth="\d+"/);
    assert.match(tag, /\sheight="\d+"/);
  }

  assert.doesNotMatch(index, /<img\b[^>]*src="https?:\/\//);
  assert.doesNotMatch(index, /<source\b[^>]*srcset="https?:\/\//);
  assert.equal((index.match(/class="experience-credit"/g) ?? []).length, 3);
});

test('keeps all three forms, privacy disclosures and the restpass submission target', () => {
  assert.equal((index.match(/<form\b[^>]*data-interest-form/g) ?? []).length, 3);
  assert.equal((index.match(/data-audience="guest"/g) ?? []).length, 2);
  assert.equal((index.match(/data-audience="hotel"/g) ?? []).length, 1);
  assert.equal((index.match(/agree to the <a href="privacy\.html">privacy policy<\/a>/g) ?? []).length, 3);
  assert.match(index, /https:\/\/qfdhbbnjudfitwrrbxuy\.supabase\.co/);
  assert.match(index, /rest\/v1\/launch_interest/);
  assert.match(index, /connect@restpass\.lk/);
});

test('retains accessible, restrained interaction details', () => {
  assert.match(index, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(index, /:focus-visible/);
  assert.match(index, /class="confirmation-mark" aria-hidden="true">[\s\S]*?<svg/);
  assert.doesNotMatch(index, />✓</);
  assert.match(index, /class="menu-button"[^>]*aria-expanded="false"[^>]*aria-controls="mobileMenu"/);
});
