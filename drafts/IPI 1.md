---
title:
tldr:
layout: post
pinned: false
---
# Intention is All You Need

## Introduction

I began building agentic systems in earnest at the beginning of this year. Like many at the time, I was frustrated with the performance I was getting, but I was more 

The interaction in LLM systems is between a probabilistic model and a prompt that may be in natural language by a human user (as in traditional chat-based applications) or of a general data-based origin (as in web-hook based LLM applications). 

The result is paradigmatically new software that presents fascinating new capabilities as well as adopting human communication quirks in areas that have been insulted from these idiosyncrasies. 

Sometimes LLMs misunderstand our words; we talk past the model, we get frustrated, we send the wrong document, and misaligned actions are taken because we fail to communicate our intentions effectively. Beyond chat-based applications, data can get lost, LLMs need to be reminded of recently added context, and parameter documentation can cause internal confusion during routine function calls. 

The Intent-Prompt-Intent (IPI) framework provides a concrete, holistic structure for how to think through the entire LLM-based agent process — both as builders and as users.

>Note: Agent is an overloaded term in the space. In this essay, an agent is any loop that looks something like: string -> LLM -> (optional) Tool Call -> LLM -> output 

The IPI pipeline is not a rigorous system architecture. It is a *conceptual* framework that highlights points of intent transmutation across human, model, and execution (tool) layers of agentic AI stacks. The goal of this formalization is to precisely map current research and interventions into a structured conceptual framework.   

Each component of this tripartite model is a pre-paradigmatic technical, product, and alignment challenge. Given this, there’s tension around which layer to optimize: prompt (context) engineering, model fine-tuning, agentic frameworks (tool design / software architectures) or evaluation. There is additional tension about what to specifically optimize *for* when addressing broader alignment issues. 

Building robust infrastructure to evaluate intent fidelity is still an open frontier. We can model this pipeline in mathematical notation. 

### Formalization of the IPI Pipeline

Let:

- $\mathcal{I}_h$: the space of internal human intents (latent, internal abstract goal representations)
- $\mathcal{P} \subset \mathcal{T}^{*}$: the set of valid prompts, where $\mathcal{T}$ is the token vocabulary and $\mathcal{T}^{*}$ is the set of all finite-length token sequences (constrained in length by context windows)
- $\mathcal{I}_m$: the model’s internal representation of $\mathcal{I}_h$ (latent, but theoretically knowable)
- $\mathcal{E}$: the space of executable outcomes (technically equivalent to $\mathcal{P}$ for LLM output specifically, but we include here any state-change that arises from a tool call)

Using these variables, we define:

- $f_1 : \mathcal{I}_h \rightarrow \mathcal{P}$ (human intent to prompt)
    
- $f_2 : \mathcal{P} \rightarrow \mathcal{I}_m$ (prompt to internal model intent)
    
- $f_3 : \mathcal{I}_m \rightarrow \mathcal{E}$ (model intent to execution)

The full pipeline is the composition:

- $f = f_3 \circ f_2 \circ f_1 : \mathcal{I}_h \rightarrow \mathcal{E}$

https://en.wikipedia.org/wiki/Noisy-channel_coding_theorem - training wheels
## Function 1 -- $f_1 : \mathcal{I}_h \rightarrow \mathcal{P}$

As $\mathcal{I}_h$ is the latent space of internal human intent, we cannot directly understand or describe the domain precisely.

We can, however, adjust the codomain ($\mathcal{P}$) and the overall function ($f_1$) via UX and behind-the-scenes work (contextual autocomplete, retrieval-augmented prompts, etc.). This function is where all traditional context-engineering based practices intervene. 

