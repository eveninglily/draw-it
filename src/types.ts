interface IExTool {
    name: string,
    active: boolean,
}

interface StartPayload {
    uuid: string,
    x: number,
    y: number,
    p: number,
    layer: number,
    tool: IExTool
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
    clientId: string,
    id: string,
    username: string,
}

interface UserJoinPayload {
    id: string;
    username: string;
}

export { IExTool, StartPayload, MovePayload, EndPayload, RoomJoinPayload, UserJoinPayload }