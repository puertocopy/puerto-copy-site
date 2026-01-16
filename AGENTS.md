# Repository Guidelines

## Project Structure & Module Organization
- `pages/` contains the Next.js routes; API handlers live in `pages/api/`.
- `components/` holds reusable UI components.
- `styles/` contains global styles; Tailwind is configured via `tailwind.config.js`.
- `public/` stores static assets served at the site root (e.g., `/logo.png`).
- `data/` and `utils/` contain data files and helper utilities used by pages and APIs.

## Build, Test, and Development Commands
- `npm run dev`: start the Next.js dev server with `NODE_OPTIONS=--openssl-legacy-provider`.
- `npm run build`: create an optimized production build.
- `npm run start`: run the production server from the build output.
- There is no `test` script configured; add one if you introduce a test runner.

## Coding Style & Naming Conventions
- Use 2-space indentation for JSON and consistent formatting in JS/TS files.
- Prefer descriptive, PascalCase component names in `components/` (e.g., `PricingTable`).
- Keep API route handlers in `pages/api/` with hyphenated filenames (e.g., `generar-factura.ts`).
- Tailwind utility classes are preferred for layout and styling; use `styles/` for globals.

## Testing Guidelines
- No testing framework is configured in `package.json`.
- If adding tests, document the runner and provide a `npm run test` script.
- Keep test files near the feature they cover or in a dedicated `__tests__/` folder.

## Commit & Pull Request Guidelines
- Recent commits use short, non-descriptive messages; consider adopting clear, imperative summaries (e.g., “Add invoice export API”).
- PRs should describe the change, link related issues if any, and include screenshots for UI updates.

## Configuration Notes
- Project uses Next.js with TypeScript for API routes and Tailwind for styling.
- Environment-specific values should be stored in `.env.local` and documented in the PR.
