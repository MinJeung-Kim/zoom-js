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
    sockets.push(socket);
    // 익명(Anonymous)의 닉네임으로 초기화
    socket["nickname"] = "Anon";
    console.log("Connected to Browser ✅");
    socket.on("close", () => console.log("Disconnected from the Browser ❌"));

    socket.on("message", (msg) => {
        // string을 javascript object로 변환
        const message = JSON.parse(msg);
        // console.log(message, msg.toString());  // { type: 'nickname', payload: 'chrome' } {"type":"nickname","payload":"chrome"}

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

server.listen(3000, handleListen);


