const clientSocket = new WebSocket(`ws://${window.location.host}`); // "ws://localhost:3000"

// socket이 connection을 open 했을때 발생하는 함수
clientSocket.addEventListener("open", () => {
    console.log("Connected to Server ✅");
});

// server로 부터 메세지를 받았을 때 발생하는 함수.
clientSocket.addEventListener("message", (message) => {
    console.log("New message : ", message.data);
});

// server로 부터 연결이 끊겼을 때 발생하는 함수.
clientSocket.addEventListener("close", () => {
    console.log("Disconnected from the Server ❌");
});

setTimeout(() => {
    // backend로 메세지 전송
    clientSocket.send("hello from the browser!")
}, 10000);