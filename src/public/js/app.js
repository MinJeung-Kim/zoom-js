const socket = io(); // 실행중인 server의 socket을 찾음.

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

// 1. room dom 숨기기
room.hidden = true;

let roomName;

function showRoom() {
    // 3. back-end에서 실행 시킨 함수 동작.
    welcome.hidden = true;
    room.hidden = false;
    // 5. 저장된 room name을 title로 넣어줌.
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
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