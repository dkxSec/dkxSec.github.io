import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function syncGitHubProjects(options) {
	const curationFile = path.resolve(options.curationFile);
	const outputFile = path.resolve(options.outputFile);
	const token = options.token;

	const curationEntries = JSON.parse(await readFile(curationFile, 'utf8')).filter((entry) => !entry.hidden);
	const records = [];

	for (const entry of curationEntries) {
		const repository = await fetchRepository(entry.repo, token);
		records.push(buildProjectRecord(entry, repository));
	}

	const payload = {
		syncedAt: new Date().toISOString(),
		items: records,
	};

	await mkdir(path.dirname(outputFile), { recursive: true });
	const tempFile = `${outputFile}.tmp`;
	await writeFile(tempFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
	await rename(tempFile, outputFile);

	return payload;
}

export function buildProjectRecord(curation, repository) {
	const fullName = repository.full_name ?? curation.repo;
	const stack = Array.from(new Set([repository.language, ...(repository.topics ?? []), ...(curation.stack ?? [])].filter(Boolean)));

	return {
		id: slugify(fullName.replace('/', '-')),
		repo: curation.repo,
		title: curation.titleOverride ?? repository.name,
		summary:
			curation.summaryOverride ??
			repository.description ??
			`${repository.name} repository mirrored from GitHub.`,
		publishedDate: normalizeDate(curation.publishedDate ?? repository.created_at),
		updatedDate: normalizeDate(repository.updated_at),
		status: repository.archived ? 'archived' : curation.status ?? 'active',
		category: curation.category,
		stack,
		repoUrl: repository.html_url,
		liveUrl: curation.liveUrlOverride ?? repository.homepage ?? undefined,
		featured: Boolean(curation.featured),
		sortOrder: Number(curation.sortOrder ?? 0),
		archived: Boolean(repository.archived),
		github: {
			fullName,
			language: repository.language ?? null,
			topics: repository.topics ?? [],
			stars: repository.stargazers_count ?? 0,
			forks: repository.forks_count ?? 0,
		},
	};
}

async function fetchRepository(repo, token) {
	const response = await fetch(`https://api.github.com/repos/${repo}`, {
		headers: {
			Accept: 'application/vnd.github+json',
			'User-Agent': 'dkx-personal-site-sync',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch ${repo}: ${response.status} ${response.statusText}`);
	}

	return response.json();
}

function normalizeDate(value) {
	const date = new Date(value);
	if (Number.isNaN(date.valueOf())) {
		throw new Error(`Invalid date value received from GitHub: ${value}`);
	}

	return date.toISOString().slice(0, 10);
}

function slugify(value) {
	return String(value)
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.replace(/-{2,}/g, '-');
}
