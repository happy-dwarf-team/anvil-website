import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// One Markdown file per plugin in src/content/plugins/. The file name is the page slug.
const plugins = defineCollection({
	loader: glob({ pattern: '*.md', base: './src/content/plugins' }),
	schema: z.object({
		name: z.string(),
		summary: z.string(),
		repo: z.url(),
		status: z.enum(['planned', 'in-development', 'released']),
		gameBuilds: z.array(z.string()).min(1),
		affectsGameplay: z.boolean(),
		order: z.number().default(100),
		highlight: z
			.object({ label: z.string(), before: z.string(), after: z.string() })
			.optional(),
	}),
});

export const collections = {
	docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
	plugins,
};
