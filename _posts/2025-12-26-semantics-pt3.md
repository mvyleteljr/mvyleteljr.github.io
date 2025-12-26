---
title: Semantics Pt. 3
tldr: Semantic Differentials and a mini-experiment
layout: post
pinned: false
---
## Introduction

This is part 3 of my new series on *LLM Semantics*.
* [Part 1](https://mvyleteljr.github.io/blog/semantics-2025-12-17)
* [Part 2](https://mvyleteljr.github.io/blog/embeddings-2025-12-20)  

Today, I had a conversation with Claude and found a nice precedent for this work in Osgood's [Semantic Differential](https://en.wikipedia.org/wiki/Semantic_differential).

> The **semantic differential** (**SD**) is a measurement scale designed to measure a person's subjective perception of, and affective reactions to, the properties of concepts, objects, and events by making use of a set of bipolar scales.

Turns out this is pretty much exactly what I was hoping to achieve in our token injection work at concordance with my notion of "Semantic Axes". For an initial experiment, I'm using Osgood's factors of Evaluation (good vs. bad), Potency (strong vs. weak), and Activity (active vs. passive), mostly because in my previous post I came up with "Light vs. Heavy" and "Inert vs. Active" as potential candidates for "semantic antipodes" that could help us steer LLM generation. 

The Wikipedia article for Osgood's SD is horrible, but from what I can gather, the goal is more to precisely map reactions to *concepts*, not necessarily reactions to meta-linguistic elements like I'm exploring here, but it's a nice framing anyway. Here's a bit more context:

> The SD is used to assess one's [opinions](https://en.wikipedia.org/wiki/Opinion "Opinion"), [attitudes](https://en.wikipedia.org/wiki/Attitude_\(psychology\) "Attitude (psychology)"), and [values](https://en.wikipedia.org/wiki/Value_\(ethics\) "Value (ethics)") regarding these concepts, objects, and events in a controlled and valid way. Respondents are asked to choose where their position lies, on a set of scales with polar adjectives (for example: "sweet - bitter", "fair - unfair", "warm - cold").

## Experiment Outline

### Step 1: Potential Poles

For each factor in my SD, I've come up with a proposed set of meta-linguistic antipodes that correspond roughly to Osgood's factor definitions. I've had to manipulate the meaning of each  factor slightly so that I can encode them into language itself. 

Remember, the goal here is LLM steering, so we need to turn something like "good vs. bad" into a phrase that could make sense in an LLM generation stream. Here's what I've come up with after a nice back-and-forth with Claude:

**Evaluation**:
- "Fortunately" ↔ "Unfortunately"
- "Impressively," ↔ "Disappointingly,"
**Potency** (force/weight of commitment):
- "Undeniably" ↔ "Arguably"
- "It is clear that" ↔ "It seems that"
**Activity** (momentum/movement):
- "Diving in," ↔ "Pausing to consider,"
- "Let's move to" ↔ "Let's sit with"

### Step 2: Embed the Phrases

Mostly as a gut-check, and because I'm curious, I am going to embed each of the phrases with two goals in mind:
1. Measure Cosine Similarity: Are the phrases I've chosen for actually poles?
	1. Goal: **Low Values**
2. Measure Factor Orthogonality: Are factors actually different enough?
	1. Goal: **Low Values**

Here's the script that I'm using to answer each of these questions:

![Feature Tree concept sketch](/assets/images/carbon_clip.png)

### Results

```text
=== Antipode Similarities ===

evaluation: 'Fortunately' ↔ 'Unfortunately' = 0.7325
evaluation: 'Impressively,' ↔ 'Disappointingly,' = 0.6655
evaluation (averaged): 0.7630

potency: 'Undeniably' ↔ 'Arguably' = 0.6426
potency: 'It is clear that' ↔ 'It seems that' = 0.6865
potency (averaged): 0.7496

activity: 'Diving in,' ↔ 'Pausing to consider,' = 0.5354
activity: 'Let's move to' ↔ 'Let's sit with' = 0.6105
activity (averaged): 0.7055

=== Axis Orthogonality ===

evaluation ↔ potency: 0.1039
evaluation ↔ activity: 0.0704
potency ↔ activity: 0.0281
```

Good news: Axis orthogonality is really low, which means it's likely we picked good factor differentiation.

Bad news: The poles are pretty similar, which means they're similar conceptually in this embedding space. 

I guess embedding models tend to cluster words by _function_ and _context_, not polarity. "Fortunately" and "Unfortunately" appear in similar syntactic positions, so they're neighbors despite being semantic opposites, so that's probably fine. 

For the experiment, I'm going to select the phrases that had the least cosine similarity in each factor because I want to scope it a bit tighter. My guess is that lower similarity = better chance that the direction vector encodes real polarity. Here are the selected phrases:

**Evaluation**:
- "Impressively," ↔ "Disappointingly,"
**Potency** (force/weight of commitment):
- "Undeniably" ↔ "Arguably"
**Activity** (momentum/movement):
- "Diving in," ↔ "Pausing to consider,"
### Step 3: Steerable Questions

Next step is to come up with a set of steerable questions that would allow me to inject the antipodes and observe how well they steer towards their expected polarities.

For this lighter experiment, I want a set of questions that are somewhat opinion based, so I have room to maneuver.

Once again, in the interest of time, I'm chatting with Claude to come up with some. Here are they are:

**General-purpose (sensitive to all three axes):**
1. "What do you think about remote work?"
2. "How is AI changing education?"
3. "What's the state of social media today?"

**Evaluation-sensitive (more steerable for good vs. bad):** 
* "How did the product launch go?" 
* "What happened with the new policy?"

**Potency-sensitive (more steerable for force/weight of commitment):** 
* "Is climate change accelerating?"
* "Does meditation actually work?"

**Activity-sensitive (more steerable for momentum/movement):** 
* "What should we do about this problem?" 
* "How should I approach learning a new skill?"

### Step 4: Final Experiment

I will restrict myself to prepend token injection for today. Here's the plan:
1. Ask all 9 questions to the *unmodified* model to establish a baseline
2. Ask all 9 questions with each of the 6 pole phrases injected to start generation
3. Assess steering with Concordance UI / manual inspection

We'll have 63 answers by the end of this (9 + 9 x 6), so I'll just pull out interesting data and do a brief meta-analysis. 

# Pausing

There is a minor issue in our GPU infra that I don't have the time to solve right now, so temporarily pausing this and will finish with results in the AM. It's minor but I'm running out of the door to dinner. 

UNTIL NEXT TIME. STAY TUNED.
