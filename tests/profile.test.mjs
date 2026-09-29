import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';

const root = new URL('../', import.meta.url);
const readme = readFileSync(new URL('README.md', root), 'utf8');

test('both hero variants use the LC identity and preserve the personal name', () => {
  for (const asset of ['assets/hero.svg', 'assets/hero-mobile.svg']) {
    const svg = readFileSync(new URL(asset, root), 'utf8');
    assert.match(svg, />LC \/ /);
    assert.doesNotMatch(svg, /\bLG\b/);
    assert.match(svg, /Lucas Gabriel/);
  }
  assert.match(readFileSync(new URL('assets/hero.svg', root), 'utf8'), /LC monogram/);
});

test('profile navigation resolves to the intended sections', () => {
  const headings = [...readme.matchAll(/^## (.+)$/gm)].map(match => match[1].toLowerCase().replaceAll(' ', '-'));
  const links = [...readme.matchAll(/href="#([^"]+)"/g)].map(match => match[1]);
  assert.equal(links.length, 5);
  for (const link of links) assert.ok(headings.includes(link), `Missing section: ${link}`);
});

test('all profile image references exist and SVGs contain no executable markup', () => {
  const assets = [...readme.matchAll(/(?:src|srcset)="(assets\/[^"]+)"/g)].map(match => match[1]);
  assert.ok(assets.length >= 10);
  for (const asset of assets) {
    const file = new URL(asset, root);
    assert.ok(existsSync(file), `Missing image: ${asset}`);
    const svg = readFileSync(file, 'utf8');
    assert.match(svg, /<svg\b/);
    assert.doesNotMatch(svg, /<script\b|<foreignObject\b|NaN|Infinity|undefined/i);
  }
});

test('projects lead skills and secondary analytics remain expandable', () => {
  assert.ok(readme.indexOf('## Selected projects') < readme.indexOf('## Technical skills'));
  const details = readme.match(/<details>([\s\S]*?)<\/details>/)?.[1];
  assert.ok(details);
  for (const asset of ['stats.svg', 'streak.svg', 'languages.svg', 'snake.svg']) {
    assert.ok(details.includes(asset), `${asset} must remain secondary`);
  }
  assert.ok(!readme.includes('assets/typing.svg'));
});

test('identity, education and approved contacts are explicit', () => {
  assert.match(readme, /Lucas Gabriel/);
  assert.match(readme, /12th year of a vocational Computer Programming course/);
  assert.match(readme, /lucas\.gb318@gmail\.com/);
  assert.match(readme, /vulgoelice/);
  assert.doesNotMatch(readme, /linkedin\.com|tel:|\[SEU|Full Stack Expert|years of professional experience/i);
});
