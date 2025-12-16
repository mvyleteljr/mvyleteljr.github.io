# Personal Website Spec

## Overview

Build a lightweight, future-proof personal website that serves as a digital garden and personal brand nexus. Prioritize simplicity, longevity, and easy style iteration over features.

**Core principles:**
- Minimal dependencies
- No JavaScript required for core functionality
- Fast loading, small footprint
- Content in Markdown for portability
- Styling via CSS custom properties for easy theming

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Static site generator** | [Eleventy (11ty)](https://www.11ty.dev/) | Zero-config, fast, extremely flexible, no framework lock-in. Markdown-native. |
| **Templating** | Plain JavaScript templates (`.11ty.js`) | Zero dependencies, just JS functions, nothing to go stale |
| **Styling** | Vanilla CSS with custom properties | Future-proof, no build step, full control |
| **Hosting** | GitHub Pages | Free, simple, already set up |
| **Content format** | Markdown with YAML frontmatter | Portable, editor-agnostic |

---

## Site Structure

```
/
├── index.html          # Home/landing (brief intro + recent posts)
├── /about              # Bio, longer narrative
├── /blog               # List of posts (paginated if needed)
│   └── /[slug]         # Individual post pages
├── /projects           # List of projects
│   └── /[slug]         # Individual project pages
├── /resume             # Page with embedded/downloadable resume
├── /links              # Optional: dedicated links/contact page
└── /now                # Optional: "now page" (current focus, reading, etc.)
```

---

## Content Models

### Blog Post (`/content/blog/*.md`)
```yaml
---
title: "Post Title"
date: 2025-01-15
tags: [tag1, tag2]
description: "Brief description for SEO/previews"
draft: false
---

Markdown content here.
```

### Project (`/content/projects/*.md`)
```yaml
---
title: "Project Name"
date: 2025-01-15
tags: [tag1, tag2]
description: "One-liner about the project"
repo: "https://github.com/username/repo"      # optional
url: "https://live-site.com"                  # optional
image: "/images/projects/project-name.png"    # optional
featured: true                                 # optional, for homepage
draft: false
---

Longer description, context, learnings, etc.
```

### Currently Reading/Listening Widget (`/content/now.json` or `_data/now.json`)
```json
{
  "reading": {
    "title": "Book Title",
    "author": "Author Name",
    "url": "https://link-to-book.com"
  },
  "listening": {
    "title": "Album or Podcast",
    "artist": "Artist Name",
    "url": "https://link.com"
  },
  "updatedAt": "2025-01-15"
}
```

---

## Design System

### Aesthetic
- **Vibe:** Warm digital garden. Playful but simple. Natural but digitally-native.
- **Colors:** Solid colors, no gradients. Warm palette (creams, soft blacks, an accent color).
- **Typography:** One font family max. Consider a humanist sans-serif or friendly serif.
- **Spacing:** Generous whitespace. Let content breathe.

### CSS Architecture

Use CSS custom properties for all themeable values. This makes future style changes trivial.

```css
:root {
  /* Colors */
  --color-bg: #faf9f7;
  --color-text: #2c2c2c;
  --color-text-muted: #6b6b6b;
  --color-accent: #e07a5f;
  --color-accent-hover: #c96a52;
  --color-border: #e0ded9;
  
  /* Typography */
  --font-body: system-ui, -apple-system, sans-serif;
  --font-mono: ui-monospace, monospace;
  --font-size-base: 1.125rem;
  --line-height: 1.6;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;
  --space-xl: 4rem;
  
  /* Layout */
  --max-width: 42rem;
  
  /* Transitions */
  --transition-fast: 150ms ease;
}
```

### Interactive Elements

**Links:** Gentle color transition on hover.
```css
a {
  color: var(--color-accent);
  text-decoration: underline;
  text-decoration-color: transparent;
  transition: text-decoration-color var(--transition-fast);
}
a:hover {
  text-decoration-color: var(--color-accent);
}
```

**Cards/list items:** Subtle lift or background shift on hover.
```css
.card {
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
```

---

## Pages Detail

### Home (`/`)
- Brief intro (2-3 sentences max)
- "Currently" widget (reading/listening)
- Recent blog posts (3-5)
- Featured projects (2-3)
- Links to socials (icons or simple text links)

### About (`/about`)
- Longer bio/narrative
- Photo (optional)
- Can include timeline or key facts if desired

### Blog (`/blog`)
- List of all posts, reverse chronological
- Each item shows: title, date, maybe tags or description
- No pagination needed initially (revisit if >50 posts)

### Projects (`/projects`)
- Grid or list of projects
- Each shows: title, description, image thumbnail (if available), links to repo/live site
- Filter by tag (optional, nice-to-have)

### Resume (`/resume`)
- Embedded PDF viewer or styled HTML version
- Clear download link to PDF

### Now (`/now`) — optional
- What you're currently focused on
- Could be manually updated or pull from `now.json`

---

## File Structure (Eleventy)

```
project-root/
├── .eleventy.js            # Config
├── package.json
├── /src
│   ├── /content
│   │   ├── /blog           # Markdown posts
│   │   └── /projects       # Markdown projects
│   ├── /_data
│   │   └── now.json        # Currently reading/listening
│   ├── /_includes
│   │   ├── base.11ty.js    # Base HTML template
│   │   ├── nav.11ty.js     # Navigation partial
│   │   └── footer.11ty.js  # Footer partial
│   ├── /css
│   │   └── style.css       # All styles (single file is fine)
│   ├── /images
│   ├── index.11ty.js       # Home
│   ├── about.11ty.js
│   ├── blog.11ty.js        # Blog listing
│   ├── projects.11ty.js    # Projects listing
│   ├── resume.11ty.js
│   └── now.11ty.js
├── /public                 # Static assets (copied as-is)
│   └── resume.pdf
└── /_site                  # Build output (gitignored)
```

---

## Build & Deploy

### Local development
```bash
npm install
npm run dev   # Starts 11ty with hot reload
```

### Build
```bash
npm run build   # Outputs to /_site
```

### Deploy
GitHub Pages via GitHub Actions. On push to `main`:
1. Run `npm run build`
2. Deploy `/_site` to GitHub Pages

Use the standard `peaceiris/actions-gh-pages` action or GitHub's built-in Pages workflow.

---

## Future Enhancements (not for v1)

- RSS feed (11ty makes this easy)
- Dark mode toggle (add alternate values in CSS custom properties)
- Search (could use Pagefind for static search)
- Webmentions
- Tag pages
- Reading time estimates

---

## Success Criteria

- [ ] Site loads in <1s on 3G
- [ ] Works fully with JavaScript disabled
- [ ] Passes Lighthouse accessibility audit
- [ ] Adding a new blog post = create markdown file, push
- [ ] Changing colors = edit 5-10 CSS variables
- [ ] Total dependencies: <10 npm packages

---

## Notes for the coding agent

- Prioritize simplicity over cleverness
- Avoid unnecessary abstraction
- Use semantic HTML (`<article>`, `<nav>`, `<main>`, etc.)
- Mobile-first CSS
- No CSS frameworks, no Tailwind, no Sass—just vanilla CSS
- No templating libraries—use Eleventy's plain JS templates (`.11ty.js` files with template literal strings)
- Test without JavaScript enabled
- Keep the `package.json` minimal

### JS Template Example

```js
// _includes/base.11ty.js
module.exports = function(data) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title || 'Site Title'}</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <nav>...</nav>
  <main>
    ${data.content}
  </main>
  <footer>...</footer>
</body>
</html>`;
};
```
