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

The endpoint sends a branded HTML and plain-text business notification, keeps Reply-To pointed at the submitter, and then sends a separate confirmation email to the submitter. Career applications may include an optional PDF, DOC or DOCX résumé up to 3 MB. Résumé bytes are validated, attached to the notification and retained in private Vercel Blob storage for secure owner follow-up through the admin portal.

Configure these server-only values in Vercel Production:

```env
GMAIL_USER=<temporary authenticated Gmail sender>
GMAIL_APP_PASSWORD=<Google app password stored only in Vercel>
CONTACT_TO_EMAIL=<temporary owner inbox>
ADMIN_EMAIL=<temporary owner inbox>
ADMIN_EMAILS=uhhomehealthllc@gmail.com,eyesdigitbusinessstudio@gmail.com,mspixelpulse@gmail.com
ALLOWED_ORIGIN=https://uhhomehealth.com,https://www.uhhomehealth.com,https://admin.uhhomehealth.com
SITE_URL=https://uhhomehealth.com
ADMIN_ORIGIN=https://admin.uhhomehealth.com
ADMIN_SESSION_SECRET=<at least 32 random characters stored only in Vercel>
ADMIN_PASSWORD_HASH=<scrypt password record generated outside the browser>
BLOB_READ_WRITE_TOKEN=<Vercel Blob token stored only in Vercel>
REVIEW_TOKEN_SECRET=<at least 32 random characters stored only in Vercel>
```

Never expose the Gmail app password through a `VITE_` variable or commit it to Git. If delivery is not configured, the endpoint returns an honest message directing visitors to call or email.

`GMAIL_USER` remains the authenticated SMTP sender. `CONTACT_TO_EMAIL` routes all business notifications to the Unity & Hope client inbox.

## Review workflow

The public `/reviews` page submits consented feedback to `api/reviews.js`. Reviews are stored as private records in the Vercel Blob store connected to the existing Vercel project. New records remain `pending` until the client uses the branded approval email.

Approve and decline links are action-specific, HMAC-signed, expire after 30 days and open a confirmation page before any change. The final status update uses a conditional write, clears both moderation token hashes and fails safely if a link is invalid, expired or reused. A separate signed withdrawal token lets the original submission be removed without exposing storage credentials. Only consented `approved` reviews are returned by the public API; rejected and pending reviews never appear on the website.

## Owner portal and routine content management

The private owner portal is available only at `https://admin.uhhomehealth.com`. `ADMIN_EMAILS` is the exact server-side allowlist; each approved email has its own scrypt password record, independent HttpOnly secure session set and one-time password-reset links delivered only to that address. `ADMIN_EMAIL` remains the primary review/form administration inbox. There is no public registration route or frontend storage credential.

After sign-in, an administrator can update core website details, homepage content, services, service areas, team profiles, resources, article publication state and route metadata. The portal also manages review publication, contact/care submissions, a dedicated career-applications workflow, private notes, archives, direct follow-up email, activity history and securely retained résumés. Changes are validated and stored as private Vercel Blob JSON; defaults in `src/data/` remain the version-controlled fallback.

`ADMIN_PASSWORD_HASH` is only a backwards-compatible bootstrap for the primary `ADMIN_EMAIL`. Additional allowlisted administrators initialize or change their independent password through **Forgot password?**. Removing an address from `ADMIN_EMAILS` immediately blocks its active sessions and password resets without exposing whether the address was ever authorized.

See `docs/owner-guide.md` for the owner workflow and `docs/content-management.md` for the technical content model.

## Google readiness

The site publishes `robots.txt`, a storage-aware dynamic XML sitemap, canonical URLs and LocalBusiness, Service, Article, Breadcrumb and FAQ structured data. Optional Google tools are inactive until valid public configuration values are added in Vercel:

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
- Admin portal: `https://admin.uhhomehealth.com`
- Registrar/DNS: Directnic; apex and `www` records must be preserved, and `www` redirects to the apex hostname

## Source of truth

Business facts come from `source-material/unity and hope brochure.pdf`. The official identity comes from `source-material/Logo.jpeg`, and the visual system comes from the supplied website images in `source-material/`.
