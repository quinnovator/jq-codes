export type Site = {
  TITLE: string;
  DESCRIPTION: string;
  EMAIL: string;
  NUM_POSTS_ON_HOMEPAGE: number;
  POSTS_PER_PAGE: number;
  SITEURL: string;
};

export type Link = {
  href: string;
  label: string;
};

export const SITE: Site = {
  TITLE: 'Jack Quinn',
  DESCRIPTION: 'Jack Quinn is a professional software engineer.',
  EMAIL: 'jack@jq.codes',
  NUM_POSTS_ON_HOMEPAGE: 2,
  POSTS_PER_PAGE: 3,
  SITEURL: 'https://jq.codes',
};

export const NAV_LINKS: Link[] = [
  { href: '/blog', label: 'blog' },
  { href: '/about', label: 'about' },
  { href: '/tags', label: 'tags' },
];

export const SOCIAL_LINKS: Link[] = [
  { href: 'https://github.com/quinnovator', label: 'GitHub' },
  { href: 'https://twitter.com/quinnovator_', label: 'Twitter' },
  { href: 'jack@jq.codes', label: 'Email' },
  { href: '/rss.xml', label: 'RSS' },
];
