import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const index = await readFile(new URL('index.html', root), 'utf8');
const privacy = await readFile(new URL('privacy.html', root), 'utf8');
const partner = await readFile(new URL('partners/index.html', root), 'utf8');
const partnerCss = await readFile(new URL('partners/partners.css', root), 'utf8');

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

test('serves the hero, three credited experiences and example pass locally', () => {
  const imageTags = [...index.matchAll(/<img\b[^>]*>/g)].map(match => match[0]);

  assert.equal(imageTags.length, 5);
  for (const tag of imageTags) {
    assert.match(tag, /\ssrc="assets\/[^"]+\.webp"/);
    assert.match(tag, /\salt="[^"]+"/);
    assert.match(tag, /\swidth="\d+"/);
    assert.match(tag, /\sheight="\d+"/);
  }

  assert.doesNotMatch(index, /<img\b[^>]*src="https?:\/\//);
  assert.doesNotMatch(index, /<source\b[^>]*srcset="https?:\/\//);
  assert.equal((index.match(/class="experience-credit"/g) ?? []).length, 3);
  assert.match(index, /class="example-pass-image"[\s\S]*?src="assets\/restpass-example-pass-834x1280\.webp"/);
  assert.match(index, /\.example-pass-image\s*\{[\s\S]*?width:\s*min\(100%,30rem\)[\s\S]*?height:\s*auto/);
});

test('keeps all three forms, privacy disclosures and the restpass submission target', () => {
  assert.equal((index.match(/<form\b[^>]*data-interest-form/g) ?? []).length, 3);
  assert.equal((index.match(/data-audience="guest"/g) ?? []).length, 2);
  assert.equal((index.match(/data-audience="hotel"/g) ?? []).length, 1);
  assert.equal((index.match(/agree to the <a href="privacy\.html">privacy policy<\/a>/g) ?? []).length, 3);
  assert.match(index, /https:\/\/qfdhbbnjudfitwrrbxuy\.supabase\.co/);
  assert.match(index, /rest\/v1\/launch_interest/);
  assert.match(index, /support@restpass\.lk/);
});

test('retains accessible, restrained interaction details', () => {
  assert.match(index, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(index, /:focus-visible/);
  assert.doesNotMatch(index, /class="confirmation"/);
  assert.doesNotMatch(index, />✓</);
  assert.match(index, /class="menu-button"[^>]*aria-expanded="false"[^>]*aria-controls="mobileMenu"/);
});

test('links the approved partner page from the coming-soon site', () => {
  assert.ok((index.match(/href="partners\/"/g) ?? []).length >= 4);
  assert.match(partner, /<h1>restpass for partner hotels<\/h1>/);
  assert.match(partner, /support@restpass\.lk/);
  assert.match(partner, /id="hotel-partnership"/);
});

test('keeps partner assets local and the knowledge hub unpublished', () => {
  const imageTags = [...partner.matchAll(/<img\b[^>]*>/g)].map(match => match[0]);
  assert.equal(imageTags.length, 6);
  for (const tag of imageTags) {
    assert.match(tag, /\ssrc="assets\/[^\"]+"/);
    assert.match(tag, /\salt="[^\"]+"/);
    assert.match(tag, /\swidth="\d+"/);
    assert.match(tag, /\sheight="\d+"/);
  }
  assert.doesNotMatch(partner, /href="[^"]*knowledge/i);
  assert.doesNotMatch(partner, /staging\.restpass\.lk/i);
  assert.doesNotMatch(partner, /—/);
});

test('presents four commercial partner messages with partnership CTAs', () => {
  for (const heading of [
    'More Guests. More Opportunities.',
    'Reach More Customers.',
    'You Are in Control.',
    'Easy Tools. Simple Management.',
  ]) {
    assert.ok(partner.includes(`>${heading}</h2>`));
  }

  assert.equal((partner.match(/class="partner-button partner-value__cta" href="#hotel-partnership"/g) ?? []).length, 4);
  assert.match(partner, />Grow Your Revenue\s*</);
  assert.match(partner, />Expand Your Reach\s*</);
  assert.match(partner, />Explore Your Partnership Options\s*</);
  assert.match(partner, />Discover the Partner Platform\s*</);
  assert.doesNotMatch(partner, />Hotel controls</);
  assert.doesNotMatch(partner, />How bookings work</);
  assert.doesNotMatch(partner, />At reception</);
  assert.doesNotMatch(partner, />Getting started</);
  assert.match(partnerCss, /\.partner-value\s*\{[\s\S]*?display:\s*grid/);
  assert.match(partnerCss, /@media \(max-width:\s*1000px\)[\s\S]*?\.partner-value\s*\{\s*grid-template-columns:\s*1fr/);
});

test('answers the core hotel partnership questions', () => {
  assert.match(partner, /<h2 id="partner-faq-heading">Partner FAQs<\/h2>/);
  for (const question of [
    'How does restpass benefit my hotel?',
    'How much does it cost?',
    'Who controls prices and availability?',
    'How and when do I get paid?',
    'How are bookings managed?',
    'How do I become a partner?',
  ]) {
    assert.ok(partner.includes(`<summary>${question}</summary>`));
  }

  assert.match(partner, /Commission is calculated as a percentage of the eligible booking value and is negotiable\./);
  assert.doesNotMatch(partner, /10%|setup fee/i);
  assert.match(partner, /signed agreement will state the settlement schedule/i);
  assert.doesNotMatch(partner, /Can one hotel see another hotel's data\?/);
});
