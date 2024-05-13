import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.use("/public", express.static(__dirname + "/public"));
app.set("views", __dirname + "/public/views");

app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

// 1. connection 받을 준비
wsServer.on("connection", socket => {
    socket.on("enter_room", (roomName, done) => {
        // 2. room에 참가
        socket.join(roomName);
        // 3. front-end fn 실행
        done();
    });
});

/** 
const wss = new WebSocket.Server({ server });
const sockets = [];
wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anon";
    console.log("Connected to Browser ✅");
    socket.on("close", () => console.log("Disconnected from the Browser ❌"));

    socket.on("message", (msg) => {
        const message = JSON.parse(msg);

        switch (message.type) {
            case "new_message":
                sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${message.payload.toString()}`))
                break;
            case "nickname":
                socket["nickname"] = message.payload;
                break;
            default:
                break;
        }
    });
});
*/


httpServer.listen(3000, handleListen);


