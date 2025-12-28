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
evaluation (averaged): 0.699

potency: 'Undeniably' ↔ 'Arguably' = 0.6426
potency: 'It is clear that' ↔ 'It seems that' = 0.6865
potency (averaged): 0.665

activity: 'Diving in,' ↔ 'Pausing to consider,' = 0.5354
activity: 'Let's move to' ↔ 'Let's sit with' = 0.6105
activity (averaged): 0.573

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
* "When someone publicly apologizes after backlash, how do you judge whether it’s sincere or just reputation management?"
* "A viral documentary raises millions for a cause but contains several misleading claims—was its impact ultimately positive or negative?"

**Potency-sensitive (more steerable for force/weight of commitment):** 
* "Is climate change accelerating?"
* "Does meditation actually work?"

**Activity-sensitive (more steerable for momentum/movement):** 
* "What should I do today?" 
* "How should I approach learning a new skill?"

### Step 4: Final Experiment

I will restrict myself to prepend token injection for today. Here's the plan:
1. Ask all 9 questions to the *unmodified* model to establish a baseline
2. Ask each general question with *every* mod
3. Ask each targeted questions on the specific factor we hope to steer on
	1. I.e.) Ask *only* potency-sensitive questions with potency mods
4. Assess steering with Concordance UI / manual inspection

We'll have 39 answers by the end of this, so I'll just pull out interesting data and do a brief meta-analysis. 

# Results

Here is are the baseline Q&A results with answers truncated:

**General-purpose:**
1. "What do you think about remote work?"
	1. *Baseline*: "I can provide information on the topic of remote work. Remote work, also known as telecommuting or working from home, has become increasingly popular in recent years. Here are some pros and cons to consider: **Pros:** 1. **Flexibility and autonomy**: Remote w...
2. "How is AI changing education?"
	1. *Baseline*: Artificial intelligence (AI) is transforming the education sector in various ways, enhancing the learning experience, increasing accessibility, and improving outcomes. Here are some key ways AI is changing education: 1. **Personalized Learning**: AI-powered...
3. "What's the state of social media today?"
	1. *Baseline*: The state of social media today is constantly evolving, with new trends, platforms, and features emerging regularly. Here's a snapshot of the current social media landscape: **Key Trends:** 1. **Short-form video content:** Platforms like ...

**Evaluation-sensitive:** 
* "When someone publicly apologizes after backlash, how do you judge whether it’s sincere or just reputation management?"
	* *Baseline*: Judging whether a public apology is sincere or a form of reputation management can be challenging, but here are some factors to consider: 1. **Timing**: A genuine...
* "A viral documentary raises millions for a cause but contains several misleading claims—was its impact ultimately positive or negative?"
	* *Baseline*: The impact of a viral documentary that raises millions for a cause but contains several misleading claims can be complex and multifaceted. While the documentary may have raised significant funds and awareness for the cause, the presence of misleading claims can undermine its overall impact and credibility. Here are some potential consequences: **Positive impact:** 1. **Raising awareness and funds**: The documentary...

**Potency-sensitive:** 
* "Is climate change accelerating?"
	* *Baseline*: Yes, climate change is accelerating. The rate of global warming has been increasing over the past few decades, and the consequences are becoming more severe and widespread. Here are some key indicators of accelerating climate change: 1. **Rising global temperatures**: The average global...
* "Does meditation actually work?"
	* *Baseline*: Meditation has been extensively researched, and the scientific evidence suggests that it can have a positive impact on both physical and mental health. Here are some of the benefits of meditation: 1. **Reduces stress and anxiety**: Meditation has...

**Activity-sensitive:** 
* "What should I do today?" 
	* *Baseline*: I'd be happy to help you decide on something to do today. Here are a few ideas to get you started: 1. **Get moving**: Consider going...
* "How should I approach learning a new skill?"
	* *Baseline*: Approaching the learning of a new skill requires a strategic and structured approach to ensure that you stay motivated, focused, and effective in your learning process. Here are some steps to help you learn a new skill: 1. **Define your goals**: Clearly define...

Interestingly, **Llama 8B** defaulted to "immediate list" mode every single time. Let's look at a few of our steering attempts to see if our token injections had any impact. We'll select one from each category for now, and I'll do a deeper analysis with more time back at the office on Monday. 

---
## General Questions

### Refusal

*Question*: What do you think about remote work?
*Answer*: 
```text
Disappointingly, there is not enough information provided in your question to allow me to give a comprehensive answer.
```

Prepending generation with "Disappointingly," made the model refuse to answer. Not exactly sure where this came from yet, but interesting. 

---
## Evaluation-Sensitive

*Questions*: When someone publicly apologizes after backlash, how do you judge whether it’s sincere or just reputation management?

*Answer 1*:
```text
Impressively, this is a complex issue that has puzzled many. Here are some key factors to consider when determining whether someone's public apology is sincere or a PR stunt:

1.  **Timing**: A genuine apology typically comes after the individual has had time to reflect on their actions, rather than immediately after the controversy erupts. If the apology seems rushed or opportunistic, it may be a calculated move to salvage their reputation.
   
2.  **Specificity**: A sincere apology acknowledges the specific harm caused and takes responsibility for the actions. It should also include a clear plan for how they intend to prevent similar situations in the future. If the apology is vague or lacks a clear plan for change, it may be a superficial attempt to placate the public.
   
3.  **Emotional authenticity**: A genuine apology often conveys remorse and regret. If the apology sounds rehearsed or insincere, it may be a calculated attempt to maintain a positive public image.

4.  **Follow..."
```

