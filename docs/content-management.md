# Unity & Hope Content Management Handoff

The production site keeps routine content in a small set of readable configuration files. This gives the owner a safer editing workflow now without adding an insecure public dashboard or storing care inquiries in a new database.

## What can be updated

| Content | File | Notes |
| --- | --- | --- |
| Phone, email, address, hours, external profiles | `src/config/siteConfig.js` | Keep the production URL unchanged unless the domain changes. |
| Homepage message, CTAs, process, FAQ | `src/data/content.js` | Keep claims non-medical and factual. |
| Services | `src/data/services.js` | Each entry automatically powers cards, navigation and its detail page. |
| Service region | `src/data/serviceAreas.js` | Publish named cities only after the client confirms they are served. |
| Reviews | Private Vercel Blob records | Visitors submit at `/reviews`; only reviews approved through the client email workflow appear publicly. Never create or publish invented reviews. |
| Team | `src/data/team.js` | The section is hidden until approved profiles and photos exist. |
| Resources | `src/data/resources.js` | Optional `author`, `publishedDate`, `source`, `seoTitle` and `seoDescription` fields display only when supplied. |
| Core SEO | `src/data/seo.js` | Keep every title and description unique and natural. |

## Safe publishing workflow

1. Edit only approved facts and media.
2. Run `npm run lint`, `npm test` and `npm run build`.
3. Review the changed page on mobile, tablet and desktop.
4. Commit and push the reviewed change to `main`.
5. Wait for the existing Vercel project to deploy, then verify the live route.

## Inquiries and résumés

Contact, care-request and career submissions are delivered to the configured business inbox. Résumés are validated and attached to the business email but are not permanently stored by this website.

## Review moderation

Review submissions are stored privately and begin with a `pending` status. The client inbox receives an approval email with separate Approve and Decline links. Each link requires a confirmation step, expires after 30 days and can be used only once. Approved reviews appear automatically; declined reviews remain private. No database or moderation credentials are exposed in frontend code.

## Client data still needed

- A verified Google review link, if the client wants an additional external review option
- Approved team names, roles, biographies and photos
- An approved vision statement and founder story
- Any licensing, certification, insurance or affiliation details the client wants published
- Confirmed city-level service areas
- Google Analytics measurement ID, Search Console verification token and Google Business Profile URL

Until those items are supplied, the production site hides corresponding empty sections and does not create team or credential claims. The review section also stays hidden until a real submitted review is approved.
