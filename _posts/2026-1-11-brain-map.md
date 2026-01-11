---
title: Brain Map Experiment
tldr: claude code is my new EA
layout: post
pinned: false
---
I want to build a map of my mind. I'm using Claude Code to build one. 

The idea is simple. Minds are non-linear and unstructured. Trying to create structure for one's own mind is extremely difficult, but structure reveals patterns. Patterns are necessary for learning. 

I'm also weary of back-and-forth interactions with AIs. Most thoughts are not *conversational* thoughts and I'm sensitive to AI speech patterns. This is to be expected. We change tone and language and distort truth to communicate effectively. This is compression and it loses information. It's not necessary if the goal is self-communication. 

I figure that if I had space to exhaust the contents of my mind as precisely as possible in unstructured language, I could use AI to reveal structure without having to talk to it or get its "take" on things. 
## Ramble-Log

I created an Obsidian Vault with the following structure:

```text
ramble-log/ 
	├── _inbox.md
	├── CLAUDE.md 
	├── _claude_analysis.md  
	└── things/ 
		├── _categories.md 
		├── _ramble-archive.md 
		└── [your category files].md
	└── _dev/ 
		└── roadmap.md 

```

The CLAUDE.md file:

```markdown
# Ramble Log Vault

This is a personal logging vault. When I say "process" or "process inbox", use the `ramble-log` skill to:

1. Read `_inbox.md`
2. Parse and route content to category files in `things/`
3. Archive the raw ramble
4. Clear the inbox

Don't ask for confirmation — just do it and show me what you updated.

Notes:
1. If you notice interesting things about me or my mind, you can append your own logs to \_claude_analysis.md

## Analysis

When I say "analyze" I want you to read through my brain map and surface insights into your \_claude_analysis.md file. I want you to also pay close attention to things that would progress my growth and success. 

Be completely candid. I don't want you to be "comfortable" because it's boring. I want truth and the full powers of your intelligence to help me live a prosperous existence.
```

The Skill directory contains reference material, examples, and a SKILL.md file that explains how to do things. 

I probably don't need a Skill to do this, but I want to expand its capabilities in the future and figured it's good practice to start gaining familiarity with how they work. 

### The Process

1. Ramble into \_inbox.md
	1. Or copy the transcription from a voice memo synced with iCloud
2. Open CC in the vault
3. "process"
4. "analyze" (Optional)

CC parses information from the ramble and categorizes my thoughts to track development. Each category has the following information:

```markdown
---
last_updated: YYYY-MM-DD
focus: [current goal or area of exploration]
action: [single concrete next step]
---

# [Category Name]

## Log

YYYY-MM-DD: [Synthesized entry in natural language. Not raw dumps — distill the substance.]
```

Claude also has full power to create data structures where they are useful. For example, it's built a table for tracking the scents I've been compelled by recently, which is nice. 
## So Far...

It's working extremely well, and the analysis tool is also really powerful. I find the analysis to be much richer this way than the self-analysis you get from a typical chat-bot product. A long conversation might have to happen to get to an accurate brain map in the first place, and it's too interspersed with analysis.

There are four development trajectories that I'm working on:
1. Multi-media Tracking
	1. How do I extend this to efficiently handle various digital media?
2. Internet Information
	1. How do I pipe information from the internet in with the lowest possible friction?
3. Analysis
	1. What type of analysis is the best? Could I have it use psychoanalytic techniques or others?
	2. `analyze psychoanalysis` to get a specific analysis through a specific lens, for example
4. Visualization
	1. What's the best way to view the brain map? Is there strong visual language that I can use for a higher-fidelity mirror?

The general development roadmap is to just ruthlessly lower friction as much as possible. I want the cleanest possible channel from mind to record, and the best possible mirror for querying the record.  