import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const site = defineCollection({
	loader: glob({ base: './src/content/site', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		name: z.string(),
		title: z.string(),
		subtitle: z.string(),
		description: z.string(),
		updatedDate: z.coerce.date().optional(),
		heroTitle: z.string(),
		heroTagline: z.string(),
		focusAreas: z.array(z.string()).default([]),
		socialLinks: z
			.array(
				z.object({
					label: z.string(),
					url: z.string().url(),
				}),
			)
			.default([]),
		skills: z
			.array(
				z.object({
					category: z.string(),
					items: z.array(z.string()).default([]),
				}),
			)
			.default([]),
		featuredProjects: z.array(z.string()).default([]),
	}),
});

const posts = defineCollection({
	loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		draft: z.boolean().default(false),
		featured: z.boolean().default(false),
		readingTime: z.string(),
		tags: z.array(z.string()).default([]),
	}),
});

const projects = defineCollection({
	loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		summary: z.string(),
		publishedDate: z.coerce.date(),
		status: z.enum(['planned', 'active', 'archived']).default('active'),
		category: z.enum(['ai', 'security', 'tooling', 'research']).default('tooling'),
		stack: z.array(z.string()).default([]),
		repoUrl: z.string().url().optional(),
		liveUrl: z.string().url().optional(),
		featured: z.boolean().default(false),
	}),
});

export const collections = { site, posts, projects };
