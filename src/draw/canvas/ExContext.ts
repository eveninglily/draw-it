import ExBrush from "src/draw/canvas/ExBrush";
import ExStroke from "src/draw/canvas/ExStroke";

/**
 * Extended canvas drawing context
 */
export default class ExContent {
    public width: number;
    public height: number;

    public canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;

    private backCanvas: HTMLCanvasElement;
    private bCtx: CanvasRenderingContext2D;

    private strokeCanvas: HTMLCanvasElement;
    private sCtx: CanvasRenderingContext2D;

    private strokes: {[id: string]: ExStroke};

    private isRedrawing: boolean;
    private debug: boolean;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

        this.backCanvas = document.createElement('canvas');
        this.backCanvas.width = this.width;
        this.backCanvas.height = this.height;
        this.bCtx = this.backCanvas.getContext('2d') as CanvasRenderingContext2D;

        this.strokeCanvas = document.createElement('canvas');
        this.strokeCanvas.width = this.width;
        this.strokeCanvas.height = this.height;
        this.sCtx = this.strokeCanvas.getContext('2d') as CanvasRenderingContext2D;

        this.strokes = {};
        this.isRedrawing = false;

        this.debug = false;
    }

    /** Redraw Functions */

    public clear(context: CanvasRenderingContext2D) {
        context.clearRect(0, 0, this.width, this.height);
    }

    public drawCanvas(context: CanvasRenderingContext2D, source: HTMLCanvasElement) {
        context.drawImage(source, 0, 0);
    }

    public redrawCanvas(dest: CanvasRenderingContext2D, src: HTMLCanvasElement) {
        this.clear(dest);
        this.drawCanvas(dest, src);
    }

    /* Stroke Functions */

    /**
     * TODO: Expand to add more brush customization
     */
    public setContextValues(brush: ExBrush, ctx: CanvasRenderingContext2D) {
        // if (ctx.globalAlpha != tool.opacity) { ctx.globalAlpha = tool.opacity; }
        if (ctx.lineJoin !== 'round') { ctx.lineJoin = 'round'; }
        if (ctx.lineCap !== 'round') { ctx.lineCap = 'round'; }
        if (ctx.lineWidth !== (brush.size * 2)) { ctx.lineWidth = brush.size * 2; }
        if (ctx.strokeStyle !== brush.color) { ctx.strokeStyle = brush.color };
        if (ctx.fillStyle !== brush.color) { ctx.fillStyle = brush.color; }
        if (ctx.globalCompositeOperation !== brush.operation) {
            ctx.globalCompositeOperation = brush.operation;
        }
        return ctx;
    }

    /**
     * Starts a new stroke
     */
    public beginStroke(brush: ExBrush, x: number, y: number, p: number, id: string) {
        const s = new ExStroke(JSON.parse(JSON.stringify(brush)));
        s.addPoint(x, y, p);
        this.strokes[id] = s;
    }

    /**
     * Updates a stroke with a (x, y) point and pressure using an ID
     */
    public updateStroke(x: number, y: number, p: number, id: string) {
        this.strokes[id].addPoint(x, y, p);
    }

    /**
     * Completes a stroke
     */
    public completeStrokeById(id: string) {
        if(this.strokes[id] !== undefined) {
            this.completeStroke(this.strokes[id])
        }
    }

    /**
     * Finalizes the stroke by drawing it onto the buffer canvas
     * TODO: Optimize, redraw only needed partitions
     * @param {Object} stroke - The stroke to finalize
     */
    public completeStroke(stroke: ExStroke) {
        this.redrawCanvas(this.ctx, this.backCanvas);
        this.drawStroke(stroke);
        this.redrawCanvas(this.bCtx, this.canvas);
    }

    /**
     * Updates strokes by their ids
     */
    public doStrokes(ids: string[]) {
        /** Lock the canvas if we're redrawing */
        if(this.isRedrawing) { return; }
        this.isRedrawing = true;

        this.redrawCanvas(this.ctx, this.backCanvas);
        for(const id of ids)
        {
            this.drawStroke(this.strokes[id]);
        }
        this.isRedrawing = false;
    }

    /**
     * Draws a stroke onto the canvas
     * TODO: document the inside of this function
     * @param {Object} stroke - The Stroke to draw
     */
    public drawStroke(stroke: ExStroke) {
        if(this.debug) { console.time('draw'); }
        const tool = stroke.tool as ExBrush;
        this.sCtx.save();
        this.sCtx.clearRect(0, 0, this.width, this.height);

        /* Sets the correct context properties */
        this.sCtx = this.setContextValues(tool, this.sCtx);

        this.sCtx.beginPath();
        if(stroke.path.length > 3) {
            const len = stroke.path.length;
            const controls: number[] = stroke.controlPoints.concat(
                stroke.getControlPoints(stroke.path[len-3].x,
                                        stroke.path[len-3].y,
                                        stroke.path[len-2].x,
                                        stroke.path[len-2].y,
                                        stroke.path[len-1].x,
                                        stroke.path[len-1].y,
                                        .3));
            this.sCtx.beginPath();
            this.sCtx.lineWidth = tool.size * stroke.path[0].p;
            this.sCtx.moveTo(stroke.path[0].x,stroke.path[0].y);
            this.sCtx.quadraticCurveTo(controls[0],controls[1],stroke.path[1].x,stroke.path[1].y);
            this.sCtx.stroke();
            this.sCtx.closePath();

            for(let i = 0; i < len - 1; i += 1) {
                this.sCtx.beginPath();
                this.sCtx.moveTo(stroke.path[i].x, stroke.path[i].y);
                this.sCtx.lineWidth = (tool.size) * (stroke.path[i].p);
                // controls.length is x.length * 4
                this.sCtx.bezierCurveTo(controls[4*i-2],controls[4*i-1],controls[4*i],controls[4*i+1],stroke.path[i + 1].x,stroke.path[i + 1].y);
                this.sCtx.stroke();
                this.sCtx.closePath();
            }
        } else {
            // There are too few points to do a bezier curve, so we just draw the point
            this.sCtx.lineWidth = 1;
            this.sCtx.arc(stroke.path[0].x, stroke.path[0].y, tool.size * (1/2) * (stroke.path[0].p), 0, 2 * Math.PI, false);
            this.sCtx.fill();
        }
        this.sCtx.stroke();

        this.sCtx.globalCompositeOperation = "destination-out";
        this.sCtx.globalAlpha = 1 - tool.opacity;
        this.sCtx.fillStyle = "#ffffff";

        this.sCtx.fillRect(0, 0, this.width, this.height);
        this.sCtx.restore();

        this.ctx.save();
        if(stroke.tool.name === "Eraser") {
            this.ctx.globalCompositeOperation = "destination-out";
            this.ctx.globalAlpha = 1;
        }

        this.drawCanvas(this.ctx, this.strokeCanvas);
        this.ctx.restore();
        if(this.debug) { console.timeEnd('draw'); }
    }
}
