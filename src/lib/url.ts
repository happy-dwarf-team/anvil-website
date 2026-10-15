// Prefixes an internal path with the configured base, so links work both on the custom
// domain (base "/") and on happy-dwarf-team.github.io/anvil-website/.
export function url(path: string): string {
	const base = import.meta.env.BASE_URL.replace(/\/$/, '');
	return `${base}/${path.replace(/^\//, '')}`;
}
