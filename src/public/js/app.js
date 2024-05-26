const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras")
const call = document.getElementById("call");


call.hidden = true;

let myStream; // 비디오와 오디오가 결합된 스트림
let muted = false; // 오디오 켜진 상태
let cameraOff = false; // 비디오 켜진 상태
let roomName;
let myPeerConnection;

async function getCameras() {
    try {
        // user 장치 리스트 가져오기
        const devices = await navigator.mediaDevices.enumerateDevices();
        // console.log('devices: ', devices);

        // 여러 내장 장치 중 카메라만 가져오기
        const cameras = devices.filter(device => device.kind === "videoinput");
        // console.log('cameras: ', cameras);

        const currentCamera = myStream.getVideoTracks()[0];

        // user camera list 생성
        cameras.forEach(camera => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            // 현재 사용중인 카메라와 select 박스의 옵션과 같으면 선택되게 설정
            if (currentCamera.label === camera.label) {
                option.selected = true;
            }
            camerasSelect.appendChild(option);
        })
    } catch (error) {
        console.log(error);
    }
}

async function getMedia(deviceId) {
    // deviceId가 없이 getMedia함수가 호출될 경우 초기 값.
    const initialConstrains = {
        audio: true,
        video: { facingMode: "user" }
    };
    const cameraConstrains = {
        audio: true,
        video: { deviceId: { exact: deviceId } }
    };
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstrains : initialConstrains
        );
        myFace.srcObject = myStream; // 스트림을 비디오 요소에 연결
        // console.log('myStream: ', myStream);

        if (!deviceId) {
            await getCameras();
        }

    } catch (err) {
        console.log(err);
    }
}

// 페이지 로드 시 미디어 가져오기
// getMedia();

function handleMuteClick() {
    console.log('getAudioTracks: ', myStream.getAudioTracks());
    myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled)); // 오디오 트랙을 음소거/음소거 해제
    if (!muted) {
        muteBtn.innerText = "Unmute";
        muted = true;
    } else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
}

function handleCameraClick() {
    myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled)); // 비디오 트랙을 켜기/끄기
    if (cameraOff) {
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    } else {
        cameraBtn.innerText = "Turn Camera On";
        cameraOff = true;
    }
}

async function handleCameraChange() {
    // console.log('handleCameraChange: ', camerasSelect.value);
    await getMedia(camerasSelect.value);
    if (myPeerConnection) {
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = myPeerConnection
            .getSenders()
            .find(sender => sender.track.kind === "video");
        videoSender.replaceTrack(videoTrack);
    }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);



// Welcome Form (join a room)
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall() {
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();

    makeConnection();
}

async function handleWelcomsSubmit(event) {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall();
    socket.emit("join_room", input.value);
    roomName = input.value; // room name 저장
    input.value = "";
};

welcomeForm.addEventListener("submit", handleWelcomsSubmit);

// Socket Code
socket.on("welcome", async () => {
    // peer A
    // offer를 만드는 행위를 시작하는 주체 = 방을 처음 생성한 브라우저
    // offer : 다른 브라우저가 참가할 수 있도록 초대장 생성
    const offer = await myPeerConnection.createOffer();

    // peer B에게 offer 전송
    myPeerConnection.setLocalDescription(offer);
    console.log("sent the offer");
    socket.emit("offer", offer, roomName);
});

// peer B
// 생성한 offer를 어떤 방에 보낼지 roomName도 같이 전송.
socket.on("offer", async (offer) => {
    console.log('received the offer');
    myPeerConnection.setRemoteDescription(offer);

    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
    console.log('sent the answer');
});

socket.on("answer", (answer) => {
    console.log('received the answer');
    myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
    console.log('received candidate');
    myPeerConnection.addIceCandidate(ice);
});

// RTC Code
function makeConnection() {
    // P2P 연결 생성
    myPeerConnection = new RTCPeerConnection({
        iceServers: [
            {
                // google에서 무료로 제공해주는 테스트용 리스트
                // 🌟실제 서비스에서는 직접 stun server 구현해야됨 
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302",
                ]
            }
        ]
    });
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream", handleAddStream);
    // 양쪽 브라우저의 stream(카메라와 마이크 정보)를 받아서 연결 
    myStream
        .getTracks()
        .forEach(track => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
    console.log('sent candidate');
    socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data) {
    console.log("got an Peer's Stream : ", data.stream);
    console.log("got an My Stream : ", myStream);

    const peerFace = document.getElementById("peerFace");
    peerFace.srcObject = data.stream;
}