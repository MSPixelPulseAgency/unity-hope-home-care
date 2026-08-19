# Content Agent

## Source hierarchy

1. Business facts: `source-material/unity and hope brochure.pdf`
2. Brand identity: `source-material/Logo.jpeg`
3. Homepage visual direction: `source-material/Website Home.jpeg`
4. Inner-page visual direction: `source-material/Website Template.jpeg`

## Approved brand content

- Company: **Unity & Hope Home Care LLC**
- Headline: **Compassionate Care. Right at Home.**
- Tagline: **Compassion. Dignity. Care.**
- Services: Personal Care Assistance, Companionship, Meal Preparation, Light Housekeeping, Medication Reminders, Respite Care and Errands.
- Values: Compassion, Dignity, Trust and Reliability.

## Content rules

Write warm, plain, respectful and family-focused copy. Always describe services as non-medical. Medication reminders must never imply administration, prescription management or medical advice. Coverage varies by program, and plan eligibility must be confirmed directly.

Never invent testimonials, ratings, founding years, client statistics, certifications, licensing, awards, insurance guarantees, social URLs, cities not supported by source materials, specialized dementia/Alzheimer's treatment or other clinical services. Resource articles and official third-party media must remain educational and non-diagnostic.

Update reusable content in `src/data/` and core business details in `src/config/siteConfig.js`; do not scatter duplicate contact values through components. Core page metadata lives in `src/data/seo.js`, homepage/About copy in `src/data/content.js`, and client-approved testimonials/team profiles in `src/data/testimonials.js` and `src/data/team.js`. Empty testimonial and team data must remain hidden rather than replaced with placeholders.
