// Reads the latest Anvil release from the GitHub API at build time.
// The download button links to releases/latest/download/<asset> regardless, so a stale
// build still serves the newest file; only the version label and size can lag behind.

export const ANVIL_REPO = 'happy-dwarf-team/anvil';
export const ANVIL_ASSET = 'anvil-windows-x64.zip';
export const LATEST_DOWNLOAD_URL = `https://github.com/${ANVIL_REPO}/releases/latest/download/${ANVIL_ASSET}`;
export const LATEST_CHECKSUMS_URL = `https://github.com/${ANVIL_REPO}/releases/latest/download/SHA256SUMS.txt`;
export const RELEASES_URL = `https://github.com/${ANVIL_REPO}/releases`;

export interface AnvilRelease {
	version: string;
	publishedAt: Date;
	sizeBytes: number;
	pageUrl: string;
}

let cached: Promise<AnvilRelease | null> | undefined;

export function getLatestRelease(): Promise<AnvilRelease | null> {
	cached ??= fetchLatestRelease();
	return cached;
}

async function fetchLatestRelease(): Promise<AnvilRelease | null> {
	const headers: Record<string, string> = {
		Accept: 'application/vnd.github+json',
		'X-GitHub-Api-Version': '2022-11-28',
	};
	const token = process.env.GITHUB_TOKEN;
	if (token) headers.Authorization = `Bearer ${token}`;

	try {
		const res = await fetch(`https://api.github.com/repos/${ANVIL_REPO}/releases/latest`, {
			headers,
		});
		if (!res.ok) {
			console.warn(`[release] GitHub API returned ${res.status}; building without release data.`);
			return null;
		}
		const data = (await res.json()) as {
			tag_name: string;
			published_at: string;
			html_url: string;
			assets: { name: string; size: number }[];
		};
		const asset = data.assets.find((a) => a.name === ANVIL_ASSET);
		if (!asset) {
			console.warn(`[release] ${data.tag_name} has no ${ANVIL_ASSET}; building without release data.`);
			return null;
		}
		return {
			version: data.tag_name.replace(/^v/, ''),
			publishedAt: new Date(data.published_at),
			sizeBytes: asset.size,
			pageUrl: data.html_url,
		};
	} catch (error) {
		console.warn(`[release] ${String(error)}; building without release data.`);
		return null;
	}
}

export function formatSize(bytes: number): string {
	if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
