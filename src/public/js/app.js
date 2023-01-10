const socket = io();
const myFace = document.getElementById("myFace");
const muteBtm = document.getElementById("mute");
const cameraBtm = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

let myStream;
let muted = false;
let cameraOff = false;


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
}


muteBtm.addEventListener("click", hMuteClick);
cameraBtm.addEventListener("click", hCameraClick);
camerasSelect.addEventListener("input", hCamChange);

getMedia();
