import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**\/[^_]*.mdx', base: './src/content/blog' }),
  schema: z.object({
    title: z
      .string()
      .max(
        60,
        'Title should be 60 characters or less for optimal Open Graph display.',
      ),
    description: z
      .string()
      .max(
        155,
        'Description should be 155 characters or less for optimal Open Graph display.',
      ),
    date: z.coerce.date(),
    tags: z.array(z.string()).optional(),
    authors: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
  }),
});

const authors = defineCollection({
  loader: glob({ pattern: '**\/[^_]*.md', base: './src/content/authors' }),
  schema: z.object({
    name: z.string(),
    avatar: z.string().url(),
    bio: z.string().optional(),
    mail: z.string().email().optional(),
    website: z.string().url().optional(),
    twitter: z.string().url().optional(),
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    discord: z.string().url().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**\/[^_]*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      description: z.string(),
      objective: z.string(),
      deliverables: z.string(),
      key_learnings: z.string(),
      tags: z.array(z.string()),
      image: image(),
      link: z.string(),
    }),
});

export const collections = { blog, authors, projects };
