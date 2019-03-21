# Draw-it
Collaborative drawing and games!

This project is discontinued as of this point, but I at least want this repo and readme to serve as a final thought on it. It's quite the ramble, but gets the point across.

## History
I started this project in 2013, and have worked on it on and off (mostly off) since then. At the time, there were very few options in the collaborative drawing space, let alone good options. I thought I could do better, and started this project as a result. 

Over time, this project has gone through a lot of iterations, especially with naming. Drawingapp, Nodedraw, Amidraw, and Draw-it. Each of these names also generally corresponds with a new UI, and a big (attempted) rewrite. 

Currently, the code is about half-rewritten in react and typescript, and there's a lot that doesn't work. I hate leaving it in this state, but I simply can't work on it anymore. By now, the collaborative art space is a lot more filled, and I just have other things I'm more interested in.

# Postmortem
## What I built
I built a very powerful synced canvas, and a hacky UI around it, along with a few other small systems.

## What worked well
Overall, I'm happy with the core tech I developed, and how much I've grown over my time working on draw-it. It's crazy to have software that you started when you were still first learning Javascript. 

## What didn't work
When I started this project, I was still very new to web development. I was determined to make minimal use of libraries. While that is a good approach for learning, it is not a good approach when trying to build something. By not leveraging existing technologies enough, I was spending tons of time on boring problems, re-inventing the wheel, rather than on new, interesting technology.

Along with that, I had two other big issues: over-abstraction and rewrites. Again, while it is a great way to learn, you end up spending a lot of time on nothing. Then, you feel like you aren't making any progress, and end up dumping the project for a few months to work on something more interesting than janky UIs hacked together with jQuery.

I also tried to over-optimize and over-abstract before actually finishing what I was working on. Again, this lead to a lot of effort than produces no actual code.

# Final Thoughts
Overall, I have a lot of thoughts about draw-it that are hard to organize, but ultimately, it boils down to this: I learned the difference between exploration and building. Both are super valuable in their own right - but can often be opposing forces. I also very painfully learned why people use frameworks such as React, and how to really leverage existing technology.

# Related Repos
There's a ton of related work on my Github that went into it. Here's it all in one spot:
## Core
Here's an old version, and the partly-working website.

https://github.com/McIntireEvan/drawingapp
https://github.com/McIntireEvan/amidraw-web

## Colorwheel
Turns out HSL colorwheels like the ones in programs like SAI are hard to find. I wrote three. I hope I don't have to write anymore.

https://github.com/McIntireEvan/colorwheel
https://github.com/McIntireEvan/colorwheel.js
https://github.com/McIntireEvan/hslpicker

## Windows
Early on, I thought it'd be cool to have the toolbox, menus, etc. all in windows.

https://github.com/McIntireEvan/windowfy
https://github.com/McIntireEvan/window.js

## Other
I was planning on using Vue instead of React, but it turned out I liked React more!
https://github.com/McIntireEvan/vial

