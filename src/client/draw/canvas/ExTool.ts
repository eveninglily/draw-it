import { IExTool } from "types";

export default class ExTool implements IExTool {
    public name: string;
    public active: boolean;

    constructor(name: string) {
        this.name = name;
        this.active = false;
    }

    public addCallback(id: string, event: any, callback: any) {
        /*document.getElementById(id)
                .addEventListener(event, evt => {
                    if(this.active) { callback (evt) }
                });*/
    }
}