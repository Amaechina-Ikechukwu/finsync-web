

About this repository
---------------------

This repository contains the Finsync marketing site built with Next.js (App Router), React and TypeScript. It uses Tailwind CSS for styling and Biome for linting/formatting. The app is a static/SSR-friendly site with a main landing page at `src/app/page.tsx` and a collection of presentational components under `src/components`.

Quick facts
-----------

- Next.js: 15.x (App Router)
- React: 19.x
- TypeScript: 5.x
- Styling: Tailwind CSS 4
- Linter/Formatter: Biome

Available scripts
-----------------

Use the package manager of your choice (pnpm/yarn/npm/bun). Common scripts are defined in `package.json`:

- `npm run dev` — run Next.js in development mode (uses turbopack in this project)
- `npm run build` — build the production app
- `npm run start` — start the built app
- `npm run lint` — run Biome checks
- `npm run format` — run Biome formatter (writes changes)

Environment
-----------

The app reads `NEXT_PUBLIC_SITE_URL` for Open Graph image URLs and canonical links. Example:

```
NEXT_PUBLIC_SITE_URL=https://your-site.com
```

Project structure (important files)
----------------------------------

- `src/app/page.tsx` — main landing page + metadata
- `src/app/layout.tsx` — application layout and global providers
- `src/app/globals.css` — global Tailwind styles
- `src/components/` — presentational React components used on the page (Hero, Navbar, Footer, etc.)
- `public/` — static assets: images and svgs referenced from the site

Getting started (Windows, using cmd.exe)
---------------------------------------

1. Install dependencies (pnpm recommended if you use the lockfile):

```powershell
pnpm install
```

2. Start development server:

```powershell
pnpm dev
```

3. Build for production:

```powershell
pnpm build
pnpm start
```

Notes and troubleshooting
-------------------------

- The project uses Turbopack for dev/build via the `--turbopack` flag in scripts. If you run into issues, try removing `--turbopack` from the script or set the `NEXT_TELEMETRY_DISABLED=1` env var to silence telemetry.
- If Tailwind styles don't appear, ensure `src/app/globals.css` is imported by `src/app/layout.tsx` and that Tailwind is properly configured in `postcss.config.mjs` and `tailwind.config.*` if present.
- For linting/formatting, Biome is configured. Run `npm run lint` and `npm run format`.

Contributing
------------

This is primarily a static marketing site. Small changes to copy or styling can be made by editing files under `src/app` and `src/components`. Open a PR with the changes and ensure `pnpm build` completes.

License
-------

Replace with your license information if needed.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
