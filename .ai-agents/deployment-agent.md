# Deployment Agent

## Required workflow

1. Confirm this repository is `MSPixelPulseAgency/unity-hope-home-care` and inspect Git status.
2. Run `npm install` when dependencies change.
3. Run `npm run lint` and `npm run build`; fix errors before release.
4. Confirm `vercel.json` uses Vite, `npm install`, `npm run build`, `dist`, the dynamic sitemap rewrite and client-side route rewrites without breaking `/api/*`.
5. Push small, clean commits to `main` only when release is authorized.
6. Deploy the existing `unityhope` Vercel project and verify `https://uhhomehealth.com`, the `www` redirect and `https://admin.uhhomehealth.com`.
7. Generate `public/brand/unity-hope-qr.png` for the final production URL and rebuild if the URL changes.

## Environment variables

Forms require server-only `GMAIL_USER` and `GMAIL_APP_PASSWORD` values. `CONTACT_TO_EMAIL` routes form notifications; `ADMIN_EMAIL` routes password reset and review-owner messages. Temporary QA ownership may use an agency mailbox only when explicitly authorized. At client handoff, replace the sender and owner values together with the client's own Gmail App Password. Never print, copy to frontend code or commit secrets.

Admin authentication additionally requires `ADMIN_ORIGIN`, `ADMIN_SESSION_SECRET` and `ADMIN_PASSWORD_HASH`. The Blob token and review secret remain server-only. `ALLOWED_ORIGIN` includes the apex, `www` and admin host.

`VITE_GA_MEASUREMENT_ID` and `VITE_GOOGLE_SITE_VERIFICATION` are optional public Google configuration values. Leave them blank until the client supplies valid values and approves analytics/privacy use. They are not substitutes for the server-only Gmail settings.

## Production checks

Open the live site and inspect Home, About, Services, a service detail, Request Care, Contact, Careers, Reviews, Resources and Privacy. Verify the admin sign-in/reset/logout workflow, managed content, submissions, résumé downloads and review moderation. Check direct URLs, responsive layouts, email delivery, sitemap, robots, schema, OG image, QR target and production logs. Never change/delete Directnic apex, `www`, MX, TXT or unrelated records.
