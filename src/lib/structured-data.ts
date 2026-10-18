import type { Release } from './release';

// schema.org SoftwareApplication data for search engines, as a Starlight head entry. It is
// a JSON data block, not a script the browser runs.
export function softwareApplication(app: {
	name: string;
	description: string;
	pageUrl: string;
	repoUrl: string;
	release: Release | null;
}) {
	const data: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: app.name,
		description: app.description,
		url: app.pageUrl,
		applicationCategory: 'UtilitiesApplication',
		operatingSystem: 'Windows (64-bit)',
		license: 'https://opensource.org/licenses/MIT',
		isAccessibleForFree: true,
		author: { '@type': 'Organization', name: 'Happy Dwarf Team', url: 'https://github.com/happy-dwarf-team' },
		sameAs: app.repoUrl,
	};
	if (app.release) {
		data.softwareVersion = app.release.version;
		data.datePublished = app.release.publishedAt.toISOString().slice(0, 10);
		data.downloadUrl = app.release.downloadUrl;
		data.fileSize = `${Math.round(app.release.sizeBytes / 1024)} KB`;
	}
	return {
		tag: 'script' as const,
		attrs: { type: 'application/ld+json' },
		// "<" is escaped so the data cannot close the script element.
		content: JSON.stringify(data).replace(/</g, '\\u003c'),
	};
}
