# jq-codes Project Guidelines

## Build Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run prettier` - Format all files with Prettier

## Code Style
- TypeScript with strict null checks
- Single quotes for strings
- Use Astro imports organization (prettier-plugin-astro-organize-imports)
- Follow shadcn/ui "new-york" style for components
- Use path aliases (@/ imports from project root)
- Prefer functional components for React
- Use TailwindCSS for styling following design system in tailwind.config.ts

## Project Structure
- Astro pages in src/pages
- React components in src/components/ui
- Astro components in src/components
- Content in src/content with MDX support
- Assets in src/assets and public/
- Follow Astro conventions for routing and layouts

## Error Handling
- Use TypeScript for type safety
- Handle null/undefined explicitly
- Prefer early returns for error conditions