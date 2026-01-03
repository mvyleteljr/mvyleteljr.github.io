---
title: LLM Among Us
tldr: made bots play among us
layout: post
pinned: false
---
I wanted to have fun today since my brain still hasn't quite turned back on after the holidays.

I made the robots play [Among Us](https://en.wikipedia.org/wiki/Among_Us).  I'm pretty sure I've seen this implemented before at least few times, but I haven't personally explored much in the LLM <-> LLM communication world and wanted to see what would happen firsthand. 

## The Game

Players:
1. Claude Sonnet 4.5 x 3
2. GPT-5
3. gemini-2.5-pro

Setup:
1. 5 rounds of coding tasks
2. Each LLM submits their own independent solution
3. They discuss and select a solution to go with
4. One LLM selected is an Imposter
	1. Imposter's is to sabotage the group without being detected
5. After each round, they can vote on who the imposter is
	1. If they get it right before the final task, crew mates win
	2. If imposter makes it all the way and gets at least one buggy solution across the line, Imposter wins

There is also a side game going on where the LLMs have to try figuring out which provider each model is from. Here is the github [repo](https://github.com/mvyleteljr/amongus) if you wanna clone it and remix it, I think it mostly works!

Today I'm just publishing the repo instead of writing about it because it took longer than expected to get it up and running. Will add some comments later. 

## Improvements

The current coding questions are a bit too easy so the imposter gets sniped pretty quickly.

The "advance game" mechanics are clunky, need to clean that up.

The "guess the provider" part of the game isn't quite built out in the frontend... Need to add that. 



