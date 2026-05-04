import { test } from 'node:test';
import assert from 'node:assert/strict';

test('getTocHeadings keeps only visible article headings in order', async () => {
	const mod = await import('../src/lib/post-layout.ts').catch(() => ({}));
	assert.equal(typeof mod.getTocHeadings, 'function');

	const result = mod.getTocHeadings([
		{ depth: 1, slug: 'title', text: 'Article Title' },
		{ depth: 2, slug: 'why', text: 'Why this matters' },
		{ depth: 3, slug: 'steps', text: 'Implementation steps' },
		{ depth: 4, slug: 'deep-note', text: 'Deep note' },
		{ depth: 2, slug: 'empty', text: '   ' },
		{ depth: 2, slug: 'wrap-up', text: 'Wrap up' },
	]);

	assert.deepEqual(result, [
		{ depth: 2, slug: 'why', text: 'Why this matters' },
		{ depth: 3, slug: 'steps', text: 'Implementation steps' },
		{ depth: 2, slug: 'wrap-up', text: 'Wrap up' },
	]);
});
