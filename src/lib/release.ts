// Reads the latest release of Anvil and of each plugin from the GitHub API at build time.
// Download buttons link to the asset of that exact release, so the file always matches the
// version, size and SHA-256 shown next to it; the site is rebuilt after every release (and
// daily), which keeps it current.
import { parse as parseToml } from 'smol-toml';

export const ANVIL_REPO = 'happy-dwarf-team/anvil';
export const ANVIL_ASSET = 'anvil-windows-x64.zip';

export interface Release {
	repo: string;
	version: string;
	tag: string;
	publishedAt: Date;
	sizeBytes: number;
	pageUrl: string;
	downloadUrl: string;
	checksumsUrl: string;
	// SHA-256 of the asset from the release's SHA256SUMS.txt, if it lists the asset.
	sha256?: string;
}

export function releasesUrl(repo: string): string {
	return `https://github.com/${repo}/releases`;
}

// Release asset of a catalog plugin: the frontmatter's `asset`, or <plugin-id>-windows-x64.zip.
export function pluginAsset(id: string, asset?: string): string {
	return asset ?? `${id}-windows-x64.zip`;
}

// "https://github.com/owner/name" → "owner/name"
export function repoSlug(repoUrl: string): string {
	return new URL(repoUrl).pathname.replace(/^\/|\/$/g, '');
}

function githubHeaders(): Record<string, string> {
	const headers: Record<string, string> = {
		Accept: 'application/vnd.github+json',
		'X-GitHub-Api-Version': '2022-11-28',
	};
	const token = process.env.GITHUB_TOKEN;
	if (token) headers.Authorization = `Bearer ${token}`;
	return headers;
}

const releases = new Map<string, Promise<Release | null>>();

export function getLatestRelease(repo = ANVIL_REPO, asset = ANVIL_ASSET): Promise<Release | null> {
	const key = `${repo}#${asset}`;
	let release = releases.get(key);
	if (!release) {
		release = fetchLatestRelease(repo, asset);
		releases.set(key, release);
	}
	return release;
}

async function fetchLatestRelease(repo: string, asset: string): Promise<Release | null> {
	try {
		const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
			headers: githubHeaders(),
		});
		if (!res.ok) {
			console.warn(`[release] ${repo}: GitHub API returned ${res.status}; building without release data.`);
			return null;
		}
		const data = (await res.json()) as {
			tag_name: string;
			published_at: string;
			html_url: string;
			assets: { name: string; size: number }[];
		};
		const file = data.assets.find((a) => a.name === asset);
		if (!file) {
			console.warn(`[release] ${repo} ${data.tag_name} has no ${asset}; building without release data.`);
			return null;
		}
		const download = `https://github.com/${repo}/releases/download/${data.tag_name}`;
		const checksumsUrl = `${download}/SHA256SUMS.txt`;
		return {
			repo,
			version: data.tag_name.replace(/^v/, ''),
			tag: data.tag_name,
			publishedAt: new Date(data.published_at),
			sizeBytes: file.size,
			pageUrl: data.html_url,
			downloadUrl: `${download}/${asset}`,
			checksumsUrl,
			sha256: await fetchSha256(checksumsUrl, asset),
		};
	} catch (error) {
		console.warn(`[release] ${repo}: ${String(error)}; building without release data.`);
		return null;
	}
}

async function fetchSha256(checksumsUrl: string, asset: string): Promise<string | undefined> {
	try {
		const res = await fetch(checksumsUrl);
		if (!res.ok) {
			console.warn(`[release] ${checksumsUrl} returned ${res.status}; no checksum shown.`);
			return undefined;
		}
		// sha256sum format: "<64 hex digits>  <file name>" per line.
		for (const line of (await res.text()).split('\n')) {
			const match = /^([0-9a-f]{64})\s+\*?(.+?)\s*$/i.exec(line);
			if (match && match[2] === asset) return match[1].toLowerCase();
		}
		console.warn(`[release] ${checksumsUrl} does not list ${asset}; no checksum shown.`);
	} catch (error) {
		console.warn(`[release] ${checksumsUrl}: ${String(error)}; no checksum shown.`);
	}
	return undefined;
}

