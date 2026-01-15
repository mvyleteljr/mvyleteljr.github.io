---
title: Transformer Refresh
tldr: Musings about a great Anthropic Paper
layout: post
pinned: false
---
## Introduction

I've been extremely motivated to begin re-sharpening my research skills and building back up a foundation of academic-level rigor. To that end, especially given where we've landed as a company, I've decided to document every paper I read related to LLMs and mech interp.

My hope is that instead of passively reading papers, I can use this practice to actively engage them. I'll tag points of confusion or interest, and then ideally articulate a few experiments that I can run to validate my understanding.

I'm starting with Neel Nanda's [great resource](https://www.alignmentforum.org/posts/NfFST5Mio7BCAQHPA/an-extremely-opinionated-annotated-list-of-my-favourite-1) for getting up to speed on mech interp. A lot of this I feel somewhat comfortable with already, but it's always good to start with the foundation.

Today I'll read and write about Anthropic's ["A Mathematical Framework for Transformer Circuits"](https://transformer-circuits.pub/2021/framework/index.html#transformer-overview).

### Paper Section 1: Untitled

Already, I'm inspired by "...mechanistic interpretability, attempting to reverse engineer the detailed computations performed by transformers, similar to how a programmer might try to reverse engineer complicated binaries into human-readable source code."

I remember doing work like this with debuggers in my system architecture classes at Brown. It's a good analogy, and I like it better than the obvious "LLM neuroscience" analogy you often hear when discussing interpretability. It's best to not anthropomorphize these models too much.

It's somewhat interesting that all of the (public) major lab research on this topic is focused on safety. While this is obviously the most important problem in the limit, I'm personally more interested in the potential for control as it relates to *ability*. I hold the belief that most of the current SOTA models are already smart enough to do most useful digital tasks, but they're inconsistent. Understanding them from a mech interp point of view has intuitively felt like a way to "mine" them for the best abilities, while protecting against common failure modes. We've already run some tests on this at Concordance (will link soon).

### Paper Section 2: Transformer Overview

I'm intentionally skipping the summaries.

Quick note for myself about scope:
1. No MLP consideration
2. No biases
3. No layer transformers

Also an aside, I cannot understand why they chose to make time dimension upward in their diagrams. Time should follow gravity if you're going to go vertical. Anywho...

I presume $x$ is the residual stream in this case, and $x_i$ is just the state of the residual stream at each step in the circuit. Nice.

#### Virtual Weights and the Residual Stream as a Communication Channel

Really love this "communication channel" analogy. I've consistently found it helpful to pull from information theory when trying to understand LLMs conceptually. That connection isn't being made explicitly in the paper, but it does inspire me to continue bringing in more information theory tools into interp research. Generally, I been using [noisy-channel coding](https://en.wikipedia.org/wiki/Noisy-channel_coding_theorem) as way to think about these models holistically, but I'm still working on formalizing this.

"The residual stream has a deeply linear structure."

Quick notes for myself:
1. Blocks "read" from residual stream by applying some linear map (matmul)
2. Blocks "write" to residual stream by applying another linear map (matmul + vector addition)

Step 1 reads to me as the block going: "I'm gonna take this giant vector, and express it in a different coordinate system that emphasizes the aspects I care about.” 

Intuitively, step 2 is "okay, I applied my knowledge to the subspace I'm smart about, let me write it back to the original space, taking it out of my own specific-subspace amplified form."

Here's a nice excerpt from a chatGPT conversation about implications of linear subspaces and no privileged bases in deeper detail. I need to verify it, but for now it fits with intuition so I'll tentatively accept it:

#### Case A: No privileged basis (the transformer situation)

* Residual stream update:

  $$
  r \mapsto r + W_{\text{out}} f(W_{\text{in}} r)
  $$
* If we apply a change of basis $r' = Qr$, and update $W_{\text{in}}, W_{\text{out}}$ accordingly, the function of the whole model doesn’t change.
* Implication: The coordinates of $r$ don’t mean anything by themselves. Only the *linear relations* matter.

#### Case B: With a privileged basis

Here you’d have operations that directly inspect or modify *specific coordinates* of the residual stream without respecting rotation equivariance.

Examples:

1. **Coordinate-wise nonlinearities in the residual stream itself.**
   Suppose the update was:

   $$
   r \mapsto r + \sigma(r)
   $$

   where $\sigma$ is applied elementwise (e.g. ReLU).

   * Now, if you rotate $r$, you don’t get equivalent behavior — because ReLU depends on the sign of *individual coordinates*.
   * That means the canonical basis vectors $e_1, e_2, \ldots, e_d$ are “privileged”: each coordinate axis has its own role.

2. **Sparse selection of coordinates.**
   Imagine an operation like:

   $$
   r \mapsto r + (r_1, 0, 0, \ldots, 0)
   $$

   where you explicitly pick out the first component of $r$.

   * Rotate the basis, and “coordinate 1” no longer means the same thing.
   * The function of the network would change if you rotated, so the standard basis is privileged.

3. **Hard-coded masks.**
   If a layer said “only ever update dimensions 100–200 of the residual stream,” then those axes are special. They *must* exist in the representation for the model to work.

#### General principle

* **No privileged basis:** The system is equivariant under all invertible linear transformations of the residual stream. Features live in arbitrary subspaces.
* **Privileged basis:** The system contains operations that break this symmetry — by singling out coordinates, applying elementwise nonlinearities, or hard-coding masks. Features then line up with specific axes.
