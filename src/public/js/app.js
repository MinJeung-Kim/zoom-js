const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras")

let myStream; // 비디오와 오디오가 결합된 스트림
let muted = false; // 오디오 켜진 상태
let cameraOff = false; // 비디오 켜진 상태

async function getCameras() {
    try {
        // user 장치 리스트 가져오기
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log('devices: ', devices);

        // 여러 내장 장치 중 카메라만 가져오기
        const cameras = devices.filter(device => device.kind === "videoinput");
        console.log('cameras: ', cameras);

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
        console.log('myStream: ', myStream);

        if (!deviceId) {
            await getCameras();
        }

    } catch (err) {
        console.log(err);
    }
}

// 페이지 로드 시 미디어 가져오기
getMedia();

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
    console.log('handleCameraChange: ', camerasSelect.value);
    await getMedia(camerasSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

