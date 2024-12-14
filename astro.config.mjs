import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import sectionize from '@hbsnow/rehype-sectionize';
import { transformerCopyButton } from '@rehype-pretty/transformers';
import {
  transformerMetaHighlight,
  transformerNotationDiff,
} from '@shikijs/transformers';
import aws from 'astro-sst';
import { defineConfig, passthroughImageService } from 'astro/config';
import rehypeKatex from 'rehype-katex';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkEmoji from 'remark-emoji';
import remarkMath from 'remark-math';
import remarkToc from 'remark-toc';

import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  site: 'https://jq.codes',
  output: 'server',
  adapter: aws(),
  image: {
    service: passthroughImageService(),
  },
  experimental: {
    responsiveImages: true,
    svg: true,
  },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
    mdx(),
    react(),
    icon(),
  ],
  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [
      rehypeHeadingIds,
      rehypeKatex,
      sectionize,
      [
        rehypePrettyCode,
        {
          theme: {
            light: 'github-light-high-contrast',
            dark: 'github-dark-high-contrast',
          },
          transformers: [
            transformerNotationDiff(),
            transformerMetaHighlight(),
            transformerCopyButton({
              visibility: 'hover',
              feedbackDuration: 1000,
            }),
          ],
        },
      ],
    ],
    remarkPlugins: [remarkToc, remarkMath, remarkEmoji],
  },
  devToolbar: {
    enabled: false,
  },
});
