# Unity & Hope Content Management Architecture

Production owner edits are made at `https://admin.uhhomehealth.com`. The admin portal and public website are delivered from the same React/Vite repository and existing Vercel project.

## Content model

- `src/data/` and `src/config/siteConfig.js` contain reviewed, version-controlled defaults.
- `api/_cms.js` validates and sanitizes every owner-editable section.
- Private `cms/site-content.json` in the connected Vercel Blob store contains current owner edits.
- `api/content.js` returns only public-safe managed content.
- `src/context/ContentContext.jsx` merges managed content with the checked-in defaults so the website remains usable if storage is temporarily unavailable.
- `/sitemap.xml` is generated from visible services and published articles.

The admin portal can manage business details, homepage and About mission copy, section visibility, services, service areas, team members, original resource articles, publication status and core route SEO. Uploaded JPEG, PNG and WebP images are stored privately and served through the restricted public media endpoint; no Blob credential reaches frontend code.

## Reviews and submissions

Reviews start as `pending` private records. The configured owner email receives action-specific HMAC-signed approval and decline links. Links expire, require a confirmation step, use a conditional write and fail safely when invalid or reused. The admin portal can also approve, decline, hide, republish or delete a review. Only consented, approved and published reviews are public.

Contact, care-request and career records are stored privately after the business email succeeds. Career résumé uploads are signature-validated PDF/DOC/DOCX files, attached to the owner email and retained privately for authenticated download. The portal supports `new`, `read`, `in-progress` and `completed` status plus permanent deletion.

## Authentication and deployment

There is no registration route. Authentication uses the configured owner email and a scrypt password record, persistent server-side sessions, HttpOnly/Secure/SameSite cookies, CSRF validation, host/origin checks and persistent login/reset throttling. Password reset links are one-time and expire after 30 minutes.

Required production values are documented in `.env.example`. Never commit secret values or expose them through `VITE_` variables. Keep `https://uhhomehealth.com` as the only canonical public website URL; `www` redirects to the apex. Do not change Directnic apex, `www`, MX, TXT or unrelated records when maintaining the admin subdomain.

Before release, run:

```bash
npm install
npm run lint
npm test
npm run build
git diff --check
```

Then verify the public website, admin portal, forms, review moderation, storage, sitemap, robots, schema, HTTPS/redirects and Vercel production logs.
