import { createHash } from 'node:crypto';
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

import matter from 'gray-matter';

const MARKDOWN_EXTENSIONS = new Set(['.md', '.mdx']);
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif']);

export async function syncObsidianPosts(options) {
	const sourceDir = path.resolve(options.sourceDir);
	const outputDir = path.resolve(options.outputDir);
	const publicDir = path.resolve(options.publicDir);
	const publicAssetBasePath = normalizePublicBasePath(options.publicAssetBasePath ?? '/obsidian-assets');

	await ensureDirectory(sourceDir, 'Obsidian source directory');
	await mkdir(outputDir, { recursive: true });
	await mkdir(publicDir, { recursive: true });

	const files = await listFiles(sourceDir);
	const noteFiles = files.filter((file) => MARKDOWN_EXTENSIONS.has(path.extname(file).toLowerCase()));
	const parsedNotes = [];

	for (const file of noteFiles) {
		const absolutePath = path.join(sourceDir, file);
		const raw = await readFile(absolutePath, 'utf8');
		const parsed = matter(raw);
		const publish = parsed.data.publish === true;

		if (!publish) {
			continue;
		}

		const frontmatter = normalizeFrontmatter(parsed.data, absolutePath);
		const slug = resolveSlug({
			candidates: [frontmatter.slug, frontmatter.title, path.basename(file, path.extname(file))],
			seed: file,
		});

		parsedNotes.push({
			absolutePath,
			relativePath: file,
			slug,
			frontmatter,
			content: parsed.content.trim(),
		});
	}

	const linkMap = buildLinkMap(parsedNotes);
	await rm(outputDir, { recursive: true, force: true });
	await mkdir(outputDir, { recursive: true });

	const posts = [];

	for (const note of parsedNotes) {
		const transformed = await transformMarkdown(note, {
			sourceDir,
			publicDir,
			publicAssetBasePath,
			linkMap,
		});

		const readingTime = note.frontmatter.readingTime ?? estimateReadingTime(transformed.body);
		const rendered = renderMarkdownFile({
			title: note.frontmatter.title,
			description: note.frontmatter.description,
			date: note.frontmatter.date,
			updatedDate: note.frontmatter.updatedDate,
			draft: note.frontmatter.draft ?? false,
			featured: note.frontmatter.featured ?? false,
			readingTime,
			tags: note.frontmatter.tags,
			body: transformed.body,
		});

		await writeFile(path.join(outputDir, `${note.slug}.md`), rendered, 'utf8');
		posts.push({
			slug: note.slug,
			outputPath: path.join(outputDir, `${note.slug}.md`),
		});
	}

	return { posts };
}

function normalizeFrontmatter(data, absolutePath) {
	const requiredFields = ['title', 'description', 'date', 'tags'];
	const missingFields = requiredFields.filter((field) => {
		const value = data[field];
		if (field === 'tags') {
			return !Array.isArray(value) || value.length === 0;
		}

		return value === undefined || value === null || value === '';
	});

	if (missingFields.length > 0) {
		throw new Error(`${absolutePath} is missing required frontmatter fields: ${missingFields.join(', ')}`);
	}

	return {
		title: String(data.title).trim(),
		description: String(data.description).trim(),
		date: normalizeDate(data.date, absolutePath, 'date'),
		updatedDate: data.updatedDate ? normalizeDate(data.updatedDate, absolutePath, 'updatedDate') : undefined,
		draft: Boolean(data.draft ?? false),
		featured: Boolean(data.featured ?? false),
		readingTime: data.readingTime ? String(data.readingTime) : undefined,
		tags: Array.from(new Set(data.tags.map((tag) => String(tag).trim()).filter(Boolean))),
		slug: data.slug ? String(data.slug) : undefined,
	};
}

function normalizeDate(value, absolutePath, fieldName) {
	const date = new Date(value);
	if (Number.isNaN(date.valueOf())) {
		throw new Error(`${absolutePath} has an invalid ${fieldName}: ${value}`);
	}

	return date.toISOString().slice(0, 10);
}

function buildLinkMap(notes) {
	const map = new Map();

	for (const note of notes) {
		const candidates = [
			note.slug,
			path.basename(note.relativePath, path.extname(note.relativePath)),
			note.frontmatter.title,
		];

		for (const candidate of candidates) {
			map.set(normalizeLookupKey(candidate), note.slug);
		}
	}

	return map;
}

async function transformMarkdown(note, context) {
	let body = note.content;
	body = await replaceObsidianImageLinks(body, note, context);
	body = replaceObsidianNoteLinks(body, context.linkMap, note.absolutePath);
	body = await replaceMarkdownRelativeAssets(body, note, context);
	body = replaceMarkdownRelativeNoteLinks(body, note, context.linkMap);

	return { body };
}

async function replaceObsidianImageLinks(content, note, context) {
	const matches = Array.from(content.matchAll(/!\[\[([^[\]\|]+?)(?:\|([^[\]]+))?\]\]/g));
	let updated = content;

	for (const match of matches) {
		const assetReference = match[1].trim();
		const altText = (match[2] ?? path.basename(assetReference, path.extname(assetReference))).trim();
		const publicPath = await copyAssetForNote(assetReference, note, context);
		updated = updated.replace(match[0], `![${altText}](${publicPath})`);
	}

	return updated;
}

function replaceObsidianNoteLinks(content, linkMap, absolutePath) {
	return content.replace(/\[\[([^[\]\|]+?)(?:\|([^[\]]+))?\]\]/g, (match, target, label) => {
		const slug = linkMap.get(normalizeLookupKey(target));
		if (!slug) {
			throw new Error(`${absolutePath} contains an unresolved Obsidian link: ${target}`);
		}

		const text = (label ?? target).trim();
		return `[${text}](/posts/${slug}/)`;
	});
}

