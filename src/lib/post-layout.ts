function isValidHeading(heading) {
	return (
		heading &&
		typeof heading.slug === 'string' &&
		heading.slug.trim().length > 0 &&
		typeof heading.text === 'string' &&
		heading.text.trim().length > 0 &&
		typeof heading.depth === 'number' &&
		heading.depth >= 2 &&
		heading.depth <= 3
	);
}

export function getTocHeadings(headings = []) {
	const normalizedHeadings = headings.filter(isValidHeading).map((heading) => ({
		depth: heading.depth,
		slug: heading.slug.trim(),
		text: heading.text.trim(),
	}));

	const groups = [];

	for (const heading of normalizedHeadings) {
		if (heading.depth === 2 || groups.length === 0) {
			groups.push({
				slug: heading.slug,
				text: heading.text,
				items: [],
			});
			continue;
		}

		groups.at(-1).items.push({
			slug: heading.slug,
			text: heading.text,
		});
	}

	return groups;
}
