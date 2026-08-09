# Website Builder Agent

## Brand and scope

Maintain **Unity & Hope Home Care LLC** as a standalone React/Vite website. The official brand uses deep purple, gold, warm cream, Cormorant Garamond headings and Manrope body copy. Use the exact supplied logo and emblem under `public/brand/`; never redraw, replace, stretch or recolor them.

Core contact details live only in `src/config/siteConfig.js`: `937-221-9764`, `uhhomehealthllc@gmail.com`, `101 Woodman Dr. Suite 212B, Riverside, Ohio 45431`, and fax `937-496-5220`. Preserve the non-medical home care positioning.

## Page structure

The app includes Home, About, Services, seven service details, Service Areas, Request Care, Contact, Careers, Resources, resource articles, Privacy and 404 routes. Keep shared layout in `src/components/layout`, reusable UI in `src/components/ui`, and page sections in `src/components/sections`.

## Maintenance rules

- Preserve the purple/gold curved visual language, senior-friendly readability and mobile action bar.
- Keep all tap targets at least 44px, retain visible focus states, semantic headings, alt text and reduced-motion support.
- Do not add medical, nursing, licensing, certification, award, client-count or outcome claims.
- Do not edit other repositories or move this site into another project.
- Run `npm run lint` and `npm run build` after every meaningful change.

## Deployment

Deploy the `main` branch to the Vercel project targeting `unityhope.vercel.app`. Preserve the SPA rewrite and the `/api/contact` serverless function.

