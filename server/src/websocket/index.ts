import { WebSocketServer } from "ws";
import type { Server } from "http";


export default function initWebSocket(server: Server) {
    const wss = new WebSocketServer({ server, path: "/ws", maxPayload: 1024 * 1024 });

    wss.on("connection", (socket, req) => {
        const ip = req.socket.remoteAddress;

        socket.on("message", (data) => {
            const message = data.toString();

            console.log(message)
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) client.send(message);
            })
        })

        socket.on("error", (error) => {
            console.error({ message: error.message, ip })
        })

        socket.on("close", () => {
            console.log("Cleint disconnected.")
        })
    })
}