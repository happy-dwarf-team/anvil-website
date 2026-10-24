import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// The plugin catalog as data, read by happydwarf.dev at build time. The contract is section
// 7.7 of https://github.com/happy-dwarf-team/happydwarf-website/blob/main/docs/spec.md:
// every entry, third-party and planned included. Bump schemaVersion only on a breaking change.
const icons = import.meta.glob<string>('../assets/plugins/*.svg', {
	eager: true,
	query: '?raw',
	import: 'default',
});

export const GET: APIRoute = async ({ site }) => {
	const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
	const plugins = (await getCollection('plugins'))
		.sort((a, b) => a.data.order - b.data.order)
		.map((plugin) => ({
			id: plugin.id,
			name: plugin.data.name,
			tagline: plugin.data.tagline,
			repo: plugin.data.repo,
			status: plugin.data.status,
			order: plugin.data.order,
			url: new URL(`${base}plugins/${plugin.id}/`, site).href,
			icon: icons[`../assets/plugins/${plugin.id}.svg`]?.trim() ?? null,
		}));
	return new Response(JSON.stringify({ schemaVersion: 1, plugins }, null, '\t') + '\n', {
		headers: { 'Content-Type': 'application/json' },
	});
};
