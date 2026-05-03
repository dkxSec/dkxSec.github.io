import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { syncGitHubProjects } from './lib/github-project-sync.mjs';

const rootDir = process.cwd();
const config = JSON.parse(await readFile(path.join(rootDir, 'content-sync.config.json'), 'utf8'));

const result = await syncGitHubProjects({
	curationFile: path.resolve(rootDir, config.projects?.curationFile ?? 'src/data/project-curation.json'),
	outputFile: path.resolve(rootDir, config.projects?.outputFile ?? 'src/data/generated/projects.generated.json'),
	token: process.env.GITHUB_TOKEN,
});

console.log(`Synced ${result.items.length} GitHub project(s).`);
