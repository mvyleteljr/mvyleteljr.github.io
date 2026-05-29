# mvyleteljr.github.io

Dead-simple personal site. The front-end is plain HTML + one CSS file, no JS.
Blog posts are still rendered by Jekyll (free on GitHub Pages) so they can stay in Markdown.

## Files
- `index.html` — homepage (photo + short bio + links).
- `writing.html` — hand-maintained list of posts, grouped by category, linking to `/blog/…` URLs.
- `photos.html` — photo archive, grouped by category, as a grid.
- `links.html` — free-form curated links, grouped by category.
- `style.css` — all styling. Shared by every page, including rendered posts.
- `avatar.jpg` — homepage photo. `img/` — photos.
- `_posts/` — Markdown blog posts. `_layouts/` — the post/default templates.

## How to edit
- **Add a piece of writing:** write the post in `_posts/` as `YYYY-MM-DD-slug.md` with front matter (`title`, `tldr`). It publishes at `/blog/slug-YYYY-MM-DD`. Then add one `<li>` to `writing.html` under the right `<div class="cat">`: `<li><span class="date">YYYY-MM-DD</span><a href="/blog/slug-YYYY-MM-DD">Title</a></li>`.
- **Add a photo:** drop the file in `img/`, add `<a href="img/NAME.jpg"><img src="img/NAME.jpg" alt=""></a>` to `photos.html` under a category.
- **Add a link:** add one `<li>` to `links.html`. Categories are just `<div class="cat">` headers — make up new ones at will.
- **Change the bio:** edit the `<p>` tags in `index.html`.

Categories are freeform: a category exists if there's a `cat` header above a list.

## Constraints (keep it this way)
- No frameworks, no web fonts, no bundler, no client-side JS on the static pages. One CSS file.
- The four top-level pages are plain HTML — edit them directly.
- Keep the single centered column. Don't add heroes, animations, or decoration.

## Local preview
```bash
bundle install
bundle exec jekyll serve
```
Visit `http://127.0.0.1:4000`.
