## Belief Map - Implementation Plan

### Concept

A belief map is a public, evolving record of my positions on topics I find important. Each belief is displayed as a card showing my current thesis and confidence level. Cards link to individual pages where I maintain a running log of my reasoning, evidence, and how my thinking has changed over time.

The goal is epistemic transparency - showing not just *what* I believe but *why*, and tracking how my views evolve as I encounter new information.

---

### Card Display (Main Page)

Each card should show at a glance:
- **Topic** (e.g., "Alignment Risk")
- **Thesis** - one sentence summary of my position
- **Confidence** - percentage, ideally with some visual treatment (a bar, color gradient, or similar)
- **Last updated** date

Cards should be scannable. Someone landing on the page should be able to quickly see "here are 20 things this person has opinions on and how sure they are."

Clicking a card opens the full belief page.

---

### Individual Belief Pages (Markdown-driven)

Each topic gets its own markdown file. The file contains:

```
---
topic: Alignment Risk
thesis: It is impossible to create an aligned superintelligence
confidence: 40
lastUpdated: 2025-01-15
---

## Confidence Reasoning
I am persuaded by the arguments about goal embeddings related to chess engines, but I feel conversation around goals is hand-wavey...

## Key Points
1. SI will ruthlessly seek to optimize a goal...
2. Seemingly "aligned" sub-SI models already create an unclear balance...
3. Even if we did understand SI goals...

## Sources
- [Link to paper]
- [Link to blog post]

## Changelog
**2025-01-15**: Initial entry at 40%
**2025-01-22**: Revised reasoning after reading [X], confidence unchanged
```

The frontmatter (topic, thesis, confidence, lastUpdated) gets pulled into the card display. The body is rendered as the full page.

---

### Update Workflow

Weekly updates mean editing the markdown file directly:
- Adjust confidence percentage in frontmatter
- Add a changelog entry explaining what changed and why
- Revise key points or reasoning as needed

The changelog section creates a built-in history of epistemic evolution.

---

### Visual/UX Notes

- Confidence deserves visual weight - consider a subtle color scale or progress bar so visitors can quickly spot high vs. low confidence items
- Cards might benefit from loose categorization (AI, Politics, Philosophy, etc.) but this could be a v2 feature
- The page should feel like a living document, not a static manifesto - emphasizing the "last updated" dates helps convey this
