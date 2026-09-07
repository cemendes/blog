# Blog Clean Engineering Minimalist Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Eduardo Oliveira's technical blog (`blog.favela.sh`) into a clean engineering minimalist aesthetic by removing placeholder graphics, fixing the clipped ASCII comparison matrix with a responsive table, widening the layout to 840px, and adding an author byline with Google Cloud CE credentials.

**Architecture:** Update Astro global stylesheet (`src/styles/global.css`), overhaul the article layout (`src/layouts/BlogPost.astro`), and convert raw ASCII text in `anthropic-certifications-7-day-journey.md` into a semantic GitHub-Flavored Markdown table with callout styling.

**Tech Stack:** Astro 7.x, Markdown/MDX, CSS3, Cloudflare Pages / GitHub Pages CI/CD.

## Global Constraints
- Do not introduce heavy CSS frameworks or external runtime dependencies.
- Maintain 100% static generation compatibility (`output: "static"`).
- Preserve all existing links, Credly URLs, and article markdown structure.

---

### Task 1: Global Typography, Container Geometry & Table Styling

**Files:**
- Modify: `src/styles/global.css`

**Interfaces:**
- Produces: Responsive table rules (`table`, `th`, `td`), callout blockquotes (`blockquote`), expanded `.prose` and `main` container width (`840px`).

- [ ] **Step 1: Update main container and prose width to 840px**
Update `main` width in `src/styles/global.css` from `720px` to `840px` and set line-height to `1.75`.

- [ ] **Step 2: Add responsive table styling**
Add CSS rules for `table`, `th`, `td`, `tbody tr:nth-child(even)` to render subtle borders (`#e2e8f0`), padding (`10px 14px`), and shaded header row (`#f8fafc`).

- [ ] **Step 3: Add callout styling for blockquotes**
Add CSS rules for `blockquote` with `border-left: 4px solid var(--accent)`, background padding, and rounded right corners.

- [ ] **Step 4: Verify syntax and build locally**
Run: `npm run build`
Expected: Build passes with 0 errors.

- [ ] **Step 5: Commit changes**
```bash
git add src/styles/global.css
git commit -m "style(css): widen container to 840px and add table and callout styling"
```

---

### Task 2: Overhaul Article Layout & Author Byline

**Files:**
- Modify: `src/layouts/BlogPost.astro`

**Interfaces:**
- Consumes: Frontmatter (`title`, `pubDate`, `description`).
- Produces: Left-aligned clean header, author byline pill (*Eduardo Oliveira · Senior Customer Engineer @ Google Cloud*), reading time, and topic badges without the hero image banner.

- [ ] **Step 1: Remove hero image rendering**
Remove `<div class="hero-image">{heroImage && <Image ... />}</div>` from `src/layouts/BlogPost.astro`.

- [ ] **Step 2: Implement left-aligned title and author byline**
Restructure the `.title` header section:
- Left-aligned `h1`
- Author badge: **Eduardo Oliveira** · *Senior Customer Engineer @ Google Cloud*
- Meta row: Published date, `8 min read`
- Topic tags: `Enterprise AI` · `Anthropic` · `Google Cloud` · `Architecture`

- [ ] **Step 3: Update BlogPost layout styles**
Set `.prose` width to 100%, remove awkward center-alignment, and format metadata pills with clean badge styling.

- [ ] **Step 4: Verify build**
Run: `npm run build`
Expected: Build passes cleanly.

- [ ] **Step 5: Commit changes**
```bash
git add src/layouts/BlogPost.astro
git commit -m "feat(layout): redesign BlogPost with left-aligned title, author byline, and no hero banner"
```

---

### Task 3: Refactor Article Content & Comparison Matrix

**Files:**
- Modify: `src/content/blog/anthropic-certifications-7-day-journey.md`

**Interfaces:**
- Produces: Clean Markdown table replacing the ASCII box and formatted callout note.

- [ ] **Step 1: Remove heroImage frontmatter**
Remove `heroImage` from the frontmatter header.

- [ ] **Step 2: Replace ASCII matrix with semantic Markdown table**
Replace the ASCII `┌───┐` box with:
```markdown
| Exam Track | Level | Questions | Time Allowed | Time Used | Pacing Feel |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **1. CCAO-F Associate** | Level 100 | 60 Questions | 120 Minutes | ~60 Minutes | Relaxed |
| **2. CCAR-F Arch Fnd** | Level 200 | 60 Questions | 120 Minutes | ~118 Minutes | Tight |
| **3. CCDV-F Developer** | Level 250 | 53 Questions | 120 Minutes | ~90 Minutes | Moderate |
| **4. CCAR-P Arch Prof** | Level 400 | 63 Questions | 120 Minutes | ~104 Minutes | Tight |
```

- [ ] **Step 3: Format the Technical Levels note as a callout**
Ensure the `> **Note on Technical Levels**: ...` is clean without broken strikethrough markdown.

- [ ] **Step 4: Verify build**
Run: `npm run build`
Expected: Build passes with 5 static pages generated.

- [ ] **Step 5: Commit changes**
```bash
git add src/content/blog/anthropic-certifications-7-day-journey.md
git commit -m "content(article): convert ASCII matrix to responsive table and remove heroImage"
```

---

### Task 4: Local Verification & Production Deployment

**Files:**
- All modified files

- [ ] **Step 1: Run full static build**
Run: `npm run build`
Expected: 0 warnings, all routes generated in `dist/`.

- [ ] **Step 2: Push to GitHub**
Run: `git push origin main`
Expected: Remote branch `main` updated.

- [ ] **Step 3: Verify GitHub Pages CI/CD**
Run: `gh run list --limit 1` and `gh run watch`
Expected: Workflow passes with green status.

- [ ] **Step 4: Verify Live Production Site**
Curl `https://blog.favela.sh/blog/anthropic-certifications-7-day-journey/` and inspect rendered HTML.
