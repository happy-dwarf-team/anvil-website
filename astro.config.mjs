// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// SITE_URL / SITE_BASE are set by the deploy workflow. Without a custom domain the
// site lives at https://happy-dwarf-team.github.io/anvil-website/.
const site = process.env.SITE_URL ?? 'https://anvil.happydwarf.dev';
const base = process.env.SITE_BASE ?? '/';

export default defineConfig({
	site,
	base,
	trailingSlash: 'always',
	integrations: [
		starlight({
			title: 'Anvil',
			description:
				'Anvil is a plugin loader for Europa Universalis IV. Native plugins, no changes to eu4.exe.',
			logo: { src: './src/assets/anvil-mark.svg', alt: '' },
			favicon: '/favicon.svg',
			credits: false,
			customCss: [
				'@fontsource-variable/ibm-plex-sans/wght.css',
				'@fontsource-variable/jetbrains-mono/wght.css',
				'./src/styles/theme.css',
			],
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
						{ slug: 'docs/troubleshooting' },
						{ slug: 'docs/faq' },
					],
				},
				{
					label: 'Plugin authors',
					items: [
						{ slug: 'docs/plugins/overview' },
						{ slug: 'docs/plugins/manifest' },
						{ slug: 'docs/plugins/api' },
					],
				},
			],
		}),
	],
});
