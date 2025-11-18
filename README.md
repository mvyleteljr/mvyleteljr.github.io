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

## Local development

1. Make sure Ruby and Bundler are installed, then install the dependencies listed in `Gemfile` (this pulls the `github-pages` gem that GitHub itself uses):

   ```bash
   gem install bundler          # requires network access
   bundle install
   ```

2. Run a local preview server from the project root:

   ```bash
   bundle exec jekyll serve --livereload
   ```

3. Visit `http://127.0.0.1:4000` (or the host/port printed in the console). Press `Ctrl+C` to stop the server.

If the CLI sandbox blocks outbound network access, the `gem install`/`bundle install` step will appear to hang—rerun with network permissions or install the gems outside the sandbox before serving locally.
