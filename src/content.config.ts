import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    repoName: z.string(),
    tagline: z.string(),
    pillar: z.enum(['architecture', 'ai-multiplatform']),
    category: z.string(),
    featured: z.boolean().default(false),
    order: z.number(),
    techStack: z.array(z.string()),
    metrics: z.array(z.object({
      label: z.string(),
      value: z.string(),
    })).optional(),
    architectureFocus: z.array(z.string()).optional(),
    aiMultiplierStory: z.string().optional(),
    githubUrl: z.string().optional(),
    demoUrl: z.string().optional(),
    coverImage: z.string().optional(),
    aestheticType: z.enum(['desktop', 'browser', 'extension', 'simulator', 'terminal']).default('browser'),
  }),
});

export const collections = { projects };
