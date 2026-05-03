import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { syncObsidianPosts } from './lib/obsidian-sync.mjs';

const rootDir = process.cwd();
const config = JSON.parse(await readFile(path.join(rootDir, 'content-sync.config.json'), 'utf8'));

const sourceDir = process.env.OBSIDIAN_CONTENT_DIR || config.obsidian?.sourceDir;

if (!sourceDir) {
	console.error('Missing Obsidian source directory. Set OBSIDIAN_CONTENT_DIR or content-sync.config.json -> obsidian.sourceDir.');
	process.exit(1);
}

const result = await syncObsidianPosts({
	sourceDir: path.resolve(rootDir, sourceDir),
	outputDir: path.resolve(rootDir, config.obsidian?.outputDir ?? 'src/content/posts'),
	publicDir: path.resolve(rootDir, config.obsidian?.publicDir ?? 'public'),
	publicAssetBasePath: config.obsidian?.publicAssetBasePath ?? '/obsidian-assets',
});

console.log(`Synced ${result.posts.length} Obsidian post(s).`);
