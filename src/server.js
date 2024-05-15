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
    socket["nickname"] = "Anon";
    socket.on("enter_room", (roomName, done) => {
        // 2. room에 참가
        socket.join(roomName);
        // 3. front-end fn 실행
        done();
        // 4. roomName에 있는 모든 사람들에게 welcome event를 emit.
        socket.to(roomName).emit("welcome", socket.nickname);
    });

    // 5. roomName에 있는 모든 사람들에게 disconnecting event를 실행해서 
    // "bye"라는 메세지 전송.
    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname));
    });

    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });

    // nickname event가 발생하면 nickname를 가져와서 socket에 저장.
    socket.on("nickname", nickname => socket["nickname"] = nickname);
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

