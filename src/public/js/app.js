const socket = io(); // 실행중인 server의 socket을 찾음.

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

function backendDone(msg) {
    console.log(`The backend says: ${msg}`);
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", input.value, backendDone);
    input.value = "";

}
form.addEventListener("submit", handleRoomSubmit);