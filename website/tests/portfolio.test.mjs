import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { projects, boothUrl } from '../src/projects.js';
import { createWindows, windowReducer, fitRect } from '../src/windowing.js';

const bounds = { width: 1440, height: 796 };
test('all descriptions and external destinations match the captured original site', () => {
  const original = readFileSync(new URL('./fixtures/original-site.html', import.meta.url), 'utf8');
  const originalLinks = [...original.matchAll(/<a[^>]*href="(https:[^"]+)"/g)].map(match => match[1]);
  const actualLinks = [...projects.flatMap(project => project.links.map(([, href]) => href)), boothUrl];
  assert.equal(projects.length, 6);
  assert.equal(actualLinks.length, 13);
  assert.deepEqual(actualLinks.sort(), originalLinks.sort());
  for (const project of projects) {
    assert.ok(original.includes(`>${project.name}</h3>`), project.name);
    assert.ok(original.includes(`<p>${project.description}</p>`), project.description);
  }
});
test('maximize, minimize, restore, and unmaximize preserve the normal frame', () => {
  let state = createWindows(bounds);
  state = windowReducer(state, { type: 'move', id: 'projects', x: 140, y: 20, bounds });
  const moved = { ...state.projects.rect };
  state = windowReducer(state, { type: 'maximize', id: 'projects' });
  state = windowReducer(state, { type: 'minimize', id: 'projects' });
  assert.equal(state.projects.mode, 'minimized');
  state = windowReducer(state, { type: 'open', id: 'projects' });
  assert.equal(state.projects.mode, 'maximized');
  state = windowReducer(state, { type: 'maximize', id: 'projects' });
  assert.equal(state.projects.mode, 'normal');
  assert.deepEqual(state.projects.rect, moved);
});
test('closed windows can reopen and regain focus without affecting the other window', () => {
  let state = createWindows(bounds);
  const readme = state.readme;
  state = windowReducer(state, { type: 'close', id: 'projects' });
  assert.equal(state.projects.mode, 'closed');
  state = windowReducer(state, { type: 'open', id: 'projects' });
  assert.equal(state.projects.mode, 'normal');
  assert.equal(state.active, 'projects');
  assert.deepEqual(state.readme, readme);
});
test('dragging outside the desktop keeps the whole title bar recoverable', () => {
  const frame = fitRect({ x: -5000, y: 5000, width: 400, height: 350 }, bounds);
  assert.equal(frame.x, 8);
  assert.equal(frame.y + frame.height, bounds.height - 8);
  const reverse = fitRect({ ...frame, x: 5000, y: -5000 }, bounds);
  assert.equal(reverse.x + reverse.width, bounds.width - 8);
  assert.equal(reverse.y, 8);
});
test('resize and reset recover usable frames after a small viewport', () => {
  let state = createWindows(bounds);
  const small = { width: 390, height: 620 };
  state = windowReducer(state, { type: 'resize', bounds: small });
  for (const id of ['projects', 'readme']) {
    const rect = state[id].rect;
    assert.ok(rect.width > 0 && rect.height > 0);
    assert.ok(rect.x + rect.width <= small.width - 8);
    assert.ok(rect.y + rect.height <= small.height - 8);
  }
  state = windowReducer(state, { type: 'close', id: 'projects' });
  state = windowReducer(state, { type: 'reset', bounds });
  assert.deepEqual(state, createWindows(bounds));
});
