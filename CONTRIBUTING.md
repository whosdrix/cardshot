# Contributing

Thanks for helping. The most useful contributions are new templates and bug reports with a URL that reproduces the problem.

## Setup

```sh
git clone https://github.com/whosdrix/cardshot
cd cardshot
npm install
npm run dev
```

Open http://localhost:3000 to see the template gallery.

For screenshots you need Chromium. Either run `npx playwright-core install chromium` or point `CHROMIUM_PATH` at an existing Chrome or Chromium binary. Set `ALLOW_PRIVATE_URLS=true` to screenshot pages on localhost.

## Adding a template

1. Create `src/og/templates/<name>.tsx` using `defineTemplate`. Look at `basic.tsx` for the smallest example.
2. Describe every parameter with a zod schema, and put image URLs in `imageParams` so they are fetched safely.
3. Add a realistic `example`. It is used by the gallery, the docs and the tests.
4. Register it in `src/og/templates/index.ts`.
5. Run `npm test` and check it in the gallery in both `theme=dark` and `theme=light`.

Templates are rendered with [Satori](https://github.com/vercel/satori), which supports a subset of CSS. Every element with more than one child needs `display: 'flex'`.

## Before opening a pull request

```sh
npm run lint
npm run typecheck
npm test
```

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org) (`feat:`, `fix:`, `docs:`), because releases and the changelog are generated from them.
