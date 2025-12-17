---
title: Interfaces for Prosperity
tldr: Chatbots suck. Who will save us?
layout: post
pinned: false
---
I've been spending a lot of time thinking about LLM interfaces recently. Chat-like interfaces have always felt like a dramatically underpowered and dangerous interaction modality, and I haven't seen many creative attempts to explore this space. We're working on this at Concordance in an "engineering interface" context, and as this work develops I find myself imagining other ways we might be able to interact with models generally. 

(This is the first post as part of a "publish something everyday until February 1st" challenge I've imposed on myself, so there are going to be some rough edges. I'll annotate things I'd like to develop with this alchemical symbol for vinegar: 🜋)

## Interfaces Design is a Serious Problem

I'm always surprised by the lack of care people seem to put towards the way they interact with the things they use most consistently. There is a feedback loop that exists in any confluence of human and technology that is important to get right (🜋). The negative qualities present in the feedback loop get amplified, and they change behavior over time. 

I think part of the reason for this is that it's for some reason seen as "uncool" and impossible to try fitting technology to work *for* you, as opposed to against you. The zeitgeist shifted sometime in the last couple years (🜋). We've become apathetic and seem to have submitted to the companies pushing out the tech. 

In the LLM context, this feels even more important to get right. Fundamental human behaviors, like reasoning, are being outsourced to this technology. Given their improving capabilities, we're seeing massive behavior changes quicker than we would with other technology. 

This is a problem on par with superintelligence risk. It's less acute, and somewhat less sexy to discuss, but unlike superintelligence and God-like AI, this problem is present *right now*. It may not be the case that the behavior changes we're experiencing will kill us *literally*, but there is a slow death of some sort (🜋). 

I'll first describe why chatbots reinforce dangerous behavioral patterns for end users, then offer some potential ideas for new modalities. In a later post, I plan to do this for engineering interfaces. 

## Why Chatbots Suck

There are two main problems with chat interfaces. 

The first is that they fit too snugly into a form that we're so used to interacting with. We do some of our most important work in chat interfaces, talk to our loved ones through iMessage, and connect with people on social media in the same linear back-and-forth that mirrors a chat. This makes it easy for us to unconsciously bring similar patterns into the LLM chat interface as we bring to all these other interfaces (🜋). 

The consequence of this is that LLMs begin to feel more human than they are, and because they feel more human, we begin to relate to them like we would another human. This is [dangerous](https://arstechnica.com/information-technology/2025/08/openai-brings-back-gpt-4o-after-user-revolt/?utm_source=chatgpt.com). Relatedly, it puts big labs in a tricky spot. How do you craft the right personality for these models (🜋)? 

Another issue that is far less discussed is that chat interfaces are linear. They compress vast amounts of knowledge into textual form, and language is a low-res tool for describing concepts (🜋).

## Beyond Chatbots

There are three experimental interface concepts that I'd like to develop:
1. "Feature Tree"
2. "Backseat Driver"
3. "Honest"

---
### Feature Tree
What if instead of outputting language, we simply watched internal feature activations in real time, and created evolving heat maps of conceptual information?

***How to use:*** Give it multimedia information, or brain dump, and watch what concepts are emerging and at what time. Here is a terrible little sketch I had AI studio come up with for me:

![Feature Tree concept sketch](/assets/images/Screenshot 2025-12-16 at 7.29.03 PM.png)

***Target Audience:*** Artists, someone looking to use AI as a way to generate general inspiration across domains, scientists.

---
### Backseat Driver
What if instead of you being the writer that leverages auto-complete and AI to be a co-pilot, YOU were the co-pilot while the AI steered the ship. 

***How to use:*** Seed it with an initial prompt, allow it to slowly generate writing. Pause generation or steer it with a variety of sliders that augment generation in real time. There would be no back and forth, just nudging and pushing it along strange new paths. You should also be able to back track and have it re-generate from a stopping point.

![Backseat Driver concept sketch](/assets/images/Screenshot 2025-12-16 at 7.34.48 PM.png)

***Target Audience***: Writers, hobbyists... I don't know. This one doesn't have much clear utility but would be fun. 

---
### Honest
A hyperdetailed generation stream that lets you see what is actually happening at each step of inference while you're generating. 

***How to use***: Just like normal chat, but you see way more information that helps reinforce the idea that these things are generating language via math. 

Here is a screenshot from our internal research interface at Concordance that is pretty much this exactly, but without being an explicit chat or generating the data in real time. 

![Honest concept sketch](/assets/images/Screenshot 2025-12-16 at 7.46.03 PM.png)

***Target Audience***: Every curious person, but mostly technical people, probably engineers.

I have really loved using this interface to explore personally, and I'd love to use our tech to build a fun product around it. To be explored!

---

## Conclusion!

I had way too many ideas going in this one to scope well. This challenge is going to be difficult but I've learned a lot from today. There is a lot to explore in this domain and it's worth way more than the 1.5 hours I spent writing this today.

Here is a list of some related work that could spin out of this:
1. More Interfaces
2. Expansion on Behavior Loops
3. What is the goal of personality in LLMs?
4. Are there new modalities for output stream structure beyond typical digital media?
5. How does human identity evolve with outsourced reasoning?

More to come on this topic and much more!