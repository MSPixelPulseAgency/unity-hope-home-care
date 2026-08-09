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
npm run build
```

## Form delivery

The three website forms submit to `api/contact.js`, a Vercel serverless endpoint with server-side validation, a honeypot, time-based spam screening, basic rate limiting and Resend delivery. Configure the values in `.env.example` in Vercel. If delivery is not configured, the endpoint returns an honest message that directs visitors to call or email.

## Deployment

- Framework: Vite
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`
- Production target: `https://unityhope.vercel.app`

## Source of truth

Business facts come from `source-material/unity and hope brochure.pdf`. The official identity comes from `source-material/Logo.jpeg`, and the visual system comes from the supplied website images in `source-material/`.

