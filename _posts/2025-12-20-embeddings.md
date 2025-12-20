---
title: Semantics Pt. 2
tldr: part 2 of n of exploring semantics in token injection
layout: post
pinned: false
---
# Introduction

I wrote [recently](https://mvyleteljr.github.io/blog/semantics-2025-12-17) about two examples I've been thinking about a lot at Concordance that keep funneling me back to this idea of "semantic power" in LLMs. 

The core idea is that LLMs seem to have an amplified sensitivity to semantics than humans do, and I want to understand how to use this. 

My goal for this article is to begin shaping my thinking more precisely and articulate a set of scoped questions that I can follow to build depth around semanticity.

## Background

One of the many things our modified inference does really well is token injection. One can use *Concordance v1* to insert any string into the generation stream at any point with ***mods***. *Mods* are user-created modules that accept events at 4 important moments of inference and send back data that can update inference parameters, backtrack generation, and inject tokens amongst other things

*Mods* can hold arbitrary state, which grants the developer a lot of control. With respect to token injection, you need to define:
1. The *Injection Phrase* - what you're injecting into the "model's thoughts"
2. The *Injection Point* - what will trigger the injection

There are many surprising degrees of freedom within this structure.

## Semantics

We've been exploring the boundaries of token injection for the last couple weeks. Our experience, corroborated by existing [literature](https://openreview.net/pdf?id=fnz1g18EdI), is that LLMs are extremely sensitive to semantics.

Humans are multi-sensory creatures. Even a relatively low-res tool for describing reality like language is used within culturally rich multi-sensorial contexts that shape the encoded meaning. This contextual understanding does a lot of work to transmit information between "speaker" and "receiver". In a *live* context, there is even more nuance with the added element of the *receiver's* reactions that reflect back to the *speaker*. This feedback itself is an effective "human steering" tool. 

I'm fascinated by how this contextual information transfer works in LLMs. How much and what type of information is encoded into specific tokens, and how does this encoded information update with each new piece of information? 

This might just be feature activation research by another name, but my intuition is there's something different here. Take the phrase "upon revisiting" from my [previous post](https://mvyleteljr.github.io/blog/semantics-2025-12-17). 

What's your hypothesis for the features that phrase might activate? 

*Doubt*, maybe, but that's not quite descriptive enough. Our experience is that this phrase encodes something stronger than doubt... something more like an **imperative** to change one's mind.

I want to get a map of examples like this and use it to craft richer token injections. 

The set of questions here are language questions, not really conceptual ones. We aren't interested in things like "animal features", we're interested in "language features" that give us a richer understanding of how to structure potent injections. 

## The Gulf of Understanding

Having a good grasp of LLM semantic sensitivity is extremely consequential to our token injection research. It's often the case that our human intuitions about what words mean and what behavior they might modify in crafting LLM trajectories within a single prompt are correct(ish), but amplified. 

We therefore end up spending an inordinate amount of time tinkering with individual words, grammatical structure, and other nuances in our token injections to find the "Goldilocks Zone" that steers the LLM without having unintended consequences. 

This is a largely inefficient brute force approach.

The best example is our work trying to get the model to double-check its work on the GSM8K dataset. After we realized the issue with "upon revisiting", we ended up spending a couple hours tinkering with other strings that could lead it down the "double-check trajectory" without being explicit about *what to double check*. 

We ended up with: "Before giving our final answer, let's double check our reasoning:"

This avoided the pitfalls of the previous injection (it didn't second guess correct answers), but it also caught fewer errors. We're still not at a local optimum.  

## Working *Within* LLM-Space

I want to find a way to work *with* the models. How can we create a pragmatic map of semanticity as learned by LLMs that helps us do steering without training SAEs? 

The obvious first step is probably to get an understanding of linguistics in normal human generated language, but beyond that, I have some ideas. 

Here are the two steps I'll begin with, starting with "semantic axes".
### Semantic Axes

I'd like to create a set of meaning "basis vectors" . Here are some examples of what these axes might be:
1. Doubt vs. Certainty
	1. "Maybe" vs. "I know"
2. Precise vs. Imprecise
	1. "Animal" vs. "Dachsund"
3. Light vs. Heavy
	1. Hard to come up with an example, but I'm trying to capture words like "explicitly" or "overtly" that carry a *heaviness*. Maybe *importance* is more precise. Not sure. 
4. Open vs. Closed Injections
	1. "I love sourdough." vs. "I love sourdough because"
5. Inert vs. Active
	1. "Upon revisiting" is a good example of *active*. Whereas "Let's make sure we're right" is mostly inert. 

It would be helpful to know if the antipodes of each spectrum actually map to steering power. My hypothesis is that it won't be this simple, but the work will begin to elucidate more complete descriptions of what has the most steering power generally.

I predict that the most powerful semantic concepts will be the "Inert vs. Active", "Open vs. Closed", and the level of precision. 
### Embeddings

After having and testing some spectrums that actually work, I'd like to use an embedding model to capture our findings and make the process more automated. 

One could imagine a sliding window of tokens that gets embedded, and a set of words that exist in a similar space that could be used to push a generated trajectory closer to an "ideal". 

In essence, the second step would be "how can we make the token selection process learnable"?

## Conclusion

The meta-goal here is to create new intuitions. For as much as they capture language nuance, LLMs break intuitions in many ways and amplify strange linguistic patterns. We want to reverse-engineer how this happens, map it, and use the that map to steer them. 