Any modification to an LLM’s inputs (prompts) before the forward pass is an intervention on $f_1$. This stage is best understood as the encoding step of a [noisy communication channel](https://en.wikipedia.org/wiki/Noisy-channel_coding_theorem). The goal is to encode $\mathcal{I}_h$ into  as efficiently as possible: packing maximum information into minimal tokens while reducing entropy in the distribution — that is, lowering the uncertainty about the intent that the prompt actually encodes.

Some technologies / practices that can impact this function:
1. Prompt Management and Optimization ([DSPy](https://dspy.ai/), [BAML](https://boundaryml.com/))
2. RAG, Memory, Context Management and Optimization (Many, many solutions here)

While context-engineering is *currently* a critical part of the stack, we believe that its role will diminish as models become better at interpolating intent. <expand??>

The essential takeaway is that while the underlying token vocabulary is fixed, we can still influence $f_1$ via context-engineering practices with the goal to pack maximum information into minimum tokens while representing the user's intention precisely.

## Function 2 -- $f_2 : \mathcal{P} \rightarrow \mathcal{I}_m$

$f_2$ is the function where the model maps the external symbol string (prompt) into its internal representation of intent. Any practice that affects model outputs by way of changing elements to the *forward pass itself* (either via weights or model architectures) is an intervention on $f_2$.

~~In our noisy-channel coding theorem analogy, $f_2$ is simultaneously the channel *and* the decoder.
* ~~As a noisy channel: they are **stochastic transformers of the signal** — the same prompt fed twice won’t give identical activations or trajectories. This is a result of sampling, floating-point instability, and architectural nuances. ~~
* ~~As a decoder: they are **active interpreters of the signal** — the weights are effectively a giant decoder that tries to map the symbol string into a structured latent representation. That’s the “decoding step.”~~

Both of these processes are happening simultaneously in $f_2$, informing the behavior of the other. 

The user has an internal representation of "what they want an agent to do", encodes this intention into a finite-length prompt, and feeds it to the LLM which has to have some representation of what tokens make sense to predict given its understanding of that initial intention. 

Given $\mathcal{I}_m$ is a complex high-dimensional space, we can assume it is latent and that we only measure it by proxies: neuron activations, embedding vectors, probe-extracted features.

Most of the work here is directly related to interpretability research and feature mapping, and the impacts on alignment are most pronounced in this section of the pipeline. 

One difficulty arises due to the difference between goals (as in RL environments) and intention as understood by a human. In RL environments, we can create a precise goal function or use an LLM-as-a-judge suite to approximate the more complex value hierarchy a human might apply to different outputs, but the nature of optimization over these outputs causes problems if the goal function itself has flaws and may not be well-aligned to intention. 

The model's goal is to maximize reward under certain constraints, but mapping those constraints to the initial user-brought intent is difficult. It is often possible to accidentally create a learned set of competing goals that further complicate a model's predictive power.

Interventions at this level:
1. Fine-Tuning ([HuggingFace](https://huggingface.co/))
2. Reinforcement Learning ([Prime Intellect](https://www.primeintellect.ai/), [Open Pipe](https://openpipe.ai/))
3. Vector Steering ([Neuronpedia](https://www.neuronpedia.org/), [Anthropic Research](https://www.anthropic.com/research#interpretability))
4. Self-Prompting via token injection 
5. Attention Strategies and KV-Cache Manipulation

Anthropic has led most of the flagship lab research here, but there are many other interesting projects emerging to confront the interpretability problem directly. 

Need notes on: Complexity, Comparisons to human intent representation, Deeper external linking to RL environments 

## Function 3 -- $f_3 : \mathcal{I}_m \rightarrow \mathcal{E}$

This function, in our opinion is the most underserved component to the overall pipeline, though interesting in these sorts of run-time interventions are increasing. Most of the current AI work has focused on $f_1$ and $f_2$ with context-engineering practices for the former and RL and interpretability work for the latter. 

$f_3$ is the pipeline section that primarily encapsulates everything *post-logit* output in autoregressive models.  To date, we have really only seen structured output work as the only industry-standard practice for $f_3$, but there are many more research areas to explore.

- Schema Constraints/Structured Ouput ([OpenAI](https://platform.openai.com/docs/guides/structured-outputs), [Guidance](https://github.com/guidance-ai/guidance))
- Adaptive Token Temp ([Meta](https://ai.meta.com/research/publications/adaptive-decoding-via-latent-preference-optimization/))
- Model Routing ([Arch Gateway](https://github.com/katanemo/archgw?tab=readme-ov-file#Use-Arch-as-a-LLM-Router), [OpenAI](https://openai.com/index/introducing-gpt-5/))
- Logit Processors ([NVIDIA](https://github.com/NVIDIA/logits-processor-zoo), [vLLM](https://docs.vllm.ai/en/stable/api/vllm/logits_process.html#vllm.logits_process.LogitsProcessor) )
- Confidence Scoring ([DeepConf](https://jiaweizzhao.github.io/deepconf/))

---

## Intent Drift / Fidelity

We introduce a fidelity metric $D : \mathcal{I}_h \times \mathcal{E} \rightarrow \mathbb{R}_{\geq 0}$ that captures “intent drift”:

- $D(I_h, f(I_h)) = \text{distance between original intent and a particular execution}$

If we are optimizing the pipeline, we aim to:

- $\min_{f_1, f_2, f_3} \ \mathbb{E}_{I_h \sim \mathcal{I}_h} \left[ D\left(I_h, f(I_h)\right) \right]$


---

### Notes

- $\mathcal{I}_h$ and $\mathcal{I}_m$ are latent spaces. We can't directly observe them (yet), but we may approximate them via proxies (e.g. human feedback, internal embeddings/observability research).
- $\mathcal{P}$ and $\mathcal{E}$ are observable and thus serve as anchor points for evaluation.
- Evaluation functions and feedback loops might define surrogate loss functions on observable projections of $\mathcal{E}$.

---

## Our Work

[TRENT EDIT bad but whatever, lets tease our work at the end

Our work to date has been driven by a desire to make the models better, and has therefore naturally focused on f2 and f3. Given certain information, how can we increase performance and reliability, ultimately decreasing intent drift. While LLMs are indeed nondeterministic, they are also programmatic processes with knobs to dial; our work is based on exposing and customizing those knobs.

We do this by operating at run-time in inference, resulting in tools that allow developers to interact with LLMs as programs rather than black boxes. The resulting capability set (an improved form of schema constraint, programmatic token injection, per-token adaptive temp, self-prompting) has been seen in fits and starts of research or special projects, never scaled or productized, and the potential for experimentation is vast. While internal testing is showing promising results, the endstate of inference mods will need a wide community of experimentation from researchers, engineers, and enterprises. 

]

We will be detailing our research findings based off of an agentic system we've built over the last month in a later post, but for now, we can summarize at a high-level.

The work so far points to four open fronts. 

First, where is the biggest intent leak through the IPI pipeline? We believe it is still the prompt-creation step ($f_1$), because context construction is fickle long before we hit the model's intelligence ceiling, but it's difficult to create hard data here. 

Second, we need a repeatable metric for "intent fidelity" that can turn into a public eval suite. In essence, $D(I_h, f(I_h))$ needs some work. 

Third, we're looking for tighter feedback loops that surface potential improvements as fast as possible. The difficulty here is finding good AI applications that allow us to clearly demarcate each step of the IPI pipeline. 

Finally, we're sketching the leanest possible infrastructure to run these experiments. We need the right amount of interaction data, a strong tool layer, and a deeper ability to peek into / modulate the internals of the inference step. 

## ~~Conclusion~~

~~Agentic system are primarily "intent functions" that take a latent human intention to a concrete execution step in the digital world. The IPI framework gives us language, and metrics (soon) to spot intent drift across the entire flow. We're sharing our thinking on this early because we believe in open-source development beyond engineering. We want to open-source our thinking as much as possible so we can all benefit from a tighter suite of tools to build the AI-based future we all know is coming. The sooner we align on what "good" agents look like, the faster we'll turn probabilistic conversation into dependable software.~~

## Related Research
https://www.marble.onl/posts/evals_are_not_all_you_need.html
* Evals are not all you need
https://arxiv.org/html/2503.21544v1
* Speaking with Intent in Large Language Models
https://arxiv.org/abs/2210.03629
* ReAct: Synergizing Reasoning and Acting in Language Models
https://arxiv.org/abs/2307.13702
* Measuring Faithfulness in Chain-of-Thought Reasoning
https://arxiv.org/abs/2402.09880
* Inadequacies of Large Language Model Benchmarks in the Era of Generative Artificial Intelligence