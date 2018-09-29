import ExContent from "./ExContext";

class ExCanvas {
    public canvas: HTMLCanvasElement;
    public ctx: ExContent;
    public activeStrokes: string[];

    constructor() {
        this.activeStrokes = [];
        this.ctx = new ExContent(1920, 1080);
        this.canvas = this.ctx.canvas;
    }

    public stroke = (): void => {
        requestAnimationFrame(() => {
            this.ctx.doStrokes(this.activeStrokes);
        });
    }
}

export default ExCanvas;