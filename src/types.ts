import ExTool from "./draw/canvas/ExTool";

interface StartPayload {
    uuid: string,
    x: number,
    y: number,
    p: number,
    layer: number,
    tool: ExTool
}

interface MovePayload {
    uuid: string,
    positions: Array<{x: number, y: number, p: number}>
}

interface EndPayload {
    uuid: string,
    clientId: string,
    x: number,
    y: number,
    p: number,
    len: number,
}

interface RoomJoinPayload {
    id: string,
    username: string,
}

export { StartPayload, MovePayload, EndPayload, RoomJoinPayload }