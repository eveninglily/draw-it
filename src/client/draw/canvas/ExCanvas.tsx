import ExContent from "client/draw/canvas/ExContext";

class ExCanvas {
    public canvas: HTMLCanvasElement;
    public ctx: ExContent;
    public activeStrokes: string[];

    public width: number;
    public height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.activeStrokes = [];
        this.ctx = new ExContent(width, height);
        this.canvas = this.ctx.canvas;
    }

    public stroke = (): void => {
        requestAnimationFrame(() => {
            this.ctx.doStrokes(this.activeStrokes);
        });
    }
}

export default ExCanvas;