import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

// pug로 views engine설정
app.set("view engine", "pug");
// 보안상 모든 파일을 user가 접근할 수 없게 
// user가 접근 가능한 폴더 설정 
app.use("/public", express.static(__dirname + "/public"));
app.set("views", __dirname + "/public/views");

// router handler
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
// app.listen(handleListen);

// 1. node.js에 내장되어 있는 http를 이용해서 http server 생성
const server = http.createServer(app);

// 2. WebSocket server 생성
// - http 서버와 webSocket 서버를 구동할 수 있음 (같은 port에 있게 하고 싶을 경우).
// - http 서버를 생성하는건 선택.
const wss = new WebSocket.Server({ server });



// 3. on() : event가 발동되는 걸 기다림
// - connection이 이루어지면 socket을 받음.
wss.on("connection", (socket) => {
    // socket에서 누가 연결했는지 연결 정보확인
    // console.log(socket);
    console.log("Connected to Browser ✅");
    // 6. 브라우저 연결이 끊기면(닫거나 새로고침) 발생하는 함수.
    socket.on("close", () => console.log("Disconnected from the Browser ❌"));

    // 7. frontend로 부터 message를 받았을 때 발생하는 함수.
    socket.on("message", (message) => console.log(message.toString()));
    // 5. frontend로 메세지 보내기
    socket.send("hello!!!");
});

server.listen(3000, handleListen);
