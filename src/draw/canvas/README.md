# Canvas
The files in this directy handle the main canvas

- `ExCanvas` sits over `HTMLCanvasElement`
- `ExContext` sits over `CanvasRenderingContext2d`, and handles the complex drawing code, and uses `ExStroke`
- `ExTool` and `ExBrush` are the tools that are used in `ExContect`
- `RCanvas` serves as the single entry point that sits on top of those, and deals with layers