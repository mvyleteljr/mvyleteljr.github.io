# Design review

Three working studies use the same seven sample thoughts and seven connections. These are layout studies, with illustrative text, rather than statements attributed to Marshall.

## 01 / Reading

The narrower page and smaller title suit the existing site. The writing feels calm, and the selected thought has a clear border. Plain, unboxed labels reduce visual weight.

The cost is space. The map and margin have less room, and plain labels make selection less obvious than in Atlas. This is the best reference for the writing pages, but not my first choice for a larger graph.

## 02 / Atlas

This is my recommended starting point. The wide map and outlined nodes make the relationship between map and reading area clear. A black selected node is easy to locate. The main text and margin have distinct roles.

The first version had too much space above the map. I reduced the top and bottom padding of the introduction after visual review. The result still feels formal; the title could become smaller in a later round if it competes with the thoughts.

## 03 / Notebook

The contents list makes it easy to return to a known thought. Upright Times New Roman and a slightly warm page give it the feel of a working document. The list and graph share selection state.

The extra column competes with the map. It disappears at narrower widths. This variation is most useful if readers often know which note they want. The first version also had label backgrounds that did not match the page; I corrected the page background after review.

## Shared revisions

- Darkened graph lines after the first screenshot review.
- Added a visible phone hint for scrolling the fixed map.
- Limited the phone map viewport height, keeping text at its full size and preserving positions.
- Added a phone link back to the map beside the selected note.
- Kept all labels, controls, and prose in serif type.

## Reusable parts

`studies.css` holds shared colors, typography, page spacing, prose, margin notes, node labels, connection labels, focus states, and three small sets of layout overrides.

`_layouts/design-study.html` holds the shared page, graph, note templates, and writing specimen. `_includes/design-study/*.md` holds the seven thought samples. Jekyll renders them with its existing `markdownify` filter. `studies.js` selects the rendered templates; it does not parse Markdown in the browser.

No framework, graph package, web font, or build dependency was added. Existing public pages and their styles are unchanged. The prototypes are not linked from the homepage, and contain a noindex directive. They will be included if the repository is later published.

## Scope

The graph is a small authored map with fixed coordinates. Select a node or a connection label with a pointer or keyboard. The margin-note sample uses a normal anchor and a responsive side column. Authoring tools, automatic layout, search, deep links to thoughts, and a large content collection are outside this design study.

## Local preview

Run `bundle exec jekyll serve` from the repository, then open `/design-studies/` on that server. The current review server uses `http://127.0.0.1:4173/design-studies/` and serves a build in `/private/tmp/mv-design-preview`.

## Validation

Jekyll built the site successfully. The JavaScript syntax check passed. Browser review covered all three desktop layouts, a 390 px phone viewport, node selection, keyboard connection selection, and the revised phone reading area. Node positions stayed unchanged relative to the map when the selection changed. All three phone pages stayed within the viewport; scrolling is contained within the map.

## Notebook type revision

After the user selected Notebook, they asked for a sharper font. Changed its type from Georgia to Times New Roman. Set the main title, graph labels, map heading, and note titles upright. Reduced the tight title letter spacing to suit Times. Italics remain for prose emphasis and small annotations. No font download is required.
