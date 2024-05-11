const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");
const clientSocket = new WebSocket(`ws://${window.location.host}`); // "ws://localhost:3000"

// message를 string타입으로 server에 전송해주기 위한 함수.
// - 브라우저에서 지원해주는 api이므로, 어떤 판단도 하면 안돼서 string 타입만 허용.
function makeMessage(type, payload) {
    const msg = { type, payload };
    // javascript object를 string으로 변환
    return JSON.stringify(msg);
    // {"type":"nickname","payload":"chrome"}
    // {"type":"new_message","payload":"hello :)"}
}

// socket이 connection을 open 했을때 발생하는 함수
clientSocket.addEventListener("open", () => {
    console.log("Connected to Server ✅");
});

// server로 부터 메세지를 받았을 때 발생하는 함수.
clientSocket.addEventListener("message", (message) => {
    // 받은 메세지를 li태그를 생성하여 li태그에 넣어줌.
    const li = document.createElement("li");
    li.innerText = message.data;
    // 생성한 li태그를 ul(messageList)태그에 넣어줌.
    messageList.append(li);
});

// server로 부터 연결이 끊겼을 때 발생하는 함수.
clientSocket.addEventListener("close", () => {
    console.log("Disconnected from the Server ❌");
});

function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    clientSocket.send(makeMessage("new_message", input.value));
    input.value = "";
}

function handleNickSubmit(event) {
    event.preventDefault();
    const input = nickForm.querySelector("input");
    // json object 형태로 fronend에 message 전송.
    clientSocket.send(makeMessage("nickname", input.value));
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);