# Marshall Vyletel Jr.

A small Jekyll site with a shared Notebook theme: Optima, a pure white background with black text and rules, thin rules, and space for margin notes. No framework, web font, or bundler is required.

## Pages

- `index.html`: homepage and biography.
- `writing.html`: writing index, with existing categories and summaries.
- `photos.html`: photographs at their original proportions.
- `notebook.html`: fixed map, contents list, and selected note in the margin.
- `links.html`: original interests stream, kept at its existing URL.
- `_posts/`: Markdown posts, with their existing URLs.
- `_notebook/`: Markdown notebook entries, each with its own URL.
- `style.css`: shared site styles and responsive layouts.
- `_layouts/default.html`: shared navigation, document head, and footer.
- `notebook.js`: note selection and URL fragments. Without JavaScript, node links open the individual note pages.
- `design-studies/`: earlier visual studies and font comparisons.

## Edit a notebook entry

Add a Markdown file to `_notebook/`:

```yaml
---
layout: note
title: A thought
section: notebook
key: a-thought
order: 11
x: 250
y: 350
---

Write the note here in Markdown.
```

The key must be unique and match the filename. The coordinates set its fixed place in the 660 by 760 map. Update the map dimensions if the collection needs more space. The current connections in `notebook.html` document the four Cooper Hewitt quotes and their source. They are authored explicitly, not inferred automatically.

## Edit writing and photos

Posts use `_posts/YYYY-MM-DD-slug.md` with `title` and optional `tldr` front matter. Add the published post to `writing.html`. Five legacy index entries have no published file; their titles and summaries remain visible with a text-unavailable label.

Add photos to `img/` and a link plus image to `photos.html`. Use `scripts/resize-photos.sh` if needed. Give each image link an accessible name.

## Margin notes

In a Markdown post, add an HTML aside beside the relevant paragraph:

```html
<aside class="sidenote" id="note-one">1. A related thought or source.</aside>
```

Link to it with `[1](#note-one)`. The aside appears in the margin on wide screens and in the text flow on narrower screens. Use `<mark>text</mark>` for a restrained highlight.

## Local preview

```sh
bundle exec jekyll serve
```

Open `http://127.0.0.1:4000/`. The current review server is at `http://127.0.0.1:4175/`.

Jekyll renders Markdown at build time. Only Notebook needs local interaction code. Posts keep the existing MathJax loader. Drafts remain excluded from the build. Nothing in this refresh has been published.

## Local font comparison

The optional `font_preview: true` Jekyll setting adds a serif selector to the shared layout. It is off in the normal site configuration. The selected site font is Optima. The current preview uses the normal configuration, with both selectors hidden. The choice stays in the browser tab session as you navigate. It does not change the saved site font.

Optima uses its installed regular, italic, bold, and bold italic faces. Devices without Optima fall back to Candara, Segoe UI, or their default sans-serif. Font files are not bundled. Markdown emphasis (`*italic*`, `**bold**`, and `***bold italic***`) keeps its normal formatting.

## Notebook visibility

Notebook is on hold. Its page, script, and design studies are excluded from site output, and the notebook collection has `output: false`. The Markdown files remain in the repository. Notebook links are removed from navigation and the homepage.

## Open Manifesto

Edit `manifesto.md`. Ordinary Markdown works throughout. To pair a passage with a margin box, capture the passage and note, then include `margin.html`:

```liquid
{% capture passage %}
Your paragraph with an <a class="margin-highlight" href="#note-one">annotated phrase</a>.
{% endcapture %}

{% capture note %}
Your context, **emphasis**, or [source](https://example.com).
{% endcapture %}

{% include margin.html passage=passage note=note id="note-one" %}
```

Use a unique ID for each box. Use `<u>text</u>` for an underline without a note. Boxes align beside their passages on wide screens and follow them on phones. Clicking a highlighted phrase moves to its box. This is authored in Markdown, with no visitor editing, storage service, or new JavaScript. The page starts with one clearly marked formatting example to replace.

Add `side="left"` to a `margin.html` include for a left margin box. The default is right. Both sides keep the text in the same centered column. A thin line connects the highlighted phrase to its box and updates when text wraps. Below 1150 px, boxes follow the passage and the line is hidden to avoid crossing the text.

## Write margin notes in the browser

Run `python3 scripts/manifesto-editor.py`, then open `http://127.0.0.1:4176/manifesto.html`.

1. Turn on **Edit mode**.
2. Select text within one paragraph and click **Add margin note**.
3. Write the note in Markdown, choose left or right, and click **Save**. Select note text and press **Cmd+K** (or **Ctrl+K**) to insert a link. The preview shows clickable links. Pasted web addresses also become links in saved notes.
4. To change or remove a saved note, turn on Edit mode and click **Edit note** in its box.

The first version supports one note per paragraph, not selections across paragraphs or inside lists. The main essay is still edited in `manifesto.md`. Notes are saved in its `marginalia` front matter; the essay body is preserved. If the source file changed since the page loaded, saving stops and asks you to reload. If you later rewrite an annotated paragraph, its saved text anchor must be updated before that note can appear again.

Saving rebuilds the local site. The editor uses a separate temporary build folder. The Open Manifesto page shows an **Edit mode** button on localhost, including the normal Jekyll preview. This button opens the local editor, which must be running. Published pages show saved notes and links without edit controls or write endpoints. Commit `manifesto.md` with the other site files and push when ready to publish.
