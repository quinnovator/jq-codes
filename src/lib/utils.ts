import { getEntry } from 'astro:content';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  return Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function readingTime(html: string) {
  const textOnly = html.replace(/<[^>]+>/g, '');
  const wordCount = textOnly.split(/\s+/).length;
  const readingTimeMinutes = (wordCount / 200 + 1).toFixed();
  return `${readingTimeMinutes} min read`;
}

export interface ParsedAuthor {
  slug: string;
  name: string;
  avatar: string;
  isRegistered: boolean;
}

export async function parseAuthors(authors: string[]): Promise<ParsedAuthor[]> {
  if (!authors || authors.length === 0) return [];

  const parseAuthor = async (slug: string) => {
    try {
      const author = await getEntry('authors', slug);
      return {
        slug,
        name: author?.data?.name || slug,
        avatar: author?.data?.avatar || '/static/logo.png',
        isRegistered: !!author,
      };
    } catch (error) {
      console.error(`Error fetching author with slug ${slug}:`, error);
      return {
        slug,
        name: slug,
        avatar: '/static/logo.png',
        isRegistered: false,
      };
    }
  };

  return await Promise.all(authors.map(parseAuthor));
}

export function getThemePreference(): 'dark' | 'theme-light' {
  if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
    return localStorage.getItem('theme') as 'dark' | 'theme-light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'theme-light';
}
