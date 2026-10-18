// Reads the latest release of Anvil and of each plugin from the GitHub API at build time.
// Download buttons link to releases/latest/download/<asset> regardless, so a stale build
// still serves the newest file; only the version label and size can lag behind.
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
}

export interface ReleaseLinks {
	download: string;
	checksums: string;
	releases: string;
}

export function releaseLinks(repo: string, asset: string): ReleaseLinks {
	const releases = `https://github.com/${repo}/releases`;
	return {
		download: `${releases}/latest/download/${asset}`,
		checksums: `${releases}/latest/download/SHA256SUMS.txt`,
		releases,
	};
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
		return {
			repo,
			version: data.tag_name.replace(/^v/, ''),
			tag: data.tag_name,
			publishedAt: new Date(data.published_at),
			sizeBytes: file.size,
			pageUrl: data.html_url,
		};
	} catch (error) {
		console.warn(`[release] ${repo}: ${String(error)}; building without release data.`);
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