export interface ReleaseNote {
	repo: string;
	version: string;
	publishedAt: Date;
	pageUrl: string;
	// Changelog entries from the release notes, e.g. "Features: range_witness: on by default".
	changes: { section: string; text: string }[];
}

// Sections of release-please notes worth listing on the site; build and CI changes are left out.
const NOTE_SECTIONS: Record<string, string> = {
	'⚠ BREAKING CHANGES': 'Breaking',
	Features: 'Feature',
	'Bug Fixes': 'Fix',
	Performance: 'Performance',
};

// "* **scope:** text ([#22](…)) ([2d3cb86](…))" → "scope: text"
function noteText(line: string): string {
	return line
		.replace(/^\*\s+/, '')
		.replace(/\s*\(\[[^\]]*\]\([^)]*\)\)/g, '')
		.replace(/\*\*([^*]+)\*\*/g, '$1')
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.trim();
}

function parseNotes(body: string): { section: string; text: string }[] {
	const changes: { section: string; text: string }[] = [];
	let section: string | undefined;
	for (const line of body.split('\n')) {
		const heading = /^###\s+(.+?)\s*$/.exec(line);
		if (heading) section = NOTE_SECTIONS[heading[1]];
		else if (section && line.startsWith('* ')) changes.push({ section, text: noteText(line) });
	}
	return changes;
}

// Published releases of a repository, newest first (at most the latest 30).
export async function getReleaseNotes(repo: string): Promise<ReleaseNote[] | null> {
	try {
		const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=30`, {
			headers: githubHeaders(),
		});
		if (!res.ok) {
			console.warn(`[release] ${repo}: GitHub API returned ${res.status}; no release notes.`);
			return null;
		}
		const data = (await res.json()) as {
			tag_name: string;
			published_at: string | null;
			html_url: string;
			body: string | null;
			draft: boolean;
			prerelease: boolean;
		}[];
		return data
			.filter((r) => !r.draft && !r.prerelease && r.published_at)
			.map((r) => ({
				repo,
				version: r.tag_name.replace(/^v/, ''),
				publishedAt: new Date(r.published_at as string),
				pageUrl: r.html_url,
				changes: parseNotes(r.body ?? ''),
			}));
	} catch (error) {
		console.warn(`[release] ${repo}: ${String(error)}; no release notes.`);
		return null;
	}
}

// The fields of a plugin's plugin.toml that the catalog shows.
export interface PluginManifest {
	anvil?: string;
	gameBuilds: string[];
	affectsGameplay: boolean;
}

// Reads plugin.toml as it was released, so the page matches the downloadable version.
export async function getReleasedManifest(
	release: Release,
	path: string,
): Promise<PluginManifest | null> {
	const url = `https://raw.githubusercontent.com/${release.repo}/${release.tag}/${path}`;
	try {
		const res = await fetch(url);
		if (!res.ok) {
			console.warn(`[release] ${url} returned ${res.status}; using the catalog frontmatter.`);
			return null;
		}
		const toml = parseToml(await res.text());
		const gameBuilds = toml.game_builds;
		return {
			anvil: typeof toml.anvil === 'string' ? toml.anvil : undefined,
			gameBuilds: Array.isArray(gameBuilds) ? gameBuilds.map(String) : [],
			affectsGameplay: toml.affects_gameplay === true,
		};
	} catch (error) {
		console.warn(`[release] ${url}: ${String(error)}; using the catalog frontmatter.`);
		return null;
	}
}

export function formatSize(bytes: number): string {
	if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function formatDate(date: Date): string {
	return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

// "eu4-1.37.5-steam-win64" → "EU4 1.37.5 (Steam, Windows 64-bit)"
export function describeGameBuild(build: string): string {
	const match = /^eu4-([\d.]+)-([a-z]+)-win64$/.exec(build);
	if (!match) return build;
	const stores: Record<string, string> = { steam: 'Steam', gog: 'GOG', msstore: 'Microsoft Store' };
	const store = stores[match[2]] ?? match[2];
	return `EU4 ${match[1]} (${store}, Windows 64-bit)`;
}
