import ExTool from "src/draw/canvas/ExTool";

export default class ExStroke {
    public tool: ExTool;
    public path: Array<{x: number, y: number, p: number}>;
    public controlPoints: number[];

    constructor(tool: ExTool) {
        this.tool = tool;
        this.path = [];
        this.controlPoints = [];
    }
    
    public addPoint(x: number, y: number, p: number) {
        this.path.push({
            'p': p,
            'x': x,
            'y': y,
        });
        /**
         * Adds control points based on the new point
         */
        if(this.path.length > 3) {
            const pLen = this.path.length - 1;
            this.controlPoints = this.controlPoints.concat(
                this.getControlPoints(
                        this.path[pLen - 3].x, this.path[pLen - 3].y,
                        this.path[pLen - 2].x, this.path[pLen - 2].y,
                        this.path[pLen - 1].x, this.path[pLen - 1].y,
                    .3)
                );
        }
    }

    /**
     * Adds an array of (x, y, p) points
     */
    public addPoints(points: Array<{x: number, y: number, p: number}>) {
        for(const point of points) {
            this.addPoint(point.x, point.y, point.p);
        }
    }

    /**
     * Calculates control points
     */
    public getControlPoints(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, scale: number): number[] {
        /**
         * We first calculate the length of the straight lines from
         * p1 to p2 and p2 to p3.
         */
        const dist1 = Math.sqrt(Math.pow( x2 - x1, 2 ) + Math.pow( y2 - y1 , 2 ));
        const dist2 = Math.sqrt(Math.pow( x3 - x2, 2 ) + Math.pow( y3 - y2 , 2 ));

        /**
         * Using those, we figure out what percentage of
         * the given scale that will be used for each control point.
         */
        const scale1 = (scale * dist1) / (dist1 + dist2);
        const scale2 = scale - scale1;

        /**
         * We then create a right triangle,
         * using p1 and p3 as the two acute angles
         *
         * We then scale this triangle using scale1 and scale2, and use those
         * smaller triangles to branch out from p2 to get our two control points
         */
        const dx1 = x2 + scale1 * (x1 - x3);
        const dy1 = y2 + scale1 * (y1 - y3);

        const dx2 = x2 - scale2 * (x1 - x3);
        const dy2 = y2 - scale2 * (y1 - y3);

        return [dx1, dy1, dx2, dy2];
    }
}