# ybc-docs

Documentation site for the YBC protocol, built with
[Fumadocs](https://fumadocs.dev) on Next.js (App Router) + MDX.

This site is documentation only — it's meant to be served from a `docs.`
subdomain, so the docs are mounted at the site root (no landing page, no
`/docs` prefix).

## Develop

```bash
npm run dev
```

Open http://localhost:3000 — that's the docs root. Editing any `.mdx` file
under `content/docs` hot-reloads the page.

Other scripts:

- `npm run build` — production build
- `npm start` — serve the production build
- `npm run types:check` — `next typegen && tsc --noEmit`

## Writing docs

Every page is one `.mdx` file under `content/docs`. The file path becomes the
URL: `content/docs/vault/deposits.mdx` → `/vault/deposits`, and a folder's
`index.mdx` is that folder's root page (`content/docs/index.mdx` is the site
home).

Each file starts with frontmatter:

```mdx
---
title: Deposits
description: How collateral enters the vault.
---

Markdown body here, plus any React component.
```

`title` and `description` drive the sidebar, page header, `<title>`, and the
generated OG image.

### Sidebar order and folders

Order defaults to alphabetical. To control it, drop a `meta.json` next to the
pages:

```json
{
  "title": "Vault",
  "icon": "Vault",
  "pages": ["index", "deposits", "withdrawals", "..."]
}
```

- `pages` lists file/folder names without extension, in the order you want.
- `"..."` means "everything else here" — new files still appear without editing
  the list.
- `icon` is any [lucide](https://lucide.dev) icon name (wired up in
  `lib/source.ts` via `lucideIconsPlugin`).
- Full conventions: https://fumadocs.dev/docs/ui/page-conventions

### MDX components

`Callout`, `Card`/`Cards`, and code blocks (syntax highlighting, `title=`, line
highlighting) are available in any page with no import — they come from
`defaultMdxComponents` in `components/mdx.tsx`.

````mdx
<Callout type="warn">Positions below the MCR can be liquidated.</Callout>

```solidity title="Vault.sol"
function deposit(uint256 amount) external { }
```
````

Everything else — `Tabs`/`Tab`, `Steps`/`Step`, `Accordion`, `Files`, `Banner`,
type tables — is imported per page:

```mdx
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
```

To make a component global (your own or a Fumadocs one), add it to the object
returned by `getMDXComponents` in `components/mdx.tsx`; then every page can use
it without importing. Write your own components in `components/`.

Math (KaTeX), Mermaid diagrams, and OpenAPI generation are opt-in add-ons — see
https://fumadocs.dev/docs/ui/markdown.

## Project map

| Path                                         | What it is                                                     |
| -------------------------------------------- | -------------------------------------------------------------- |
| `content/docs/`                              | Your MDX pages and `meta.json` files — this is where you write |
| `lib/shared.ts`                              | App name, route prefixes, GitHub repo config                    |
| `lib/source.ts`                              | Content collection definition + `loader()`                      |
| `lib/layout.shared.tsx`                      | Navbar options shared by all layouts                            |
| `components/mdx.tsx`                         | Global MDX component map                                        |
| `app/(docs)/`                                | Docs layout + catch-all page renderer, mounted at `/`           |
| `app/layout.tsx`                             | Root HTML shell, theme provider, site metadata                  |
| `app/api/search/route.ts`                    | Search endpoint (Orama, local, no API key)                      |
| `app/og/docs/`                               | Per-page generated OG images                                    |
| `app/llms.txt`, `llms-full.txt`, `llms.mdx/` | LLM-friendly plaintext versions of the docs                     |
| `proxy.ts`                                   | Serves the raw Markdown of a page to clients that ask for it    |
| `app/global.css`                             | Tailwind v4 entry + Fumadocs theme                              |

Two things to fill in before going live:

- `gitConfig` in `lib/shared.ts` is still a placeholder — set it to the real repo
  so the navbar link and the per-page "Edit on GitHub" button work.
- Set `NEXT_PUBLIC_SITE_URL` to the docs subdomain (e.g.
  `https://docs.example.com`) so OG images and canonical URLs don't resolve
  against `localhost`. On Vercel this is inferred automatically.

If you ever do add non-docs pages, put them in their own route group (e.g.
`app/(marketing)/`) — `docsRoute` in `lib/shared.ts` is what pins the docs to
`/`, and `proxy.ts` excludes non-docs routes by name.

## Deploy

Any Next.js host works; Vercel is zero-config. Point the `docs.` subdomain at
the deployment. For a fully static export, see
https://fumadocs.dev/docs/ui/static-export.
