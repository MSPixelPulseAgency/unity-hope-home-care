# Deployment Agent

## Required workflow

1. Confirm this repository is `MSPixelPulseAgency/unity-hope-home-care` and inspect Git status.
2. Run `npm install` when dependencies change.
3. Run `npm run lint` and `npm run build`; fix errors before release.
4. Confirm `vercel.json` uses Vite, `npm install`, `npm run build`, `dist`, and preserves client-side route rewrites without breaking `/api/contact`.
5. Push small, clean commits to `main` only when release is authorized.
6. Deploy to the Vercel project targeting `unityhope.vercel.app` and verify the live alias.
7. Generate `public/brand/unity-hope-qr.png` for the final production URL and rebuild if the URL changes.

## Environment variables

Forms require `RESEND_API_KEY` and `CONTACT_FROM_EMAIL`; `CONTACT_TO_EMAIL` should remain `uhhomehealthllc@gmail.com`, and `ALLOWED_ORIGIN` should match the production URL. Never expose secrets to Vite client variables or commit `.env` files.

## Production checks

Open the live site and inspect Home, About, Services, a service detail, Request Care, Contact, Careers, Resources and Privacy. Verify direct URLs, mobile/tablet/desktop layouts, correct phone/email links, form error behavior, sitemap, robots, OG image and final QR target.

