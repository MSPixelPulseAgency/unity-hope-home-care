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
CONTACT_TO_EMAIL=mspixelpulse@gmail.com
ALLOWED_ORIGIN=https://unityhope.vercel.app
```

Never expose the Gmail app password through a `VITE_` variable or commit it to Git. If delivery is not configured, the endpoint returns an honest message directing visitors to call or email.

### Client inbox handoff

To route future form notifications to the client, change only `CONTACT_TO_EMAIL` in Vercel Production and redeploy. `GMAIL_USER` remains the authenticated sender unless the client later provides a different approved SMTP account.

## Deployment

- Framework: Vite
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`
- Production target: `https://unityhope.vercel.app`

## Source of truth

Business facts come from `source-material/unity and hope brochure.pdf`. The official identity comes from `source-material/Logo.jpeg`, and the visual system comes from the supplied website images in `source-material/`.