async function replaceMarkdownRelativeAssets(content, note, context) {
	const matches = Array.from(content.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g));
	let updated = content;

	for (const match of matches) {
		const altText = match[1];
		const target = match[2].trim();
		if (isExternalTarget(target) || !isImageReference(target)) {
			continue;
		}

		const publicPath = await copyAssetForNote(target, note, context);
		updated = updated.replace(match[0], `![${altText}](${publicPath})`);
	}

	return updated;
}

function replaceMarkdownRelativeNoteLinks(content, note, linkMap) {
	return content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, target) => {
		if (isExternalTarget(target) || isImageReference(target)) {
			return match;
		}

		const ext = path.extname(target).toLowerCase();
		if (!MARKDOWN_EXTENSIONS.has(ext)) {
			return match;
		}

		const absoluteTarget = path.resolve(path.dirname(note.absolutePath), target);
		const slug = linkMap.get(normalizeLookupKey(path.basename(absoluteTarget, ext)));
		if (!slug) {
			throw new Error(`${note.absolutePath} contains an unresolved Markdown link: ${target}`);
		}

		return `[${label}](/posts/${slug}/)`;
	});
}

async function copyAssetForNote(target, note, context) {
	const absoluteAssetPath = await resolveAssetPath(target, note, context.sourceDir);
	const fileName = path.basename(absoluteAssetPath);
	const targetDir = path.join(context.publicDir, trimLeadingSlash(context.publicAssetBasePath), note.slug);
	await mkdir(targetDir, { recursive: true });
	await cp(absoluteAssetPath, path.join(targetDir, fileName), { force: true });
	return `${context.publicAssetBasePath}/${note.slug}/${encodeURIComponent(fileName)}`;
}

async function resolveAssetPath(target, note, sourceDir) {
	const normalizedTarget = target.replace(/^\.\//, '');
	const candidates = [
		path.resolve(path.dirname(note.absolutePath), normalizedTarget),
		path.resolve(sourceDir, normalizedTarget),
	];

	for (const candidate of candidates) {
		try {
			const details = await stat(candidate);
			if (details.isFile()) {
				return candidate;
			}
		} catch {}
	}

	throw new Error(`${note.absolutePath} references a missing asset: ${target}`);
}

function renderMarkdownFile({ title, description, date, updatedDate, draft, featured, readingTime, tags, body }) {
	const lines = [
		'---',
		`title: '${escapeSingleQuotes(title)}'`,
		`description: '${escapeSingleQuotes(description)}'`,
		`date: ${date}`,
	];

	if (updatedDate) {
		lines.push(`updatedDate: ${updatedDate}`);
	}

	lines.push(`draft: ${draft ? 'true' : 'false'}`);
	lines.push(`featured: ${featured ? 'true' : 'false'}`);
	lines.push(`readingTime: '${escapeSingleQuotes(readingTime)}'`);
	lines.push('tags:');

	for (const tag of tags) {
		lines.push(`  - '${escapeSingleQuotes(tag)}'`);
	}

	lines.push('---', '', body, '');

	return lines.join('\n');
}

function estimateReadingTime(content) {
	const wordCount = content
		.replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
		.replace(/\[[^\]]+\]\([^)]+\)/g, ' ')
		.split(/\s+/)
		.filter(Boolean).length;

	return `${Math.max(1, Math.ceil(wordCount / 200))} min`;
}

async function listFiles(rootDir, currentDir = rootDir) {
	const entries = await readdir(currentDir, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const absolutePath = path.join(currentDir, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await listFiles(rootDir, absolutePath)));
			continue;
		}

		files.push(path.relative(rootDir, absolutePath));
	}

	return files;
}

async function ensureDirectory(directoryPath, label) {
	try {
		const details = await stat(directoryPath);
		if (!details.isDirectory()) {
			throw new Error(`${label} is not a directory: ${directoryPath}`);
		}
	} catch (error) {
		if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
			throw new Error(`${label} does not exist: ${directoryPath}`);
		}

		throw error;
	}
}

function normalizeLookupKey(value) {
	return String(value).trim().toLowerCase().replace(/\.[^.]+$/, '');
}

function slugify(value) {
	return String(value)
		.normalize('NFKC')
		.toLowerCase()
		.replace(/[^\p{Letter}\p{Number}]+/gu, '-')
		.replace(/^-+|-+$/g, '')
		.replace(/-{2,}/g, '-');
}

function resolveSlug({ candidates, seed }) {
	for (const candidate of candidates) {
		if (!candidate) {
			continue;
		}

		const slug = slugify(candidate);
		if (slug) {
			return slug;
		}
	}

	return `post-${createHash('sha1').update(String(seed)).digest('hex').slice(0, 10)}`;
}

function isExternalTarget(target) {
	return /^(https?:)?\/\//i.test(target) || target.startsWith('mailto:') || target.startsWith('/');
}

function isImageReference(target) {
	return IMAGE_EXTENSIONS.has(path.extname(target.split('?')[0]).toLowerCase());
}

function normalizePublicBasePath(value) {
	return value.startsWith('/') ? value.replace(/\/$/, '') : `/${value.replace(/\/$/, '')}`;
}

function trimLeadingSlash(value) {
	return value.replace(/^\/+/, '');
}

function escapeSingleQuotes(value) {
	return String(value).replace(/'/g, "''");
}
