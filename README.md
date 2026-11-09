# AMRA Curated

Bilingual RU/EN storefront with seller proposals and a protected team inbox. Vinext on Cloudflare Workers with D1 and R2.

## Source

- `public/app.js`, `style.css`, `harmony.css`: existing storefront and demo catalogue.
- `public/seller.js`, `seller.css`: seller form at `/#/sell` and home teaser.
- `public/admin.js`, `admin.css`: administration at `/admin`.
- `site/*.html`: page shells; generated TypeScript HTML imports are refreshed by `scripts/prepare-pages.mjs` before dev/build.
- `app/api/submissions`: anonymous multipart submission with validation, upload limits and rate limiting.
- `app/api/admin`: authenticated list/detail/update and private photographs.
- `db/schema.ts`, `drizzle/`: D1 schema and migrations.

## Development

Install with the Sites dependency helper, then `pnpm dev`. Build with the Sites build helper. Run `node tests/submissions-local.mjs` for handler tests using SQLite and an in-memory bucket; `pnpm exec tsc --noEmit` for types.

The hosting manifest binds D1 as `DB` and private R2 as `BUCKET`. Migration SQL is in `drizzle/`. Never commit local runtime state or secrets.

## Team access

Set runtime secret `ADMIN_EMAILS` to a comma-separated list of authorized ChatGPT account emails. Requests require both trusted authenticated user ID and matching email; email alone is insufficient. Visitors can submit without signing in. `/admin` prompts for ChatGPT sign-in. Every data and photograph API checks team access, including direct image requests.

## Proposal workflow

Owners submit details, 1–6 JPG/PNG/WebP photographs (4 MiB each, 16 MiB combined), contacts, preferred buyout/consignment format and consent. Records persist in D1; photos in private R2. Team members can search, filter, review details/photos, change status and save notes. Revision checks prevent overwriting concurrent edits. Status changes do not send messages or publish products automatically.

This is the first admin module. Catalogue data is still authored in `public/app.js`. Existing buyer enquiries are prepared locally for copying; automated notifications, payments and catalogue editing are not connected. Seller proposals are real, separate from the demonstration inventory.

## Assets

`hero.webp` and `studio.webp` were generated using built-in Imagegen for this prototype. Hero prompt: editorial photograph of a terracotta abstract ceramic loop on a limestone plinth in a sunlit ivory gallery, no text. Studio prompt: editorial close-up of an artisan's hands making a ceramic vessel on a quiet studio workbench, no text. `digital-1.svg` through `digital-3.svg` are original procedural vector studies generated in code, not minted NFTs.

Illustrative stock photographs from Unsplash, downloaded and converted to WebP:

- painting: https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5
- fragrance: https://images.unsplash.com/photo-1615634260167-c8cdede054de
- perfume2: https://images.unsplash.com/photo-1608571423902-eed4a5ad8108
- jewellery: https://images.unsplash.com/photo-1617038220319-276d3cfab638
- earrings: https://images.unsplash.com/photo-1535632066927-ab7c9ab60908
- gallery-new (abstract painting): https://images.unsplash.com/photo-1561214115-f2f134cc4912
- watch-new: https://images.unsplash.com/photo-1547996160-81dfa63595aa

Stock photos do not establish brand relationships, product authenticity, ownership, or available inventory. Replace them with verified product photography for commercial release.

## Atelier hero

The first screen uses `public/atelier-hero.js`, `public/atelier-hero.css` and `public/assets/hero-atelier.webp`. Text, CTA and category navigation are real HTML. The warm gallery background is illustrative imagery. Mobile layout stacks readable copy above a crop dedicated to the display objects. The Orbit implementation was removed; seller submissions and administration are unchanged.
