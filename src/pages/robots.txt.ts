import type { APIRoute } from 'astro';

// Allows all crawlers and points them at the sitemap, for the custom domain and for
// /anvil-website/ alike.
export const GET: APIRoute = ({ site }) => {
	const sitemap = new URL(`${import.meta.env.BASE_URL.replace(/\/?$/, '/')}sitemap-index.xml`, site);
	return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap.href}\n`);
};