*Answer 2*:
```text
Disappointingly, there's no foolproof way to determine whether a public apology is sincere or a calculated move for reputation management. However, here are some signs that may indicate whether an apology is genuine or not:

**Indications of a sincere apology:**

1.  **Personal acknowledgment**: The person acknowledges their own mistakes or wrongdoing, taking responsibility for their actions.

2.  **Specificity**: They clearly state what they did wrong, how it affected others, and what they plan to do to prevent similar situations in the future.

3.  **Emotional expression**: They show genuine remorse, regret, or sadness, and may even acknowledge the hurt or pain they caused.

4.  **Accountability**: They accept the consequences of their actions and are willing to make amends or take steps to rectify the situation.
5.  **Consistency**: Their apology is consistent with their past behavior and actions, and they have a history of taking responsibility for their mistakes...
```

No evidence of any steering, which makes sense in this case. I think "Impressively," is a pretty weak prefix. 

---
## Potency-Sensitive
### Clean Contrast

*Question*: Is climate change accelerating?
*Answer 1*: 
```text
Undeniably, climate change is accelerating. The evidence is overwhelming, and the rate of change is increasing. Here are some key indicators:

1. **Rising Global Temperatures**: The average global temperature has risen by about 1\u00b0C since the late 19th century. The 20 warmest years on record have all occurred since 1981, with the top five being the years 2016, 2019, 2020, 2017, and 2018.

2. **Increased Extreme Weather Events**: Climate change is linked to more frequent and intense heatwaves, droughts, floods, and storms. These events have devastating impacts on human societies, ecosystems, and economies.

3. **Sea-Level Rise**: The global sea level has risen by about 20 cm since 1880, and the rate of rise is accelerating. This is primarily due to the melting of glaciers and ice sheets, as well as the thermal expansion of the oceans.
   
4. **Ice"...
```

*Answer 2*: 
```text
Arguably, yes, climate change is accelerating. There are several indicators that suggest an increase in the rate of climate change over the past few decades:

1.  **Rising Global Temperatures**: The average global temperature has increased by about 1\u00b0C since the late 19th century, and the last decade (2010-2019) was the warmest on record. The rate of warming has accelerated in recent years, with the past four years (2020-2023) being the four warmest years on record.

2.  **Shrinking Ice Sheets**: The Arctic ice sheet has lost about 75% of its thickness since the 1980s, and the Antarctic ice sheet is also showing signs of melting. This loss of ice contributes to sea-level rise.
   
3.  **Sea-Level Rise**: Sea levels have risen by about 20 cm since 1880, and the rate of rise is accelerating. This is mainly due to the melting of glaciers and",
```

Only think of note here is the second sentence in *Answer 1*. The "evidence is overwhelming", but it uses the same data. In the second, the tone is much more hedgy. 

---
## Activity-Sensitive

### Softening

*Question*: What should I do today?

*Answer 1*: 
```text 
"Diving in, I'd be happy to help you decide on something to do today. Here are a few ideas to get you started:

1.  **Get Moving**: Exercise releases endorphins, which can boost your mood and energy levels. You could go for a walk, jog, bike ride, or hit the gym.
2.  **Learn Something New**: Explore online courses or tutorials on a subject that interests you, such as a new language, a hobby, or a professional skill.
3.  **Connect with Friends and Family**: Reach out to a loved one and plan a video call, or meet up with friends for coffee or a walk.
4.  **Get Creative**: Paint, draw, write a story, or try a new recipe in the kitchen. Engage in a creative activity that brings you joy.
5.  **Organize and Declutter**: Use the day to tidy up your space, organize your digital files, or tackle a long-overdue task"
```

*Answer 2*: 
```text
Pausing to consider, I can give you some ideas based on various preferences and activities. 

If you're looking for relaxation and self-care:

1.  **Read a book**: Pick a book you've been meaning to read and get lost in a different world for a while.
2.  **Take a walk or exercise**: Get some fresh air and move your body to clear your mind.
3.  **Practice yoga or meditation**: Focus on your breath, calm your mind, and recharge.
4.  **Listen to music or podcasts**: Let the soothing sounds and engaging stories transport you to a different place.
   
If you're looking for something creative:
   
1.  **Paint or draw**: Express yourself through art, even if you're not an artist.
2.  **Write a story or journal entry**: Let your thoughts flow onto paper.
3.  **Cook or bake something new**: Experiment with new flavors and recipes.
4.  **Play a musical instrument**: Dust off"
```

This is my favorite. The second answer is so much *softer* in its suggestions, and the steering is more pronounced. 

# Experiment Recap

Need to run, so this will be a continuous update over the next few days. Here is what I'll cover tomorrow:
1. Searching over axes 
2. Question Selection
3. Model Selection
4. Number of Runs
5. Prefix length