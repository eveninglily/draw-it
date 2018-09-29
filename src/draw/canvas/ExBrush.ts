import ExTool from "src/draw/canvas/ExTool";

export default class ExBrush extends ExTool {
    public name: string;
    public size: number;
    public operation: any;
    public color: string;
    public opacity: number;

    constructor(name: string, size: number, operation: any, color: string) {
        super(name);
        this.size = size;
        this.opacity = 1;
        this.color = color;
        this.operation = operation;
    }
}