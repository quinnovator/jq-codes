import { getCollection } from 'astro:content';
import { generateOGImage } from '@/lib/og-image';
import type { APIContext } from 'astro';

export const prerender = true;

const posts = await getCollection('blog');

export function getStaticPaths() {
  return posts.map(({ id }) => ({
    params: { id: id },
  }));
}

export async function GET({ params }: APIContext) {
  const { Resvg } = await import('@resvg/resvg-js');

  const post = posts.find((post) => post.id === params.id);

  if (!post) {
    return new Response('Post not found', { status: 404 });
  }

  const svg = await generateOGImage({
    title: post.data.title,
    description: post.data.description,
    scale: 2,
  });

  const resvg = new Resvg(svg);
  const png = resvg.render().asPng();

  return new Response(png, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
