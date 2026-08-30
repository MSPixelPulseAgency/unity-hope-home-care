# Unity & Hope Home Care LLC

Production React/Vite website for Unity & Hope Home Care LLC, built from the supplied official logo, brochure and approved website references.

## Local setup

```bash
npm install
npm run dev
```

## Verification

```bash
npm run lint
npm test
npm run build
```

## Form delivery

The three website forms submit to `api/contact.js`, a Vercel serverless endpoint with server-side validation, a honeypot, time-based spam screening, best-effort serverless rate limiting and Gmail SMTP delivery through Nodemailer.

The endpoint sends a branded HTML and plain-text business notification, keeps Reply-to pointed at the submitter, and then sends a separate confirmation email to the submitter. Career applications may include an optional PDF, DOC or DOCX resume up to 3 MB. Resume bytes are validated, attached to the email and never persisted by the website.

Configure these server-only values in Vercel Production:

```env
GMAIL_USER=mspixelpulse@gmail.com
GMAIL_APP_PASSWORD=<Google app password stored only in Vercel>
CONTACT_TO_EMAIL=uhhomehealthllc@gmail.com
ALLOWED_ORIGIN=https://uhhomehealth.com,https://www.uhhomehealth.com,https://unityhope.vercel.app
SITE_URL=https://uhhomehealth.com
BLOB_READ_WRITE_TOKEN=<Vercel Blob token stored only in Vercel>
REVIEW_TOKEN_SECRET=<at least 32 random characters stored only in Vercel>
```

Never expose the Gmail app password through a `VITE_` variable or commit it to Git. If delivery is not configured, the endpoint returns an honest message directing visitors to call or email.

`GMAIL_USER` remains the authenticated SMTP sender. `CONTACT_TO_EMAIL` routes all business notifications to the Unity & Hope client inbox.

## Review workflow

The public `/reviews` page submits consented feedback to `api/reviews.js`. Reviews are stored as private records in the Vercel Blob store connected to the existing Vercel project. New records remain `pending` until the client uses the branded approval email.

Approve and decline links are action-specific, HMAC-signed, expire after 30 days and open a confirmation page before any change. The final status update uses a conditional write, clears both token hashes and fails safely if a link is invalid, expired or reused. Only consented `approved` reviews are returned by the public API; rejected and pending reviews never appear on the website.

## Routine content management

Routine business content is centralized so future updates do not require searching through page components:

- `src/config/siteConfig.js`: contact information, hours, production URL and approved external profiles
- `src/data/content.js`: homepage, process, FAQ and verified About mission copy
- `src/data/services.js`: services and service-page content
- `src/data/serviceAreas.js`: service-region language and map references
- `src/data/testimonials.js`: review-section headings; approved review records load from the private review workflow
- `src/data/team.js`: client-approved team profiles; hidden automatically while empty
- `src/data/resources.js`: resource articles and optional article metadata
- `src/data/seo.js`: editable titles and descriptions for core routes

See `docs/content-management.md` for the safe editing and publishing workflow. The website intentionally does not include a public admin password. Form inquiries and resumes continue to be managed through the configured business inbox and are not permanently stored by the website.

## Google readiness

The site already publishes `robots.txt`, an XML sitemap, canonical URLs and LocalBusiness, Service, Breadcrumb and FAQ structured data. Optional Google tools are inactive until valid public configuration values are added in Vercel:

```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_GOOGLE_SITE_VERIFICATION=<Search Console HTML-tag token>
```

Only set Google Analytics after the owner has approved the measurement/privacy approach. Add an approved Google Business Profile URL to `googleBusinessProfileUrl` in `src/config/siteConfig.js`. Never invent an analytics ID, verification token, review URL or business profile.

## Deployment

- Framework: Vite
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`
- Canonical production target: `https://uhhomehealth.com`
- Deployment alias: `https://unityhope.vercel.app`

## Source of truth

Business facts come from `source-material/unity and hope brochure.pdf`. The official identity comes from `source-material/Logo.jpeg`, and the visual system comes from the supplied website images in `source-material/`.
