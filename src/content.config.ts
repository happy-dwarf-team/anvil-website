import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// One Markdown file per plugin in src/content/plugins/. The file name is the page slug; an
// optional icon with the same name in src/assets/plugins/ is shown by PluginIcon.astro.
const plugins = defineCollection({
	loader: glob({ pattern: '*.md', base: './src/content/plugins' }),
	schema: z.object({
		name: z.string(),
		summary: z.string(),
		// One sentence in a user's words; published in plugins.json for happydwarf.dev.
		tagline: z.string(),
		repo: z.url(),
		status: z.enum(['planned', 'in-development', 'released']),
		gameBuilds: z.array(z.string()).min(1),
		affectsGameplay: z.boolean(),
		order: z.number().default(100),
		// Release asset and manifest path in the plugin repository; the defaults fit the
		// Happy Dwarf Team plugins (<id>-windows-x64.zip, plugin/plugin.toml).
		asset: z.string().optional(),
		manifestPath: z.string().default('plugin/plugin.toml'),
		highlight: z
			.object({ label: z.string(), before: z.string(), after: z.string() })
			.optional(),
	}),
});

export const collections = {
	docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
	plugins,
};
