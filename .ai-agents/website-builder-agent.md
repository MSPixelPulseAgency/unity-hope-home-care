# Website Builder Agent

## Brand and scope

Maintain **Unity & Hope Home Care LLC** as a standalone React/Vite website. The official brand uses deep purple, gold and warm cream with Atkinson Hyperlegible for senior-readable headings and body copy. Use the exact supplied logo and emblem under `public/brand/`; never redraw, replace, stretch or recolor them.

Core contact details live only in `src/config/siteConfig.js`: `937-221-9764`, `uhhomehealthllc@gmail.com`, `101 Woodman Dr. Suite 212B, Riverside, Ohio 45431`, and fax `937-496-5220`. Preserve the non-medical home care positioning.

Version-controlled fallback content lives in `src/data/`. Production owner edits are validated by `api/_cms.js`, stored privately in Vercel Blob and provided through `src/context/ContentContext.jsx`. Do not bypass that model or show fake testimonials/team profiles.

## Page structure

The public app includes Home, About, Services and service details, Service Areas, Request Care, Contact, Careers, Reviews, Resources/articles, Privacy and 404 routes. `admin.uhhomehealth.com` uses the secure `src/admin` owner portal in the same Vite project. Keep shared layout in `src/components/layout`, reusable UI in `src/components/ui`, and page sections in `src/components/sections`.

## Maintenance rules

- Preserve the purple/gold curved visual language, senior-friendly readability and mobile action bar.
- Keep body copy at 18-20px, hero descriptions at 22-24px, footer copy at least 17px and comfortable 1.7-1.9 line-height.
- Keep all tap targets at least 44px, retain visible focus states, semantic headings, alt text and reduced-motion support.
- Do not add medical, nursing, licensing, certification, award, client-count or outcome claims.
- Do not edit other repositories or move this site into another project.
- Run `npm run lint` and `npm run build` after every meaningful change.

## Deployment

Deploy `main` to the existing `unityhope` Vercel project. The only canonical public website URL is `https://uhhomehealth.com`; `www` redirects to the apex and the admin portal uses `https://admin.uhhomehealth.com`. Preserve all `/api/*` functions, the dynamic sitemap and the SPA rewrite.
