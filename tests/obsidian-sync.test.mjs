import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';
import assert from 'node:assert/strict';

import { syncObsidianPosts } from '../tools/lib/obsidian-sync.mjs';

const tempDirs = [];

after(async () => {
	for (const dir of tempDirs) {
		await import('node:fs/promises').then(({ rm }) => rm(dir, { recursive: true, force: true }));
	}
});

test('syncObsidianPosts copies only publish=true notes and normalizes links/assets', async () => {
	const root = await mkdtemp(path.join(tmpdir(), 'obsidian-sync-'));
	tempDirs.push(root);

	const sourceDir = path.join(root, 'vault');
	const outputDir = path.join(root, 'site-posts');
	const publicDir = path.join(root, 'public');

	await import('node:fs/promises').then(async ({ mkdir }) => {
		await mkdir(path.join(sourceDir, 'notes'), { recursive: true });
		await mkdir(path.join(sourceDir, 'assets'), { recursive: true });
	});

	await writeFile(
		path.join(sourceDir, 'notes', 'first-note.md'),
		`---
title: First Note
description: First synced article
date: 2026-05-01
tags:
  - AI
publish: true
---
Hello [[Second Note|next]].

![[assets/diagram.png|Architecture]]
`,
		'utf8',
	);

	await writeFile(
		path.join(sourceDir, 'notes', 'second-note.md'),
		`---
title: Second Note
description: Follow-up article
date: 2026-05-02
tags:
  - Security
publish: true
---
Published follow-up.
`,
		'utf8',
	);

	await writeFile(
		path.join(sourceDir, 'notes', 'draft-note.md'),
		`---
title: Draft Note
description: Hidden draft
date: 2026-05-03
tags:
  - Draft
publish: false
---
Should stay out.
`,
		'utf8',
	);

	await writeFile(path.join(sourceDir, 'assets', 'diagram.png'), 'png', 'utf8');

	const result = await syncObsidianPosts({
		sourceDir,
		outputDir,
		publicDir,
		publicAssetBasePath: '/obsidian-assets',
	});

	assert.equal(result.posts.length, 2);
	assert.equal(result.posts[0].slug, 'first-note');

	const generated = await readFile(path.join(outputDir, 'first-note.md'), 'utf8');
	assert.match(generated, /readingTime: '1 min'/);
	assert.match(generated, /\[next\]\(\/posts\/second-note\/\)/);
	assert.match(generated, /!\[Architecture\]\(\/obsidian-assets\/first-note\/diagram\.png\)/);

	const copiedAsset = await readFile(path.join(publicDir, 'obsidian-assets', 'first-note', 'diagram.png'), 'utf8');
	assert.equal(copiedAsset, 'png');
});

test('syncObsidianPosts rejects published notes with missing required fields', async () => {
	const root = await mkdtemp(path.join(tmpdir(), 'obsidian-sync-'));
	tempDirs.push(root);

	const sourceDir = path.join(root, 'vault');
	const outputDir = path.join(root, 'site-posts');
	const publicDir = path.join(root, 'public');

	await import('node:fs/promises').then(async ({ mkdir }) => {
		await mkdir(sourceDir, { recursive: true });
	});

	await writeFile(
		path.join(sourceDir, 'broken.md'),
		`---
title: Broken
publish: true
---
No description or date.
`,
		'utf8',
	);

	await assert.rejects(
		() =>
			syncObsidianPosts({
				sourceDir,
				outputDir,
				publicDir,
				publicAssetBasePath: '/obsidian-assets',
			}),
		/missing required frontmatter fields/i,
	);
});

test('syncObsidianPosts generates a stable slug for Chinese titles without explicit slug', async () => {
	const root = await mkdtemp(path.join(tmpdir(), 'obsidian-sync-'));
	tempDirs.push(root);

	const sourceDir = path.join(root, 'vault');
	const outputDir = path.join(root, 'site-posts');
	const publicDir = path.join(root, 'public');

	await import('node:fs/promises').then(async ({ mkdir }) => {
		await mkdir(sourceDir, { recursive: true });
	});

	await writeFile(
		path.join(sourceDir, 'git-management.md'),
		`---
title: AI Coding 场景下的 Git 管理
description: 中文标题文章也应该生成稳定 slug
date: 2026-05-03
tags:
  - AI
publish: true
---
正文内容。
`,
		'utf8',
	);

	const result = await syncObsidianPosts({
		sourceDir,
		outputDir,
		publicDir,
		publicAssetBasePath: '/obsidian-assets',
	});

	assert.equal(result.posts.length, 1);
	assert.equal(result.posts[0].slug, 'ai-coding-场景下的-git-管理');

	const generated = await readFile(path.join(outputDir, 'ai-coding-场景下的-git-管理.md'), 'utf8');
	assert.match(generated, /title: 'AI Coding 场景下的 Git 管理'/);
});

test('syncObsidianPosts only replaces previously generated files in a shared posts directory', async () => {
	const root = await mkdtemp(path.join(tmpdir(), 'obsidian-sync-'));
	tempDirs.push(root);

	const sourceDir = path.join(root, 'vault');
	const outputDir = path.join(root, 'site-posts');
	const publicDir = path.join(root, 'public');

	await import('node:fs/promises').then(async ({ mkdir }) => {
		await mkdir(sourceDir, { recursive: true });
		await mkdir(outputDir, { recursive: true });
	});

	await writeFile(path.join(outputDir, 'manual-post.md'), '---\ntitle: keep\n---\n', 'utf8');
	await writeFile(
		path.join(outputDir, '.obsidian-sync-manifest.json'),
		JSON.stringify({ files: ['old-generated.md'] }, null, 2),
		'utf8',
	);
	await writeFile(path.join(outputDir, 'old-generated.md'), 'stale', 'utf8');

	await writeFile(
		path.join(sourceDir, 'new-post.md'),
		`---
title: New Post
description: Shared output directory should stay safe
date: 2026-05-03
tags:
  - ai
publish: true
---
content
`,
		'utf8',
	);

	await syncObsidianPosts({
		sourceDir,
		outputDir,
		publicDir,
		publicAssetBasePath: '/obsidian-assets',
	});

	await assert.doesNotReject(() => readFile(path.join(outputDir, 'manual-post.md'), 'utf8'));
	await assert.rejects(() => readFile(path.join(outputDir, 'old-generated.md'), 'utf8'));
	await assert.doesNotReject(() => readFile(path.join(outputDir, 'new-post.md'), 'utf8'));
});
