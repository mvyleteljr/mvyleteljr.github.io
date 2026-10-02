---
title:
tldr:
layout: post
pinned: false
---
The goal of this piece is to get coverage on alignment / safety current frontier from a technical vantage point. I want to know where we're at and build frameworks for digesting new information, and then use that to establish some trajectories about where to spend time/effort and what I think has the best shot. 

Alignment:
1. What to align the models *to*?
	1. Need to understand the externalities of this
	2. contextual awareness
	3. what it means in AGENTS and why that's different than for humans
2. How to know that it took?
	1. Interp is good but bottlenecked by behavior / long horizon / swarm reseach
		1. Without good behavioral mapping, mech interp is hard
	2. Risk assessment re: zach horvitz
3. How does it iterate?
	1. Not good for doing this on just one model unless the results can be redone on new things
	2. Needs to be accessible to run pre deployment
	3. OS model difficulties

Safety:
1. Safety is a superset of alignment
2. Even in pre-ASI models, we need control, monitorability 
3. Control is an important problem here, less important as things scale. 

Outline:
1. Introduction:
	1. What this piece is:
		1. establish what I consider the technical frontier
		2. create a framework for how to digest new material
		3. assign importance 
		4. create predictions / trajectories
2. Disambiguating between Safety & Alignment
	1. Safety is a superset of alignment
	2. Reference some classic less wrong posts and find best definitions
		1. (community will come for my throat if i dont do this well)
3. Alignment:
	1. how i think about it (3 question framework)
	2. Treat each section in sub sections and link to all relevant papers / writing
4. Safety
	1. how i think about it:
		1. Control / monitorability / sandboxing in the short term
		2. Long term less important
		3. a note here on well-being and humans
			1. AI can be aligned and safe but disempower and cause societal unrest
			2. Find technical lenses here
5. Frameworks:
	1. What should we be asking new technical work to effectively metabolize?
		1. What category does this fit into? 
			1. Alignment / Safety ? Triage by control basically
			2. which sub question of alignment? 
			3. Implications?
6. Trajectories:
	1. Belief section:
		1. I believe that control is long term impossible -- only hope is alignment
		2. Problem is that we need 100% -- 99% percent alignment is catastrophic
		3. Interp only valuable if it scales and iterates effectively
		4. Persona work is mostly a dead end (roon tweet)
		5. Automated interp is incredibly important
		6. Behavioral mapping and risk assessment work is enormous
		7. You can price these things and that can change behavior
		8. etc...