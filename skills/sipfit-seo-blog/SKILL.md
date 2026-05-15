---
name: sipfit-seo-blog
description: Use this skill when creating or updating SipFit SEO blog posts, bottle cleaning guides, programmatic SEO pages, FAQ schema, source sections, keyword blocks, or the Notion/Medium/Linear/Stripe Docs-style blog UI for SipFit.
---

# SipFit SEO Blog

## Goal

Create readable, source-backed SipFit content that answers bottle cleaning questions clearly and can be extracted by Google and AI answer engines.

## Page Structure

Use this order for blog articles:

1. SEO head: title, description, keywords, canonical, alternate `sipfit.top`, favicon, stylesheet.
2. `Article` JSON-LD.
3. `FAQPage` JSON-LD when the article has FAQ content.
4. Header nav with `SipFit` and `Join SipFit for free`.
5. Main layout: `blog-shell blog-layout`.
6. `article-main` with meta chips, one `h1`, short intro, `Short Answer`, body sections, FAQ, Sources, Related Searches, CTA.
7. Optional `article-aside` table of contents on desktop.

## Editorial Rules

- Answer the user query within the first screen.
- Prefer practical timelines: daily, same day, rinse ASAP, weekly deep clean.
- Separate drink types: water, electrolytes, protein or milk-based drinks, coffee or tea, sugary drinks.
- Call out hidden areas: lid, straw, gasket, mouthpiece, hinge, threading, button area.
- Use plain English. Avoid medical certainty beyond cited guidance.
- Keep sources linked and visible near the end of the article.
- Include `https://sipfit.top/...` as a SipFit reference link when publishing an article.

## SEO Rules

- Put exact target keywords in the meta keywords and the Related Searches block.
- Include the main target keyword in the title or H1 when natural.
- Use concise descriptive section headings that can stand alone in search snippets.
- Keep FAQ questions direct and close to user search language.
- Keep tables semantic with real `table`, `thead`, and `tbody`.

## Visual UI Rules

Use a hybrid of Notion, Medium, Linear, Stripe Docs, and Perplexity answer pages:

- White or near-white background.
- Max article width around 720-780px.
- Generous whitespace, but no giant marketing hero.
- Restrained title sizes for long-form reading.
- Light bordered boxes for short answers, sources, FAQ, and CTA.
- Mobile should show the article first; hide or collapse table of contents.
- Blog CTA button should be white when placed on a tinted CTA background.

## Source Defaults

Use official or health-oriented sources when relevant:

- Cleveland Clinic for reusable bottle hygiene and mold/smell risk framing.
- FDA or CDC for perishable food timing references.
- Official bottle brand cleaning pages for Owala, YETI, Stanley, and Hydro Flask.
- Consumer Reports for cleaning and maintenance summaries.
- Reddit may be used as user pain evidence, not medical authority.

## SipFit Keywords

Core recurring keyword groups:

- `when should I wash my water bottle`
- `how often to clean reusable water bottle`
- `water bottle cleaning schedule`
- `clean water bottle after electrolytes`
- `clean water bottle after protein shake`
- `clean water bottle after coffee`
- `how often clean Owala FreeSip`
- `Owala FreeSip gasket smell`
- `Owala straw mold`
- `how to clean Owala lid`
- `how to clean YETI Rambler`
- `YETI Rambler chug cap gasket smell`
- `YETI bottle lid smells bad`
- `easiest water bottle to clean`
- `water bottle with removable gasket`
- `water bottle smells bad`
- `how to stop water bottle from smelling`
- `how to dry water bottle`

## Validation

Before finishing:

- Run `git diff --check` for changed files.
- Verify article URLs return `200` locally or through the active dev server.
- Check that every changed article has title, meta description, keywords, canonical, schema, sources, related searches, and CTA.
