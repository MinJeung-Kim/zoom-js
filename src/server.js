import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.use("/public", express.static(__dirname + "/public"));
app.set("views", __dirname + "/public/views");

app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });



// 연결 정보 저장 moc db
const sockets = []

wss.on("connection", (socket) => {
    // socket에서 누가 연결했는지 연결 정보확인
    // console.log(socket);
    sockets.push(socket);
    console.log("Connected to Browser ✅");
    socket.on("close", () => console.log("Disconnected from the Browser ❌"));

    // 서로 다른 브라우저에서 메세지를 주고 받지 못함
    // socket.on("message", (message) => socket.send(message.toString()));

    socket.on("message", (message) => {
        // 연결된 각각의 서로 다른 브라우저에 대한 메세지가 전송됨
        sockets.forEach(aSocket => aSocket.send(message.toString()))
    });
});

server.listen(3000, handleListen);


