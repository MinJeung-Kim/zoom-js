const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form");
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

function handleSubmit(event) {
    event.preventDefault(); const input = messageForm.querySelector("input");
    clientSocket.send(input.value);
    input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);