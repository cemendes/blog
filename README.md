# Eduardo Oliveira's Technical Blog (`blog.favela.sh`)

Personal technical blog focused on enterprise generative AI architectures, multi-model systems, autonomous agents, and homelab engineering.

Built with [Astro](https://astro.build/) and deployed on [Cloudflare Pages](https://pages.cloudflare.com/).

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Build for production (output in ./dist)
npm run build

# Preview production build locally
npm run preview
```

---

## 📝 Writing a New Blog Post

Create a new Markdown or MDX file inside `src/content/blog/`:

```markdown
---
title: 'My New Technical Post'
description: 'Concise summary of the architectural insights and takeaways.'
pubDate: 'Sep 10 2026'
heroImage: '../../assets/blog-placeholder-1.jpg'
---

Your content in Markdown here...
```

---

## 🌐 Deployment (Cloudflare Pages)

The blog is deployed continuously via Cloudflare Pages:
* **Framework Preset**: `Astro`
* **Build Command**: `npm run build`
* **Build Output Directory**: `dist`
* **Production Branch**: `main`
* **Custom Domain**: `blog.favela.sh`

