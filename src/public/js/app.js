const socket = io(); // 실행중인 server의 socket을 찾음.

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

// 1. room dom 숨기기
room.hidden = true;

let roomName;

function addMessae(message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value
    // 8. input.value를 new_message라는 이벤트로 server에 전송.
    socket.emit("new_message", input.value, roomName, () => {
        addMessae(`You: ${value}`);
    });
    input.value = "";
}

function handleNicknameSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#name input");
    socket.emit("nickname", input.value);

}

function showRoom() {
    // 3. back-end에서 실행 시킨 함수 동작.
    welcome.hidden = true;
    room.hidden = false;
    // 5. 저장된 room name을 title로 넣어줌.
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    const msgForm = room.querySelector("#msg");
    const nameForm = room.querySelector("#name");
    msgForm.addEventListener("submit", handleMessageSubmit);
    nameForm.addEventListener("submit", handleNicknameSubmit);
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector("input");
    // 2. 방 이름(enter_room)을 가지고 방에 입장하면 
    // showRoom 함수 back-end에 보냄
    socket.emit("enter_room", input.value, showRoom);
    // 4. room name 변수에 저장.
    roomName = input.value;
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    // 6. 누군가가 입장했다는 message를 보냄.
    addMessae(`${user} arrived!`);
});

socket.on("bye", (left, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    // 7. 누군가가 나갔다는 message를 보냄.
    addMessae(`${left} left ㅠㅠ`);
});

socket.on("new_message", addMessae);
socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";

    if (rooms.length === 0) {
        return;
    }

    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
});