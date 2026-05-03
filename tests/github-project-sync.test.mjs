import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildProjectRecord } from '../tools/lib/github-project-sync.mjs';

test('buildProjectRecord merges curation with GitHub repository facts', () => {
	const record = buildProjectRecord(
		{
			repo: 'dk6251/dkx.github.io',
			category: 'tooling',
			status: 'active',
			featured: true,
			summaryOverride: 'Curated summary',
			sortOrder: 10,
		},
		{
			name: 'dkx.github.io',
			full_name: 'dk6251/dkx.github.io',
			description: 'Original description',
			html_url: 'https://github.com/dk6251/dkx.github.io',
			homepage: 'https://dkxsec.github.io/',
			language: 'TypeScript',
			topics: ['astro', 'blog'],
			stargazers_count: 5,
			forks_count: 2,
			created_at: '2026-04-30T00:00:00Z',
			updated_at: '2026-05-03T00:00:00Z',
			archived: false,
		},
	);

	assert.equal(record.id, 'dk6251-dkx-github-io');
	assert.equal(record.title, 'dkx.github.io');
	assert.equal(record.summary, 'Curated summary');
	assert.equal(record.repoUrl, 'https://github.com/dk6251/dkx.github.io');
	assert.equal(record.liveUrl, 'https://dkxsec.github.io/');
	assert.deepEqual(record.stack, ['TypeScript', 'astro', 'blog']);
	assert.equal(record.featured, true);
	assert.equal(record.status, 'active');
	assert.equal(record.category, 'tooling');
	assert.equal(record.sortOrder, 10);
});
