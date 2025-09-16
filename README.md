# mvyleteljr.github.io

## Blog usage

This repo now includes a minimal Jekyll blog compatible with GitHub Pages.

- Write posts in Markdown under `_posts/` using the filename format `YYYY-MM-DD-title.md`.
- Each post should have front matter at the top:

  ---
  title: My Post Title
  tldr: One-sentence summary for the index
  ---

- URLs: `/blog/title-year-month-day` (no trailing slash).
- Blog index: `/blog/` lists posts newest-first with date, title, and TLDR.

### Pinning (Welcome section)
- To keep a post at the top under the "Welcome" section on `/blog/`, add `pinned: true` to its front matter.
- Pinned posts show only in the Welcome section; they are excluded from the main Blog list below it.

### Images
- Put assets under `assets/blog/<slug>/...` (or reuse `/assets/`), then reference via absolute paths, e.g. `![Alt](/assets/blog/my-post/image.png)`.

### Video embeds
- Paste raw HTML iframes in Markdown, e.g. a YouTube embed. Jekyll passes HTML through.

### Optional excerpts
- If you omit `tldr`, the index falls back to the post excerpt (first paragraph or content before `<!--more-->`).

personal landing page 
