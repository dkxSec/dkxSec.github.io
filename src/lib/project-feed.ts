import { getCollection } from 'astro:content';

import generatedProjects from '../data/generated/projects.generated.json';

export type ProjectCategory = 'ai' | 'security' | 'tooling' | 'research';
export type ProjectStatus = 'planned' | 'active' | 'archived';

export interface ProjectCard {
	id: string;
	title: string;
	summary: string;
	publishedDate: Date;
	updatedDate?: Date;
	status: ProjectStatus;
	category: ProjectCategory;
	stack: string[];
	repoUrl?: string;
	liveUrl?: string;
	featured: boolean;
	sortOrder: number;
	source: 'github-sync' | 'content';
	github?: {
		fullName: string;
		language: string | null;
		topics: string[];
		stars: number;
		forks: number;
	};
}

interface GeneratedProjectsFile {
	syncedAt?: string;
	items?: Array<{
		id: string;
		title: string;
		summary: string;
		publishedDate: string;
		updatedDate?: string;
		status: ProjectStatus;
		category: ProjectCategory;
		stack?: string[];
		repoUrl?: string;
		liveUrl?: string;
		featured?: boolean;
		sortOrder?: number;
		github?: {
			fullName: string;
			language: string | null;
			topics: string[];
			stars: number;
			forks: number;
		};
	}>;
}

export async function loadProjectCards() {
	const manualProjects = await getCollection('projects');
	const syncedProjects = normalizeGeneratedProjects(generatedProjects as GeneratedProjectsFile);
	const seenKeys = new Set(
		syncedProjects.map((project) => project.repoUrl?.toLowerCase() ?? `id:${project.id}`),
	);

	const manualCards = manualProjects
		.filter((project) => {
			const repoKey = project.data.repoUrl?.toLowerCase() ?? `id:${project.id}`;
			return !seenKeys.has(repoKey);
		})
		.map((project) => ({
			id: project.id,
			title: project.data.title,
			summary: project.data.summary,
			publishedDate: project.data.publishedDate,
			status: project.data.status,
			category: project.data.category,
			stack: project.data.stack,
			repoUrl: project.data.repoUrl,
			liveUrl: project.data.liveUrl,
			featured: project.data.featured,
			sortOrder: 0,
			source: 'content' as const,
		}));

	return [...syncedProjects, ...manualCards].sort(compareProjects);
}

function normalizeGeneratedProjects(payload: GeneratedProjectsFile) {
	return (payload.items ?? []).map((project) => ({
		id: project.id,
		title: project.title,
		summary: project.summary,
		publishedDate: new Date(project.publishedDate),
		updatedDate: project.updatedDate ? new Date(project.updatedDate) : undefined,
		status: project.status,
		category: project.category,
		stack: project.stack ?? [],
		repoUrl: project.repoUrl,
		liveUrl: project.liveUrl,
		featured: Boolean(project.featured),
		sortOrder: Number(project.sortOrder ?? 0),
		source: 'github-sync' as const,
		github: project.github,
	}));
}

function compareProjects(a: ProjectCard, b: ProjectCard) {
	if (a.sortOrder !== b.sortOrder) {
		return b.sortOrder - a.sortOrder;
	}

	const updatedTimeA = a.updatedDate?.valueOf() ?? a.publishedDate.valueOf();
	const updatedTimeB = b.updatedDate?.valueOf() ?? b.publishedDate.valueOf();

	return updatedTimeB - updatedTimeA;
}
