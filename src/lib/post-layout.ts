export function getTocHeadings(headings = []) {
	return headings.filter(
		(heading) =>
			heading &&
			typeof heading.text === 'string' &&
			heading.text.trim().length > 0 &&
			typeof heading.depth === 'number' &&
			heading.depth >= 2 &&
			heading.depth <= 3,
	);
}
