// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// SITE_URL / SITE_BASE are set by the deploy workflow. Without a custom domain the
// site lives at https://happy-dwarf-team.github.io/anvil-website/.
const site = process.env.SITE_URL ?? 'https://anvil.happydwarf.dev';
const base = process.env.SITE_BASE ?? '/';
// Social preview image (public/og.png, rendered by scripts/og-image.mjs); crawlers need an
// absolute URL.
const ogImage = new URL(`${base.replace(/\/?$/, '/')}og.png`, site).href;

export default defineConfig({
	site,
	base,
	trailingSlash: 'always',
	// Plugin pages renamed along with their plugin; old links keep working. Astro adds
	// `base` to the source path but not to the destination.
	redirects: {
		'/plugins/eu4-startup-boost/': `${base.replace(/\/$/, '')}/plugins/bellows/`,
	},
	integrations: [
		starlight({
			title: 'Anvil',
			description:
				'Anvil is a plugin loader for Europa Universalis IV. Native plugins, no changes to eu4.exe.',
			logo: { src: './src/assets/anvil-mark.svg', alt: '' },
			favicon: '/favicon.svg',
			credits: false,
			editLink: { baseUrl: 'https://github.com/happy-dwarf-team/anvil-website/edit/main/' },
			// Dates come from git history; the deploy workflow checks out the full history.
			lastUpdated: true,
			head: [
				{ tag: 'meta', attrs: { property: 'og:image', content: ogImage } },
				{ tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
				{ tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
				{ tag: 'meta', attrs: { property: 'og:image:alt', content: 'Anvil, plugin loader for Europa Universalis IV' } },
				{ tag: 'meta', attrs: { name: 'twitter:image', content: ogImage } },
				{ tag: 'meta', attrs: { name: 'theme-color', content: '#16171a' } },
			],
			// The family stylesheet imports the fonts; the site's own one comes after it.
			customCss: ['./src/styles/forge-family.css', './src/styles/theme.css'],
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/happy-dwarf-team/anvil' },
			],
			components: {
				Hero: './src/components/overrides/Hero.astro',
				ThemeProvider: './src/components/overrides/ThemeProvider.astro',
				ThemeSelect: './src/components/overrides/ThemeSelect.astro',
				SocialIcons: './src/components/overrides/SocialIcons.astro',
				Footer: './src/components/overrides/Footer.astro',
			},
			sidebar: [
				{
					label: 'Players',
					items: [
						{ slug: 'docs/install' },
						{ slug: 'docs/install-plugins' },
						{ slug: 'docs/plugins-from-mods' },
						{ slug: 'docs/troubleshooting' },
						{ slug: 'docs/faq' },
					],
				},
				{
					label: 'Plugin authors',
					items: [
						{ slug: 'docs/plugins/overview' },
						{ slug: 'docs/plugins/first-plugin' },
						{ slug: 'docs/plugins/manifest' },
						{ slug: 'docs/plugins/api' },
						{ slug: 'docs/plugins/workshop' },
						{ slug: 'docs/plugins/catalog' },
					],
				},
				{
					label: 'Project',
					items: [
						{ label: "What's new", link: '/whats-new/' },
						{ slug: 'docs/roadmap' },
					],
				},
			],
		}),
	],
});
