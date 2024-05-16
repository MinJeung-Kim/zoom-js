import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.use("/public", express.static(__dirname + "/public"));
app.set("views", __dirname + "/public/views");

app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true
    }
});

instrument(wsServer, {
    auth: false,
});

// 1. connection 받을 준비
wsServer.on("connection", socket => {

    // public rooms을 주는 function.
    function publicRooms() {
        // wsServer.socket.adapter로 부터 sids와 rooms를 가져옴.
        const { sockets: { adapter: { sids, rooms } } } = wsServer;
        // const sids = wsServer.socket.adapter.sids;
        // const rooms = wsServer.socket.adapter.rooms;
        const publicRooms = [];
        rooms.forEach((_, key) => {
            if (sids.get(key) === undefined) {
                publicRooms.push(key);
            };
        });
        return publicRooms;
    }

    function countRoom(roomName) {
        return wsServer.sockets.adapter.rooms.get(roomName)?.size;
    }

    socket["nickname"] = "Anon";
    socket.on("enter_room", (roomName, done) => {
        // 2. room에 참가
        socket.join(roomName);
        // 3. front-end fn 실행
        done();
        // 4. roomName에 있는 모든 사람들에게 welcome event를 emit.
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));

        // 모든 socket에 보냄.
        wsServer.sockets.emit("room_change", publicRooms());
    });

    // 5. roomName에 있는 모든 사람들에게 disconnecting event를 실행해서 
    // "bye"라는 메세지 전송.
    socket.on("disconnecting", () => {
        socket.rooms.forEach(room =>
            socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1));
    });

    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms());
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

