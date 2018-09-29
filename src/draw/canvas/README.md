# Canvas
This is the core drawing code; it sits as a wrapper over HTMLCanvasElement and CanvasRenderingContext2d

The high level overview is that `RCanvas` is the single entry point for the rest; it sits on the page, draws the layers, and intercepts events to send to the correct canvas.

`ExCanvas` holds extended canvas info, i.e. layer settings

`ExContext` handles drawing, and uses several internal canvases as an attempt to have quicker, safer rendering.