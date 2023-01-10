const socket = io();
const myFace = document.getElementById("myFace");
const muteBtm = document.getElementById("mute");
const cameraBtm = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

async function getCameras(){
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput");
        const currentCamera = myStream.getVideoTracks()[0];
        // console.log(devices);
        // console.log(cameras);
        // console.log("videotrack:",myStream.getVideoTracks()[0].id);
        cameras.forEach(camera => {
            // console.log(camera);
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if(currentCamera.label === camera.label){
                option.selected = true;
            }
            camerasSelect.appendChild(option); 
        })
    } catch(e){
        console.log(e);
    }
}

async function getMedia(deviceId){
    const initialConstrains = {
        audio: true,
        video: {facingMode: "user"},

    };
    const cameraConstrains = {
        audio: true,
        video: {deviceId : {exact: deviceId}},
    };

    try{
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId? cameraConstrains : initialConstrains
        );
        myFace.srcObject = myStream;
        if(!deviceId)
        {
            await getCameras();
        }
    } catch(e){
        console.log(e);
    }
}


function hMuteClick(){
    // console.log(myStream.getAudioTracks());
    myStream.getAudioTracks().forEach((track)=>(track.enabled = !track.enabled));
    if(!muted){
        muteBtm.innerText = "Unmute"
        muted=true;
    }
    else{
        muteBtm.innerText = "Mute"
        muted=false;
    }
}

function hCameraClick(){
    // console.log(myStream.getVideoTracks());
    myStream.getVideoTracks().forEach((track)=>(track.enabled = !track.enabled));
    if(cameraOff){
        cameraBtm.innerText = "Camera Off"
        cameraOff = false;
    }
    else{
        cameraBtm.innerText = "Camera On"
        cameraOff = true;
    }
}

async function hCamChange(){
    console.log(camerasSelect.value);
    await getMedia(camerasSelect.value);
    if(myPeerConnection()){
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = myPeerConnection
            .getSenders()
            .find((sender)=>{sender.track.kind ==="video"});
        videoSender.replaceTrack(videoTrack);
    }
}


muteBtm.addEventListener("click", hMuteClick);
cameraBtm.addEventListener("click", hCameraClick);
camerasSelect.addEventListener("input", hCamChange);

///////////////////////// welcome form

const welcome = document.getElementById("welcome");
welcomeForm = welcome.querySelector("form");

// getMedia();
async function initCall(){
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

async function hWelcomeSubmit(event){
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall();//very fast
    socket.emit("join_room", input.value);
    roomName = input.value;
    input.value="";

};


welcomeForm.addEventListener("submit", hWelcomeSubmit);

//socket codes

//Peer A (먼저 들어온 쪽)에서만 실행됨.
socket.on("welcome", async ()=>{
    console.log("joined someone");//누군가 왔으므로 접속 오퍼를 보낸다.
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    console.log("send offer:", offer);
    //socketio로 offer를 보낸다.
    socket.emit("offer", offer, roomName);
});

//Peer B (나중쪽)에서만 실행
socket.on("offer", async (offer) =>{
    console.log("receive offer:", offer);
    //after receiving  offer,,,
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    console.log(answer);
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
    console.log("send answer");
}); 

//peer a
socket.on("answer", (answer) =>{
    console.log("rcv answer:",answer);//answer from peer a
    myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) =>{
    console.log("rcvd candid.");
    myPeerConnection.addIceCandidate(ice);
});

// rtc codes
function makeConnection(){
    myPeerConnection = new RTCPeerConnection();
    myPeerConnection.addEventListener("icecandidate", hIce);
    myPeerConnection.addEventListener("addstream", hAddStream);
    myStream
        .getTracks()
        .forEach((track) => myPeerConnection.addTrack(track, myStream));
};

function hIce(data){
    socket.emit("ice", data.candidate, roomName);
    console.log("sent candid.");
}

function hAddStream(data){
    console.log("peer's stream:", data.stream);    
    console.log("my stream:", myStream);    
    const peerFace = document.getElementById("peerFace");
    peerFace.srcObject=data.stream;
}