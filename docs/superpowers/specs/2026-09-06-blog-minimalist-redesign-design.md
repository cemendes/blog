# Design Document: Blog Clean Engineering Minimalist Redesign

**Date**: 2026-09-06  
**Status**: Approved  
**Target Repository**: `cemendes/blog` (`blog.favela.sh`)  
**Author**: Eduardo Oliveira & Antigravity  

---

## 1. Objective

Upgrade the visual presentation and readability of Eduardo Oliveira's technical blog (`blog.favela.sh`) from the basic default Astro template to a sleek, modern **Clean Engineering Minimalist** publication inspired by premier developer blogs (e.g. Stripe Engineering, Tailwind CSS, GitHub Blog).

---

## 2. Key Deficiencies in Baseline

1. **Intrusive Placeholder Hero Graphic**: The default Astro logo banner (*"Build the web you want"*) is oversized and irrelevant to production enterprise architecture articles.
2. **Clipped ASCII Matrix**: The exam comparison matrix was embedded in an ASCII fixed-width code block (`┌───┐`) which overflows horizontally on standard viewports and gets cut off.
3. **Awkward Header Hierarchy**: Title centering and default typography lacks author context, reading time, and enterprise branding.
4. **Constrained Reading Column**: The default `720px` width squeezes technical comparison tables and multi-column matrices.

---

## 3. Approved Design Specification

### 3.1 Article Header & Metadata Layout (`src/layouts/BlogPost.astro`)
* **Hero Image**: Completely eliminated from the article view to immediately prioritize title and technical reading.
* **Title Alignment**: Left-aligned, high-contrast sans-serif `h1` (`clamp(2rem, 3.5vw, 2.75rem)`).
* **Author Byline Component**:
  * Name: **Eduardo Oliveira**
  * Subtitle: *Senior Customer Engineer @ Google Cloud*
  * Meta: Publication date, reading time calculation (approx. 8 min read)
  * Topic Badges: `Enterprise AI`, `Anthropic`, `Google Cloud`, `Architecture`

### 3.2 Table & Callout Typography (`src/styles/global.css`)
* **Semantic Tables**:
  * Width: 100% with automatic responsive horizontal scroll wrapper.
  * Border: Subtle light border (`1px solid #e2e8f0` / dark: `#334155`).
  * Header: Distinct background shading (`#f8fafc` / dark: `#1e293b`) with bold typography.
  * Padding: Generous cell padding (`10px 14px`) and vertical alignment.
* **Blockquote / Callout Boxes**:
  * Styled with a 4px accent left border (`var(--accent)`).
  * Light background tint (`rgba(var(--accent-rgb), 0.05)`).
  * Rounded corners (`6px`) with crisp italicized or bold lead-ins.
* **Reading Column Geometry**:
  * Expanded main container width from `720px` to **`840px`** for desktop viewports.
  * Line-height set to `1.75` for high-comfort long-form readability.

### 3.3 Content Refinement (`src/content/blog/anthropic-certifications-7-day-journey.md`)
* Convert the raw ASCII `┌───┐` comparison box into a semantic GitHub-Flavored Markdown table:
  * Columns: `Exam Track`, `Level (100–400)`, `Questions`, `Time Allowed`, `Time Used`, `Pacing Feel`.
* Format the *"Note on Technical Levels"* as a styled Markdown callout.

---

## 4. Verification Plan

1. **Local Build & Render**: Run `npm run build` to ensure static generation passes without warnings.
2. **Visual Inspection**: Test desktop and mobile viewport rendering via `npm run preview` or curl/browser.
3. **Deployment**: Push to `main` and verify automated GitHub Pages deployment updates `https://blog.favela.sh`.
