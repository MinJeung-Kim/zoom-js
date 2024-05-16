const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");

let myStream; // stream = 비디오와 오디오가 결합됨.
let muted = false; // 오디오 켜진상태
let cameraOff = false; // 비디오 켜진상태

async function getMedia() {
    try {
        myStream = await navigator.mediaDevices.getUserMedia({
            // 오디오와 비디오를 얻어오겠다.
            audio: true,
            video: true
        });
        myStream.srcObject = myStream;
        console.log(myStream);
    } catch (err) {
        console.log(err);
    }
}
function handleMuteClick() {
    // 음속어가 되어 있지 않다면
    if (!muted) {
        muteBtn.innerText = "Unmute";
        muted = true;
    } else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
}
function handleCameraClick() {
    if (cameraOff) {
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    } else {
        cameraBtn.innerText = "Turn Camera On";
        cameraOff = true;
    }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);